import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import Transaction from '@/models/Transaction';
import DailyReturn from '@/models/DailyReturn';
import Withdrawal from '@/models/Withdrawal';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    // Fetch related records in parallel
    const [investments, transactions, dailyReturns, withdrawals] = await Promise.all([
      Investment.find({ customerId: id }).populate('landId', 'name location surveyNumber').sort({ createdAt: -1 }).lean(),
      Transaction.find({ customerId: id }).sort({ transactionDate: -1 }).lean(),
      DailyReturn.find({ customerId: id }).populate('landId', 'name').sort({ date: -1 }).limit(30).lean(),
      Withdrawal.find({ customerId: id }).sort({ requestDate: -1 }).lean(),
    ]);

    // Financial summaries
    const totalInvestments = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activeInvestments = investments
      .filter((inv) => inv.status === 'active')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const totalReturnsAccrued = dailyReturns.reduce(
      (sum, r) => sum + (r.dailyReturnAmount || 0),
      0
    );
    const totalReturnsPaid = dailyReturns
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + (r.dailyReturnAmount || 0), 0);

    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'pending')
      .reduce((sum, w) => sum + (w.requestedAmount || 0), 0);

    return NextResponse.json({
      success: true,
      customer,
      stats: {
        totalInvestments,
        activeInvestments,
        totalReturnsAccrued,
        totalReturnsPaid,
        pendingWithdrawals,
      },
      investments,
      transactions,
      dailyReturns,
      withdrawals,
    });
  } catch (error: any) {
    console.error('Fetch customer detail error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer details' },
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

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    Object.assign(customer, body);
    await customer.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: 'CUSTOMER_UPDATED',
      module: 'customer',
      details: { customerId: customer._id, updates: body },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const { id } = await params;
    await connectDB();

    const activeInvestments = await Investment.countDocuments({
      customerId: id,
      status: 'active',
    });

    if (activeInvestments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot deactivate or remove customer with ${activeInvestments} active investment(s).`,
        },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(id);
    if (customer) {
      customer.accountStatus = 'inactive';
      await customer.save();
    }

    await AuditLog.create({
      userId: decoded.userId,
      action: 'CUSTOMER_DEACTIVATED',
      module: 'customer',
      details: { customerId: id },
    });

    return NextResponse.json({ success: true, message: 'Customer marked as inactive' });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to deactivate customer' },
      { status: 500 }
    );
  }
}
