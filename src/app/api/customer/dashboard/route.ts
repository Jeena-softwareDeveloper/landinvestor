import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Land from '@/models/Land';
import Investment from '@/models/Investment';
import PaymentOrder from '@/models/PaymentOrder';
import DailyReturn from '@/models/DailyReturn';
import Withdrawal from '@/models/Withdrawal';
import { TierService } from '@/services/tier.service';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const customer = await Customer.findById(decoded.mongoId).lean();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    // Aggregate Customer's Investments
    const investments = await Investment.find({ customerId: customer._id })
      .populate('landId', 'name location surveyNumber coverImage')
      .sort({ createdAt: -1 })
      .lean();

    const activeInvestments = investments.filter((i) => i.status === 'active');
    const totalInvested = activeInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);

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

    // Aggregate Pending Payment Orders
    const pendingOrders = await PaymentOrder.find({
      customerId: customer._id,
      status: { $in: ['initiated', 'pending', 'submitted', 'processing'] },
    })
      .populate('landId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Withdrawals
    const withdrawals = await Withdrawal.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const pendingWithdrawalAmount = withdrawals
      .filter((w) => w.status === 'pending' || w.status === 'processing')
      .reduce((sum, w) => sum + w.requestedAmount, 0);

    const paidWithdrawalAmount = withdrawals
      .filter((w) => w.status === 'paid')
      .reduce((sum, w) => sum + w.requestedAmount, 0);

    const totalReturnsPaid = (returnSummary[0]?.totalPaid || 0) + paidWithdrawalAmount;

    const availableWithdrawalBalance = Math.max(
      0,
      totalAccruedReturns - totalReturnsPaid - pendingWithdrawalAmount
    );

    // Sync & Calculate Investor Tier & Rewards
    const { tiers, defaultWithdrawalNotice } = await TierService.getTierConfigs();
    const currentTierKey = TierService.determineTierKey(totalInvested, tiers);
    const currentTier = tiers.find((t) => t.key === currentTierKey) || tiers[0];
    const maxWithdrawalLimit = TierService.calculateWithdrawalLimit(totalInvested, currentTier);

    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = tierOrder.indexOf(currentTierKey);
    const nextTier =
      currentIndex < tierOrder.length - 1
        ? tiers.find((t) => t.key === tierOrder[currentIndex + 1])
        : null;
    const nextTierProgress = nextTier
      ? Math.min(100, Math.round((totalInvested / nextTier.minInvestment) * 100))
      : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalInvested,
        totalAccruedReturns,
        totalReturnsPaid,
        activeInvestmentsCount: activeInvestments.length,
        pendingPaymentsCount: pendingOrders.length,
        availableWithdrawalBalance,
        walletBalance: customer.walletBalance || 0,
        kycStatus: customer.kycStatus,
        investorTier: currentTierKey,
        tierInfo: {
          ...currentTier,
          tierName: currentTier.name,
          maxWithdrawalLimit,
          totalInvested,
        },
        nextTier,
        nextTierProgress,
        maxWithdrawalLimit,
        defaultWithdrawalNotice,
      },
      recentInvestments: investments.slice(0, 4),
      recentOrders: pendingOrders.slice(0, 4),
      recentWithdrawals: withdrawals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to load customer dashboard' },
      { status: 500 }
    );
  }
}
