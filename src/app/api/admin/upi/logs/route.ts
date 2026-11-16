import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UpiAssignmentLog from '@/models/UpiAssignmentLog';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await UpiAssignmentLog.find()
      .populate('customerId', 'fullName customerId mobile')
      .populate('upiAccountId', 'displayName provider')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

