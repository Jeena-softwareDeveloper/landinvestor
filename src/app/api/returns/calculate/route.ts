import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Investment from '@/models/Investment';
import DailyReturn from '@/models/DailyReturn';
import Customer from '@/models/Customer';
import { TierService } from '@/services/tier.service';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { calculateReturnsSchema } from '@/lib/validations/returns';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const body = await req.json();
    const validated = calculateReturnsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { date, landId, overrideRate } = validated.data;
    const calcDate = new Date(date);
    calcDate.setHours(0, 0, 0, 0);

    const endOfCalcDate = new Date(calcDate);
    endOfCalcDate.setHours(23, 59, 59, 999);

    await connectDB();

    // 1. Fetch active investments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: 'active',
      startDate: { $lte: endOfCalcDate },
    };
    if (landId && landId !== 'all') {
      query.landId = landId;
    }

    const activeInvestments = await Investment.find(query);

    if (activeInvestments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active investments eligible for return calculation on this date.',
        accruedCount: 0,
        totalAmount: 0,
      });
    }

    let accruedCount = 0;
    let skippedCount = 0;
    let totalAccruedAmount = 0;

    const { tiers } = await TierService.getTierConfigs();

    for (const inv of activeInvestments) {
      // Check if return was already calculated for this investment on this date
      const existing = await DailyReturn.findOne({
        investmentId: inv._id,
        date: { $gte: calcDate, $lte: endOfCalcDate },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Fetch customer tier bonus yield
      const customer = await Customer.findById(inv.customerId).select('investorTier').lean();
      const customerTier = tiers.find((t) => t.key === (customer?.investorTier || 'bronze'));
      const tierBonus = customerTier?.dailyBonusRate || 0;

      const baseRate = overrideRate !== undefined ? overrideRate : inv.returnRate;
      const effectiveRate = parseFloat((baseRate + tierBonus).toFixed(4));
      const dailyReturnAmount = Math.round(((inv.amount * effectiveRate) / 100) * 100) / 100;

      await DailyReturn.create({
        investmentId: inv._id,
        customerId: inv.customerId,
        landId: inv.landId,
        date: calcDate,
        investmentAmount: inv.amount,
        returnRate: effectiveRate,
        dailyReturnAmount,
        status: 'accrued', // Accrued only - not credited or paid without verification
      });

      // Update investment running accrued total
      inv.totalAccruedReturn = (inv.totalAccruedReturn || 0) + dailyReturnAmount;
      await inv.save();

      accruedCount++;
      totalAccruedAmount += dailyReturnAmount;
    }

    await AuditLog.create({
      userId: decoded.userId,
      action: 'DAILY_RETURNS_CALCULATED',
      module: 'returns',
      details: {
        date: calcDate,
        landId: landId || 'all',
        accruedCount,
        skippedCount,
        totalAccruedAmount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Return calculation completed. ${accruedCount} records accrued (Total: ₹${totalAccruedAmount.toLocaleString('en-IN')}). ${skippedCount} previously accrued skipped.`,
      accruedCount,
      skippedCount,
      totalAccruedAmount,
    });
  } catch (error: any) {
    console.error('Calculate returns error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Return calculation failed' },
      { status: 500 }
    );
  }
}

