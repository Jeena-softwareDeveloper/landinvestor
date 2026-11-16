import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Investment from '@/models/Investment';
import AuditLog from '@/models/AuditLog';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { customerSchema } from '@/lib/validations/customer';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const kycStatus = searchParams.get('kycStatus') || '';
    const accountStatus = searchParams.get('accountStatus') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
      ];
    }

    if (kycStatus && kycStatus !== 'all') {
      query.kycStatus = kycStatus;
    }

    if (accountStatus && accountStatus !== 'all') {
      query.accountStatus = accountStatus;
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);

    // Attach total investments for each customer
    const customerIds = customers.map((c) => c._id);
    const investmentTotals = await Investment.aggregate([
      { $match: { customerId: { $in: customerIds }, status: 'active' } },
      { $group: { _id: '$customerId', totalAmount: { $sum: '$amount' } } },
    ]);

    const totalMap = new Map<string, number>();
    investmentTotals.forEach((it) => {
      totalMap.set(it._id.toString(), it.totalAmount);
    });

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      totalInvestment: totalMap.get(c._id.toString()) || 0,
    }));

    return NextResponse.json({
      success: true,
      customers: enrichedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
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
    const validated = customerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    await connectDB();

    // Check unique email and mobile
    const existing = await Customer.findOne({
      $or: [{ email: validated.data.email.toLowerCase() }, { mobile: validated.data.mobile }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A customer with this email or mobile number already exists.' },
        { status: 409 }
      );
    }

    // Auto-generate customer ID: CUST-XXXXX
    const count = await Customer.countDocuments();
    const customerId = `CUST-${(10001 + count).toString()}`;

    const newCustomer = await Customer.create({
      ...validated.data,
      customerId,
      email: validated.data.email.toLowerCase(),
    });

    await AuditLog.create({
      userId: decoded.userId,
      action: 'CUSTOMER_CREATED',
      module: 'customer',
      details: { customerId: newCustomer._id, code: customerId, name: newCustomer.fullName },
    });

    return NextResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  } catch (error: any) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
