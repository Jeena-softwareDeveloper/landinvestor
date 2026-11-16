import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Investment from '@/models/Investment';
import Land from '@/models/Land';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { investmentSchema } from '@/lib/validations/investment';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const customerId = searchParams.get('customerId') || '';
    const landId = searchParams.get('landId') || '';
    const status = searchParams.get('status') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (customerId) query.customerId = customerId;
    if (landId) query.landId = landId;
    if (status && status !== 'all') query.status = status;

    const skip = (page - 1) * limit;

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .populate('customerId', 'fullName email mobile customerId')
        .populate('landId', 'name location totalValue surveyNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Investment.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      investments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch investments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const body = await req.json();
    const validated = investmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    const {
      customerId,
      landId,
      amount,
      startDate,
      duration,
      returnRate,
      paymentReference,
      notes,
    } = validated.data;

    await connectDB();

    // 1. Verify customer exists and is active
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }
    if (customer.accountStatus !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Customer account is not active' },
        { status: 400 }
      );
    }

    // 2. Verify land exists and has sufficient available capacity
    const land = await Land.findById(landId);
    if (!land) {
      return NextResponse.json({ success: false, message: 'Land property not found' }, { status: 404 });
    }
    if (land.status === 'inactive') {
      return NextResponse.json(
        { success: false, message: 'This land property is inactive and cannot accept investments.' },
        { status: 400 }
      );
    }

    if (amount > land.availableInvestment) {
      return NextResponse.json(
        {
          success: false,
          message: `Investment amount (₹${amount.toLocaleString('en-IN')}) exceeds available capacity of ₹${land.availableInvestment.toLocaleString('en-IN')}`,
        },
        { status: 400 }
      );
    }

    // 3. Compute business rules & financial projections
    // Return calculations are clearly projected
    const investmentPercentage =
      land.totalValue > 0 ? (amount / land.totalValue) * 100 : 0;
    const dailyAccruedReturn = (amount * returnRate) / 100;
    const monthlyAccruedReturn = dailyAccruedReturn * 30;
    const totalAccruedReturn = monthlyAccruedReturn * duration;
    const maturityAmount = amount + totalAccruedReturn;

    // 4. Create investment
    const investment = await Investment.create({
      customerId,
      landId,
      amount,
      startDate: new Date(startDate),
      duration,
      returnRate,
      status: 'active',
      paymentReference,
      investmentPercentage,
      dailyAccruedReturn,
      monthlyAccruedReturn,
      totalAccruedReturn,
      maturityAmount,
      notes,
    });

    // 5. Update land allocation
    land.totalInvested += amount;
    land.availableInvestment = Math.max(0, land.totalValue - land.totalInvested);
    land.investmentPercentage = (land.totalInvested / land.totalValue) * 100;
    if (land.availableInvestment === 0) {
      land.status = 'fully_funded';
    }
    await land.save();

    // 6. Record matching deposit transaction
    await Transaction.create({
      customerId,
      investmentId: investment._id,
      type: 'deposit',
      amount,
      upiReference: paymentReference,
      transactionDate: new Date(startDate),
      paymentMethod: 'upi',
      adminNotes: `Initial investment deposit for ${land.name}`,
      status: 'completed',
      verifiedBy: decoded.userId,
      verifiedAt: new Date(),
    });

    // 7. Audit log
    await AuditLog.create({
      userId: decoded.userId,
      action: 'INVESTMENT_CREATED',
      module: 'investment',
      details: {
        investmentId: investment._id,
        customerId,
        landId,
        amount,
        returnRate,
      },
    });

    return NextResponse.json({ success: true, investment }, { status: 201 });
  } catch (error: any) {
    console.error('Create investment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create investment' },
      { status: 500 }
    );
  }
}
