import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Investment from '@/models/Investment';
import Land from '@/models/Land';
import DailyReturn from '@/models/DailyReturn';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const investment = await Investment.findById(id)
      .populate('customerId', 'fullName email mobile customerId bankDetails upiId')
      .populate('landId', 'name location totalValue surveyNumber status')
      .lean();

    if (!investment) {
      return NextResponse.json({ success: false, message: 'Investment not found' }, { status: 404 });
    }

    const returns = await DailyReturn.find({ investmentId: id }).sort({ date: -1 }).limit(60).lean();

    return NextResponse.json({
      success: true,
      investment,
      returns,
    });
  } catch (error: any) {
    console.error('Fetch investment detail error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch investment details' },
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

    const investment = await Investment.findById(id);
    if (!investment) {
      return NextResponse.json({ success: false, message: 'Investment not found' }, { status: 404 });
    }

    if (body.status) investment.status = body.status;
    if (body.returnRate !== undefined) {
      investment.returnRate = body.returnRate;
      investment.dailyAccruedReturn = (investment.amount * investment.returnRate) / 100;
      investment.monthlyAccruedReturn = investment.dailyAccruedReturn * 30;
      investment.totalAccruedReturn = investment.monthlyAccruedReturn * investment.duration;
      investment.maturityAmount = investment.amount + investment.totalAccruedReturn;
    }
    if (body.notes) investment.notes = body.notes;

    await investment.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: 'INVESTMENT_UPDATED',
      module: 'investment',
      details: { investmentId: investment._id, updates: body },
    });

    return NextResponse.json({ success: true, investment });
  } catch (error: any) {
    console.error('Update investment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update investment' },
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

    const investment = await Investment.findById(id);
    if (!investment) {
      return NextResponse.json({ success: false, message: 'Investment not found' }, { status: 404 });
    }

    // Restore land available capacity if active
    if (investment.status === 'active') {
      const land = await Land.findById(investment.landId);
      if (land) {
        land.totalInvested = Math.max(0, land.totalInvested - investment.amount);
        land.availableInvestment = Math.max(0, land.totalValue - land.totalInvested);
        land.investmentPercentage =
          land.totalValue > 0 ? (land.totalInvested / land.totalValue) * 100 : 0;
        if (land.status === 'fully_funded' && land.availableInvestment > 0) {
          land.status = 'active';
        }
        await land.save();
      }
    }

    investment.status = 'cancelled';
    await investment.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: 'INVESTMENT_CANCELLED',
      module: 'investment',
      details: { investmentId: id, amount: investment.amount },
    });

    return NextResponse.json({ success: true, message: 'Investment cancelled and capacity restored' });
  } catch (error: any) {
    console.error('Cancel investment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel investment' },
      { status: 500 }
    );
  }
}

