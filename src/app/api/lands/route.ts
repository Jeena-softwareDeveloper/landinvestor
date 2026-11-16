import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Land from '@/models/Land';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { landSchema } from '@/lib/validations/land';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { surveyNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [lands, total] = await Promise.all([
      Land.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Land.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      lands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch lands error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lands' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);

    const body = await req.json();
    const validated = landSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validated.error.format() },
        { status: 400 }
      );
    }

    await connectDB();

    // Check unique survey number
    const existing = await Land.findOne({ surveyNumber: validated.data.surveyNumber });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A land property with this survey number already exists.' },
        { status: 409 }
      );
    }

    const landData = {
      ...validated.data,
      availableInvestment: validated.data.availableInvestment ?? validated.data.totalValue,
      totalInvested: 0,
      investmentPercentage: 0,
    };

    const newLand = await Land.create(landData);

    await AuditLog.create({
      userId: decoded.userId,
      action: 'LAND_CREATED',
      module: 'land',
      details: { landId: newLand._id, name: newLand.name, totalValue: newLand.totalValue },
    });

    return NextResponse.json({ success: true, land: newLand }, { status: 201 });
  } catch (error: any) {
    console.error('Create land error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create land' },
      { status: 500 }
    );
  }
}
