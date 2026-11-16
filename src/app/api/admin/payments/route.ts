import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PaymentOrder from '@/models/PaymentOrder';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { utr: { $regex: search, $options: 'i' } },
        { assignedUpiString: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total, stats] = await Promise.all([
      PaymentOrder.find(query)
        .populate('customerId', 'fullName mobile email customerId upiId')
        .populate('landId', 'name surveyNumber location')
        .populate('assignedUpiAccountId', 'displayName upiId provider')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentOrder.countDocuments(query),
      PaymentOrder.aggregate([
        {
          $group: {
            _id: null,
            totalSubmitted: {
              $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] },
            },
            totalVerified: {
              $sum: { $cond: [{ $eq: ['$status', 'verified'] }, '$amount', 0] },
            },
            verifiedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] },
            },
            pendingCount: {
              $sum: {
                $cond: [{ $in: ['$status', ['initiated', 'submitted', 'processing']] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: stats[0] || {
        totalSubmitted: 0,
        totalVerified: 0,
        verifiedCount: 0,
        pendingCount: 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

