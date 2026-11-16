import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { signCustomerToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { identifier, password } = body; // identifier can be mobile or email

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Mobile/Email and password are required' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query customer by email or mobile
    const customer = await Customer.findOne({
      $or: [{ email: cleanIdentifier }, { mobile: identifier.trim() }],
    }).select('+password');

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'No customer account found with these credentials' },
        { status: 401 }
      );
    }

    if (customer.accountStatus !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Your account is currently inactive or suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Check password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please check your password.' },
        { status: 401 }
      );
    }

    const token = signCustomerToken({
      customerId: customer.customerId,
      mongoId: customer._id.toString(),
      email: customer.email,
      mobile: customer.mobile,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      token,
      customer: {
        _id: customer._id,
        customerId: customer.customerId,
        fullName: customer.fullName,
        email: customer.email,
        mobile: customer.mobile,
        kycStatus: customer.kycStatus,
        walletBalance: customer.walletBalance || 0,
      },
    });

    response.cookies.set('customer_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60, // 14 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

