import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Land from '@/models/Land';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: { $in: ['active', 'fully_funded'] },
      publicApproved: { $ne: false },
    };

    if (featured === 'true') {
      query.featured = true;
    }

    const lands = await Land.find(query)
      .select(
        'name location surveyNumber totalArea totalValue availableInvestment totalInvested investmentPercentage minInvestmentAmount coverImage images description status rentalIncomeModel featured'
      )
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      lands,
      total: lands.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch public land listings' },
      { status: 500 }
    );
  }
}

