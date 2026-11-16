import connectDB from '@/lib/mongodb';
import TierConfig, { DEFAULT_TIERS, ITierItem } from '@/models/TierConfig';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';

export class TierService {
  /**
   * Get all active tier configurations from DB or default
   */
  public static async getTierConfigs(): Promise<{
    tiers: ITierItem[];
    defaultWithdrawalNotice: string;
  }> {
    await connectDB();
    const config = await TierConfig.findOne().lean();
    if (!config || !config.tiers || config.tiers.length === 0) {
      return {
        tiers: DEFAULT_TIERS,
        defaultWithdrawalNotice:
          'IMPORTANT NOTICE: In compliance with institutional real estate trust governance and commercial lease liquidity management, withdrawal limits are directly governed by your active investment capital and investor tier level.',
      };
    }
    return {
      tiers: config.tiers,
      defaultWithdrawalNotice: config.defaultWithdrawalNotice,
    };
  }

  /**
   * Determine tier from total investment amount
   */
  public static determineTierKey(
    totalInvested: number,
    tiers: ITierItem[]
  ): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    const sorted = [...tiers].sort((a, b) => b.minInvestment - a.minInvestment);
    for (const tier of sorted) {
      if (totalInvested >= tier.minInvestment) {
        return tier.key;
      }
    }
    return 'bronze'; // default base tier on first investment
  }

  /**
   * Recalculate customer tier & total investment
   */
  public static async syncCustomerTier(customerId: string) {
    await connectDB();
    const activeInvestments = await Investment.find({
      customerId,
      status: 'active',
    }).lean();

    const totalInvested = activeInvestments.reduce(
      (sum, i) => sum + (i.amount || 0),
      0
    );

    const { tiers } = await this.getTierConfigs();
    const tierKey = this.determineTierKey(totalInvested, tiers);

    await Customer.findByIdAndUpdate(customerId, {
      totalInvested,
      investorTier: tierKey,
    });

    const tierInfo = tiers.find((t) => t.key === tierKey) || tiers[0];
    return {
      totalInvested,
      tierKey,
      tierInfo,
    };
  }

  /**
   * Calculate withdrawal limit based on total active investment and tier
   */
  public static calculateWithdrawalLimit(
    totalInvested: number,
    tier: ITierItem
  ): number {
    if (totalInvested <= 0) {
      return 5000; // default initial withdrawal buffer
    }
    const limit = (totalInvested * (tier.withdrawalLimitPercentage || 15)) / 100;
    return Math.max(500, Math.round(limit));
  }
}

