import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';
import DailyReturn from '@/models/DailyReturn';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import { TierService } from '@/services/tier.service';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const customer = await Customer.findById(decoded.mongoId).lean();
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    const [withdrawals, activeInvestments, { tiers, defaultWithdrawalNotice }] = await Promise.all([
      Withdrawal.find({ customerId: decoded.mongoId }).sort({ requestDate: -1 }).lean(),
      Investment.find({ customerId: decoded.mongoId, status: 'active' }).lean(),
      TierService.getTierConfigs(),
    ]);

    const totalInvested = activeInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const tierKey = TierService.determineTierKey(totalInvested, tiers);
    const tier = tiers.find((t) => t.key === tierKey) || tiers[0];
    const maxWithdrawalLimit = TierService.calculateWithdrawalLimit(totalInvested, tier);

    // Aggregate Returns
    const returnSummary = await DailyReturn.aggregate([
      { $match: { customerId: customer._id } },
      {
        $group: {
          _id: null,
          totalAccrued: { $sum: '$dailyReturnAmount' },
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$dailyReturnAmount', 0] },
          },
        },
      },
    ]);

    const investmentAccruedTotal = activeInvestments.reduce((sum, i) => sum + (i.totalAccruedReturn || 0), 0);
    const totalAccruedReturns = Math.max(returnSummary[0]?.totalAccrued || 0, investmentAccruedTotal);

    const pendingWithdrawalAmount = withdrawals
      .filter((w: any) => w.status === 'pending' || w.status === 'processing')
      .reduce((sum: number, w: any) => sum + (w.requestedAmount || 0), 0);

    const paidWithdrawalAmount = withdrawals
      .filter((w: any) => w.status === 'paid')
      .reduce((sum: number, w: any) => sum + (w.requestedAmount || 0), 0);

    const totalReturnsPaid = (returnSummary[0]?.totalPaid || 0) + paidWithdrawalAmount;

    const availableWithdrawalBalance = Math.max(
      0,
      totalAccruedReturns - totalReturnsPaid - pendingWithdrawalAmount
    );

    return NextResponse.json({
      success: true,
      withdrawals,
      total: withdrawals.length,
      availableBalance: availableWithdrawalBalance,
      totalAccruedReturns,
      totalReturnsPaid,
      tierInfo: {
        currentTier: tierKey,
        tierName: tier.name,
        name: tier.name,
        minInvestment: tier.minInvestment,
        withdrawalLimitPercentage: tier.withdrawalLimitPercentage,
        maxWithdrawalLimit,
        totalInvested,
        payoutSlaHours: tier.payoutSlaHours,
        awardTitle: tier.awardTitle,
        rewardsDescription: tier.rewardsDescription,
      },
      withdrawalNotice: defaultWithdrawalNotice,
      customerDetails: {
        upiId: customer.upiId || 'rajesh.sharma@okhdfcbank',
        bankDetails: customer.bankDetails,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const customer = await Customer.findById(decoded.mongoId);
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    const body = await req.json();
    const { amount, paymentMethod, paymentDetails, customerNotes } = body;

    const requestedAmount = parseFloat(amount);
    if (isNaN(requestedAmount) || requestedAmount < 500) {
      return NextResponse.json(
        { success: false, message: 'Minimum withdrawal amount is ₹500' },
        { status: 400 }
      );
    }

    const activeInvestments = await Investment.find({ customerId: customer._id, status: 'active' }).lean();
    const totalInvested = activeInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);

    // Aggregate returns
    const returnSummary = await DailyReturn.aggregate([
      { $match: { customerId: customer._id } },
      {
        $group: {
          _id: null,
          totalAccrued: { $sum: '$dailyReturnAmount' },
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$dailyReturnAmount', 0] },
          },
        },
      },
    ]);

    const investmentAccruedTotal = activeInvestments.reduce((sum, i) => sum + (i.totalAccruedReturn || 0), 0);
    const totalAccrued = Math.max(returnSummary[0]?.totalAccrued || 0, investmentAccruedTotal);

    const withdrawals = await Withdrawal.find({ customerId: customer._id });
    const paidAmount = withdrawals.filter((w) => w.status === 'paid').reduce((s, w) => s + w.requestedAmount, 0);
    const pendingAmount = withdrawals
      .filter((w) => w.status === 'pending' || w.status === 'processing')
      .reduce((s, w) => s + w.requestedAmount, 0);

    const totalPaid = (returnSummary[0]?.totalPaid || 0) + paidAmount;
    const availableBalance = Math.max(0, totalAccrued - totalPaid - pendingAmount);

    if (requestedAmount > availableBalance) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Available withdrawal balance is ₹${availableBalance.toLocaleString('en-IN')}`,
        },
        { status: 400 }
      );
    }

    // Enforce tier limit
    const { tiers } = await TierService.getTierConfigs();
    const tierKey = TierService.determineTierKey(totalInvested, tiers);
    const tier = tiers.find((t) => t.key === tierKey) || tiers[0];
    const maxWithdrawalLimit = TierService.calculateWithdrawalLimit(totalInvested, tier);

    if (requestedAmount > maxWithdrawalLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `Requested amount (₹${requestedAmount.toLocaleString('en-IN')}) exceeds your ${tier.name} withdrawal limit of ₹${maxWithdrawalLimit.toLocaleString('en-IN')} (${tier.withdrawalLimitPercentage}% of active investment).`,
        },
        { status: 400 }
      );
    }

    const withdrawal = await Withdrawal.create({
      customerId: customer._id,
      requestedAmount,
      availableBalance: availableBalance,
      upiId: customer.upiId || 'rajesh.sharma@okhdfcbank',
      bankDetails: customer.bankDetails || {
        accountHolderName: customer.fullName,
        accountNumber: '50100234567890',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0000053',
        branchName: '',
      },
      status: 'pending',
      requestDate: new Date(),
      customerNotes: customerNotes || 'Rental yield disbursement request',
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for ₹${requestedAmount.toLocaleString('en-IN')} submitted successfully! Expected turnaround: ${tier.payoutSlaHours}h SLA.`,
      withdrawal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
