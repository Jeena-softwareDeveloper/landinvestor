import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TierConfig, { DEFAULT_TIERS } from '@/models/TierConfig';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    verifyToken(token);

    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let config: any = await TierConfig.findOne().lean();
    if (!config) {
      config = await TierConfig.create({
        tiers: DEFAULT_TIERS,
      });
    }

    return NextResponse.json({
      success: true,
      tiers: config?.tiers || DEFAULT_TIERS,
      defaultWithdrawalNotice: config?.defaultWithdrawalNotice || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    await connectDB();
    const body = await req.json();
    const { tiers, defaultWithdrawalNotice } = body;

    let config = await TierConfig.findOne();
    if (!config) {
      config = new TierConfig({
        tiers: tiers || DEFAULT_TIERS,
        defaultWithdrawalNotice,
      });
    } else {
      if (tiers) config.tiers = tiers;
      if (defaultWithdrawalNotice !== undefined) {
        config.defaultWithdrawalNotice = defaultWithdrawalNotice;
      }
    }

    await config.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: 'TIER_CONFIG_UPDATED',
      module: 'settings',
      details: {
        tiersCount: config.tiers.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Investor levels, awards, and withdrawal rules updated successfully!',
      config,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
