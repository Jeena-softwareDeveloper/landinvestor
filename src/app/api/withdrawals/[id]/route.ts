import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';
import Transaction from '@/models/Transaction';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { updateWithdrawalStatusSchema } from '@/lib/validations/withdrawal';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const withdrawal = await Withdrawal.findById(id)
      .populate('customerId', 'fullName email mobile customerId upiId bankDetails')
      .populate('approvedBy', 'name email')
      .lean();

    if (!withdrawal) {
      return NextResponse.json({ success: false, message: 'Withdrawal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: any) {
    console.error('Fetch withdrawal detail error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch withdrawal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const { id } = await params;
    const body = await req.json();
    const validated = updateWithdrawalStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    await connectDB();

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ success: false, message: 'Withdrawal not found' }, { status: 404 });
    }

    const { status, paymentReference, paymentProof, rejectionReason } = validated.data;
    const oldStatus = withdrawal.status;

    withdrawal.status = status;

    if (status === 'approved' || status === 'paid') {
      withdrawal.approvedBy = decoded.userId as any;
      withdrawal.approvedAt = new Date();
    }

    if (paymentReference) withdrawal.paymentReference = paymentReference;
    if (paymentProof) withdrawal.paymentProof = paymentProof;
    if (rejectionReason) withdrawal.rejectionReason = rejectionReason;

    await withdrawal.save();

    // If marked as paid, record matching Withdrawal Transaction
    if (status === 'paid') {
      await Transaction.create({
        customerId: withdrawal.customerId,
        type: 'withdrawal',
        amount: withdrawal.requestedAmount,
        upiId: withdrawal.upiId,
        upiReference: paymentReference || `WD-${withdrawal._id.toString().substring(18).toUpperCase()}`,
        transactionDate: new Date(),
        paymentMethod: withdrawal.upiId ? 'upi' : 'bank_transfer',
        adminNotes: `Withdrawal payout for request #${withdrawal._id}`,
        status: 'completed',
        verifiedBy: decoded.userId,
        verifiedAt: new Date(),
      });
    }

    await AuditLog.create({
      userId: decoded.userId,
      action: 'WITHDRAWAL_STATUS_UPDATED',
      module: 'withdrawal',
      details: {
        withdrawalId: id,
        fromStatus: oldStatus,
        toStatus: status,
        paymentReference,
      },
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: any) {
    console.error('Update withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update withdrawal' },
      { status: 500 }
    );
  }
}

