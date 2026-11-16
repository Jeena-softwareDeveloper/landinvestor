import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyReturn from '@/models/DailyReturn';
import Transaction from '@/models/Transaction';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { updateReturnStatusSchema } from '@/lib/validations/returns';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const body = await req.json();
    const validated = updateReturnStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { returnIds, status } = validated.data;

    await connectDB();

    const updateFields: any = {
      status,
      verifiedBy: decoded.userId,
    };

    if (status === 'paid') {
      updateFields.paidAt = new Date();
    }

    const result = await DailyReturn.updateMany(
      { _id: { $in: returnIds } },
      { $set: updateFields }
    );

    // If marked as paid, create matching transaction records
    if (status === 'paid') {
      const paidReturns = await DailyReturn.find({ _id: { $in: returnIds } });
      for (const ret of paidReturns) {
        await Transaction.create({
          customerId: ret.customerId,
          investmentId: ret.investmentId,
          type: 'return_payment',
          amount: ret.dailyReturnAmount,
          upiReference: `RET-${ret._id.toString().substring(18).toUpperCase()}`,
          transactionDate: new Date(),
          paymentMethod: 'bank_transfer',
          adminNotes: `Daily return payout for ${ret.date.toISOString().split('T')[0]}`,
          status: 'completed',
          verifiedBy: decoded.userId,
          verifiedAt: new Date(),
        });
      }
    }

    await AuditLog.create({
      userId: decoded.userId,
      action: 'RETURNS_STATUS_UPDATED',
      module: 'returns',
      details: {
        count: result.modifiedCount,
        newStatus: status,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} return records to "${status}".`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Update return status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update returns' },
      { status: 500 }
    );
  }
}

