import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';
import Customer from '@/models/Customer';
import DailyReturn from '@/models/DailyReturn';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { withdrawalSchema } from '@/lib/validations/withdrawal';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (customerId) query.customerId = customerId;

    const skip = (page - 1) * limit;

    const [withdrawals, total, stats] = await Promise.all([
      Withdrawal.find(query)
        .populate('customerId', 'fullName email mobile customerId upiId bankDetails')
        .populate('approvedBy', 'name email')
        .sort({ requestDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments(query),
      Withdrawal.aggregate([
        {
          $group: {
            _id: null,
            totalPendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$requestedAmount', 0] },
            },
            totalPaidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$requestedAmount', 0] },
            },
            pendingCount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      withdrawals,
      stats: stats[0] || { totalPendingAmount: 0, totalPaidAmount: 0, pendingCount: 0 },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch withdrawals' },
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
    const validated = withdrawalSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { customerId, requestedAmount, upiId, bankDetails, notes } = validated.data;

    await connectDB();

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    // Calculate customer available balance (Verified/Paid returns minus existing pending/paid withdrawals)
    const [accruedReturns, existingWithdrawals] = await Promise.all([
      DailyReturn.aggregate([
        { $match: { customerId: customer._id, status: { $in: ['verified', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$dailyReturnAmount' } } },
      ]),
      Withdrawal.aggregate([
        { $match: { customerId: customer._id, status: { $in: ['pending', 'approved', 'processing', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
      ]),
    ]);

    const totalEligibleReturns = accruedReturns[0]?.total || 0;
    const totalClaimedWithdrawals = existingWithdrawals[0]?.total || 0;
    const availableBalance = Math.max(0, totalEligibleReturns - totalClaimedWithdrawals);

    // Prevent withdrawal exceeding available balance
    if (requestedAmount > availableBalance && availableBalance > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Requested amount (₹${requestedAmount.toLocaleString('en-IN')}) exceeds customer available balance of ₹${availableBalance.toLocaleString('en-IN')}`,
        },
        { status: 400 }
      );
    }

    const withdrawal = await Withdrawal.create({
      customerId,
      requestedAmount,
      availableBalance: availableBalance || requestedAmount,
      upiId: upiId || customer.upiId,
      bankDetails: bankDetails || customer.bankDetails,
      requestDate: new Date(),
      status: 'pending',
      notes,
    });

    await AuditLog.create({
      userId: decoded.userId,
      action: 'WITHDRAWAL_REQUESTED',
      module: 'withdrawal',
      details: {
        withdrawalId: withdrawal._id,
        customerId,
        requestedAmount,
      },
    });

    return NextResponse.json({ success: true, withdrawal }, { status: 201 });
  } catch (error: any) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit withdrawal' },
      { status: 500 }
    );
  }
}
