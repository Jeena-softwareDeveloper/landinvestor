import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const customer = await Customer.findById(decoded.mongoId).select('-password').lean();
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const body = await req.json();
    const { address, addressDetails, bankDetails, upiId } = body;

    const customer = await Customer.findById(decoded.mongoId);
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    if (addressDetails) {
      customer.addressDetails = {
        street: addressDetails.street || '',
        city: addressDetails.city || '',
        state: addressDetails.state || '',
        pincode: addressDetails.pincode || '',
      };
      customer.address =
        address ||
        [addressDetails.street, addressDetails.city, addressDetails.state, addressDetails.pincode]
          .filter(Boolean)
          .join(', ');
    } else if (address !== undefined) {
      customer.address = address;
    }
    if (upiId !== undefined) customer.upiId = upiId;
    if (bankDetails) {
      customer.bankDetails = {
        accountHolderName: bankDetails.accountHolderName || customer.bankDetails?.accountHolderName || '',
        accountNumber: bankDetails.accountNumber || customer.bankDetails?.accountNumber || '',
        bankName: bankDetails.bankName || customer.bankDetails?.bankName || '',
        ifscCode: (bankDetails.ifscCode || customer.bankDetails?.ifscCode || '').toUpperCase(),
        branchName: bankDetails.branchName || customer.bankDetails?.branchName || '',
      };
    }

    await customer.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      customer,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

