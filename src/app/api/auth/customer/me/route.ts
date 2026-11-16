import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const customer = await Customer.findById(decoded.mongoId)
      .select('-password')
      .lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired session' },
      { status: 401 }
    );
  }
}

