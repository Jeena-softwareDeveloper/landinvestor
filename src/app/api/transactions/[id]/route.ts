import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const transaction = await Transaction.findById(id)
      .populate('customerId', 'fullName email mobile customerId upiId bankDetails')
      .populate('investmentId')
      .populate('verifiedBy', 'name email')
      .lean();

    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Fetch transaction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch transaction' },
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

    await connectDB();

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    // Verify / reject / complete action
    const oldStatus = transaction.status;
    if (body.status) {
      transaction.status = body.status;
      if (body.status === 'verified' || body.status === 'completed') {
        transaction.verifiedBy = decoded.userId as any;
        transaction.verifiedAt = new Date();
      }
    }

    if (body.adminNotes) {
      transaction.adminNotes = body.adminNotes;
    }

    await transaction.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: 'TRANSACTION_STATUS_UPDATED',
      module: 'transaction',
      details: {
        transactionId: id,
        fromStatus: oldStatus,
        toStatus: transaction.status,
        notes: body.adminNotes,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

