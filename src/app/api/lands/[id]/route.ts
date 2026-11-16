import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Land from '@/models/Land';
import Investment from '@/models/Investment';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const land = await Land.findById(id).lean();
    if (!land) {
      return NextResponse.json({ success: false, message: 'Land not found' }, { status: 404 });
    }

    // Get investors
    const investments = await Investment.find({ landId: id })
      .populate('customerId', 'fullName email mobile customerId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      land,
      investments,
    });
  } catch (error: any) {
    console.error('Fetch land detail error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch land details' },
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

    const land = await Land.findById(id);
    if (!land) {
      return NextResponse.json({ success: false, message: 'Land not found' }, { status: 404 });
    }

    // Don't allow reducing totalValue below totalInvested
    if (body.totalValue && body.totalValue < land.totalInvested) {
      return NextResponse.json(
        {
          success: false,
          message: `Total value cannot be lower than existing investments (₹${land.totalInvested.toLocaleString('en-IN')})`,
        },
        { status: 400 }
      );
    }

    if (body.dailyReturnConfig) {
      const rate =
        body.dailyReturnConfig.defaultRate ??
        body.dailyReturnConfig.baseRatePercentage ??
        land.dailyReturnConfig?.defaultRate ??
        0.1;
      body.dailyReturnConfig.defaultRate = rate;
      body.dailyReturnConfig.baseRatePercentage = rate;
    }

    if (body.images && Array.isArray(body.images)) {
      land.images = body.images;
      if (body.images.length > 0 && (!land.coverImage || !body.images.includes(land.coverImage))) {
        land.coverImage = body.images[0];
      } else if (body.images.length === 0) {
        land.coverImage = '';
      }
    }

    if (body.documents && Array.isArray(body.documents)) {
      land.documents = body.documents;
    }

    Object.assign(land, body);

    // Recalculate available investment and percentage
    land.availableInvestment = Math.max(0, land.totalValue - land.totalInvested);
    land.investmentPercentage =
      land.totalValue > 0 ? (land.totalInvested / land.totalValue) * 100 : 0;

    if (land.availableInvestment === 0) {
      land.status = 'fully_funded';
    }

    await land.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: 'LAND_UPDATED',
      module: 'land',
      details: { landId: land._id, updates: body },
    });

    return NextResponse.json({ success: true, land });
  } catch (error: any) {
    console.error('Update land error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update land' },
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

    const land = await Land.findById(id);
    if (!land) {
      return NextResponse.json({ success: false, message: 'Land not found' }, { status: 404 });
    }

    // Safety restriction: check if there are active investments
    const activeInvestments = await Investment.countDocuments({
      landId: id,
      status: { $in: ['active', 'matured'] },
    });

    if (activeInvestments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete land with ${activeInvestments} active or recorded customer investment(s). Archive or set status to inactive instead.`,
        },
        { status: 400 }
      );
    }

    await Land.findByIdAndDelete(id);

    await AuditLog.create({
      userId: decoded.userId,
      action: 'LAND_DELETED',
      module: 'land',
      details: { landId: id, name: land.name },
    });

    return NextResponse.json({ success: true, message: 'Land property deleted successfully' });
  } catch (error: any) {
    console.error('Delete land error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete land' },
      { status: 500 }
    );
  }
}

