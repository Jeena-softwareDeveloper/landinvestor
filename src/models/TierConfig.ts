import mongoose, { Schema, Model } from 'mongoose';

export interface ITierItem {
  key: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  name: string;
  minInvestment: number;
  dailyBonusRate: number; // in percentage e.g. 0.05
  withdrawalLimitPercentage: number; // e.g. 15, 30, 50, 75, 100
  payoutSlaHours: number;
  awardTitle: string;
  rewardsDescription: string;
  badgeColor: string;
}

export interface ITierConfigDocument extends mongoose.Document {
  tiers: ITierItem[];
  defaultWithdrawalNotice: string;
  updatedAt: Date;
}

export const DEFAULT_TIERS: ITierItem[] = [
  {
    key: 'bronze',
    name: 'Bronze Investor',
    minInvestment: 50000,
    dailyBonusRate: 0.0,
    withdrawalLimitPercentage: 15,
    payoutSlaHours: 72,
    awardTitle: 'Bronze Co-Investor Medal',
    rewardsDescription: 'Base tier unlocked on first investment. 100% legal title deeds & standard daily yield.',
    badgeColor: 'amber',
  },
  {
    key: 'silver',
    name: 'Silver Investor',
    minInvestment: 200000,
    dailyBonusRate: 0.05,
    withdrawalLimitPercentage: 30,
    payoutSlaHours: 48,
    awardTitle: 'Silver Executive Trophy',
    rewardsDescription: '+0.05% daily bonus return, 30% withdrawal limit, 48h priority payout review.',
    badgeColor: 'slate',
  },
  {
    key: 'gold',
    name: 'Gold Investor',
    minInvestment: 1000000,
    dailyBonusRate: 0.1,
    withdrawalLimitPercentage: 50,
    payoutSlaHours: 24,
    awardTitle: 'Gold Institutional Shield',
    rewardsDescription: '+0.10% daily bonus return, 50% withdrawal limit, 24h fast-track payouts, dedicated advisor.',
    badgeColor: 'yellow',
  },
  {
    key: 'platinum',
    name: 'Platinum Investor',
    minInvestment: 2500000,
    dailyBonusRate: 0.2,
    withdrawalLimitPercentage: 75,
    payoutSlaHours: 12,
    awardTitle: 'Platinum Sovereign Crest',
    rewardsDescription: '+0.20% daily bonus return, 75% withdrawal limit, 12h express payouts, exclusive land pre-allocations.',
    badgeColor: 'cyan',
  },
  {
    key: 'diamond',
    name: 'Diamond Investor',
    minInvestment: 5000000,
    dailyBonusRate: 0.35,
    withdrawalLimitPercentage: 100,
    payoutSlaHours: 2,
    awardTitle: 'REITs Council Diamond Crown',
    rewardsDescription: '+0.35% daily bonus return, 100% full liquidity withdrawal, Instant VIP UPI payouts, Trust Board governance seat.',
    badgeColor: 'indigo',
  },
];

const TierItemSchema = new Schema<ITierItem>({
  key: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    required: true,
  },
  name: { type: String, required: true },
  minInvestment: { type: Number, required: true },
  dailyBonusRate: { type: Number, default: 0 },
  withdrawalLimitPercentage: { type: Number, default: 20 },
  payoutSlaHours: { type: Number, default: 48 },
  awardTitle: { type: String, default: '' },
  rewardsDescription: { type: String, default: '' },
  badgeColor: { type: String, default: 'blue' },
});

const TierConfigSchema = new Schema<ITierConfigDocument>(
  {
    tiers: {
      type: [TierItemSchema],
      default: DEFAULT_TIERS,
    },
    defaultWithdrawalNotice: {
      type: String,
      default:
        'IMPORTANT NOTICE: In compliance with institutional real estate trust governance and commercial lease liquidity management, withdrawal limits are directly tied to your total active investment and investor tier level to protect underlying property yields.',
    },
  },
  { timestamps: true }
);

const TierConfig: Model<ITierConfigDocument> =
  mongoose.models.TierConfig ||
  mongoose.model<ITierConfigDocument>('TierConfig', TierConfigSchema);

export default TierConfig;

