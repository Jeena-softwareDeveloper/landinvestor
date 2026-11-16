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

    return NextResponse.json({
      success: true,
      withdrawals,
      total: withdrawals.length,
      tierInfo: {
        currentTier: tierKey,
        tierName: tier.name,
        minInvestment: tier.minInvestment,
        withdrawalLimitPercentage: tier.withdrawalLimitPercentage,
        maxWithdrawalLimit,
        totalInvested,
        payoutSlaHours: tier.payoutSlaHours,
        awardTitle: tier.awardTitle,
        rewardsDescription: tier.rewardsDescription,
      },
      withdrawalNotice: defaultWithdrawalNotice,
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

    // Check customer available returns balance
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

    const totalAccrued = returnSummary[0]?.totalAccrued || 0;
    const totalPaid = returnSummary[0]?.totalPaid || 0;

    const pendingWithdrawals = await Withdrawal.find({
      customerId: customer._id,
      status: { $in: ['pending', 'processing'] },
    });
    const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.requestedAmount, 0);

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

    // Enforce investment-based withdrawal limit based on investor tier
    const activeInvestments = await Investment.find({ customerId: customer._id, status: 'active' }).lean();
    const totalInvested = activeInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const { tiers } = await TierService.getTierConfigs();
    const tierKey = TierService.determineTierKey(totalInvested, tiers);
    const tier = tiers.find((t) => t.key === tierKey) || tiers[0];
    const maxWithdrawalLimit = TierService.calculateWithdrawalLimit(totalInvested, tier);

    if (requestedAmount > maxWithdrawalLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `Requested amount (₹${requestedAmount.toLocaleString('en-IN')}) exceeds your ${tier.name} withdrawal limit of ₹${maxWithdrawalLimit.toLocaleString('en-IN')} (${tier.withdrawalLimitPercentage}% of your active investment of ₹${totalInvested.toLocaleString('en-IN')}). In accordance with REITs governance, withdrawal limits protect commercial lease continuity.`,
        },
        { status: 400 }
      );
    }

    const withdrawal = await Withdrawal.create({
      customerId: customer._id,
      requestedAmount,
      availableBalanceAtRequest: availableBalance,
      paymentMethod: paymentMethod || 'upi',
      paymentDetails: paymentDetails || {
        upiId: customer.upiId,
        bankDetails: customer.bankDetails,
      },
      status: 'pending',
      requestDate: new Date(),
      customerNotes: customerNotes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Awaiting admin review.',
      withdrawal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

