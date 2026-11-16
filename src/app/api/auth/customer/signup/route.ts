import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { signCustomerToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, mobile, email, password } = body;

    if (!fullName || !mobile || !password) {
      return NextResponse.json(
        { success: false, message: 'Full name, mobile number, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check if customer already exists by mobile
    const existingMobile = await Customer.findOne({ mobile: cleanMobile });
    if (existingMobile) {
      return NextResponse.json(
        { success: false, message: 'An account with this mobile number already exists. Please log in.' },
        { status: 409 }
      );
    }

    if (cleanEmail) {
      const existingEmail = await Customer.findOne({ email: cleanEmail });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: 'An account with this email address already exists. Please log in.' },
          { status: 409 }
        );
      }
    }

    // Create customer with verified status for seamless onboarding
    const customer = new Customer({
      fullName: fullName.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      password,
      isVerified: true,
      mobileVerified: true,
      emailVerified: !!cleanEmail,
      kycStatus: 'pending',
      accountStatus: 'active',
      walletBalance: 0,
    });

    await customer.save();

    const token = signCustomerToken({
      customerId: customer.customerId,
      mongoId: customer._id.toString(),
      email: customer.email,
      mobile: customer.mobile,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      token,
      customer: {
        _id: customer._id,
        customerId: customer.customerId,
        fullName: customer.fullName,
        email: customer.email,
        mobile: customer.mobile,
        kycStatus: customer.kycStatus,
        walletBalance: customer.walletBalance,
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
      { success: false, message: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}

