import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyReturn from '@/models/DailyReturn';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const [returns, total, summary] = await Promise.all([
      DailyReturn.find({ customerId: decoded.mongoId })
        .populate('landId', 'name surveyNumber')
        .populate('investmentId', 'amount returnRate')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DailyReturn.countDocuments({ customerId: decoded.mongoId }),
      DailyReturn.aggregate([
        { $match: { customerId: decoded.mongoId } },
        {
          $group: {
            _id: null,
            totalAccrued: { $sum: '$dailyReturnAmount' },
            totalPaid: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$dailyReturnAmount', 0] },
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      returns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: summary[0] || { totalAccrued: 0, totalPaid: 0 },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

