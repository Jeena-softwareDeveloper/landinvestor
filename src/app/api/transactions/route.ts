import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { transactionSchema } from '@/lib/validations/transaction';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { upiReference: { $regex: search, $options: 'i' } },
        { upiId: { $regex: search, $options: 'i' } },
        { adminNotes: { $regex: search, $options: 'i' } },
      ];
    }

    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (customerId) query.customerId = customerId;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('customerId', 'fullName email mobile customerId')
        .populate('investmentId', 'amount landId')
        .sort({ transactionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const body = await req.json();
    const validated = transactionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validated.error.format() },
        { status: 400 }
      );
    }

    const {
      customerId,
      investmentId,
      type,
      amount,
      upiId,
      upiReference,
      transactionDate,
      paymentMethod,
      screenshotUrl,
      adminNotes,
      status,
    } = validated.data;

    await connectDB();

    // Critical Requirement: Check duplicate transaction reference / UTR
    const duplicate = await Transaction.findOne({
      upiReference: { $regex: new RegExp(`^${upiReference.trim()}$`, 'i') },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate Transaction Reference! UTR/Ref "${upiReference}" was already recorded on ${new Date(
            duplicate.transactionDate
          ).toLocaleDateString()}.`,
        },
        { status: 409 }
      );
    }

    const tx = await Transaction.create({
      customerId,
      investmentId: investmentId || undefined,
      type,
      amount,
      upiId,
      upiReference: upiReference.trim(),
      transactionDate: new Date(transactionDate),
      paymentMethod,
      screenshotUrl,
      adminNotes,
      status: status || 'pending',
      verifiedBy: status === 'verified' || status === 'completed' ? decoded.userId : undefined,
      verifiedAt: status === 'verified' || status === 'completed' ? new Date() : undefined,
    });

    await AuditLog.create({
      userId: decoded.userId,
      action: 'TRANSACTION_RECORDED',
      module: 'transaction',
      details: {
        transactionId: tx._id,
        customerId,
        type,
        amount,
        reference: upiReference,
        status: tx.status,
      },
    });

    return NextResponse.json({ success: true, transaction: tx }, { status: 201 });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
