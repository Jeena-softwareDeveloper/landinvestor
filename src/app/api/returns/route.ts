import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyReturn from '@/models/DailyReturn';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const customerId = searchParams.get('customerId') || '';
    const landId = searchParams.get('landId') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const query: any = {};

    if (customerId) query.customerId = customerId;
    if (landId) query.landId = landId;
    if (status && status !== 'all') query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [returns, total, summary] = await Promise.all([
      DailyReturn.find(query)
        .populate('customerId', 'fullName email mobile customerId upiId')
        .populate('landId', 'name surveyNumber')
        .populate('investmentId', 'amount returnRate startDate')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DailyReturn.countDocuments(query),
      DailyReturn.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAccrued: { $sum: '$dailyReturnAmount' },
            totalPaid: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$dailyReturnAmount', 0] },
            },
            totalPending: {
              $sum: {
                $cond: [{ $in: ['$status', ['accrued', 'verified']] }, '$dailyReturnAmount', 0],
              },
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      returns,
      summary: summary[0] || { totalAccrued: 0, totalPaid: 0, totalPending: 0 },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch daily returns error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}
