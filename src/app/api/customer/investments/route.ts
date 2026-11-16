import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Investment from '@/models/Investment';
import Land from '@/models/Land';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';
import { PaymentOrderService } from '@/services/payment-order.service';

export async function GET(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const investments = await Investment.find({ customerId: decoded.mongoId })
      .populate('landId', 'name location surveyNumber coverImage rentalIncomeModel')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      investments,
      total: investments.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();

    const body = await req.json();
    const { landId, amount, customerNotes, strategy } = body;

    if (!landId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Land ID and investment amount are required' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid investment amount' },
        { status: 400 }
      );
    }

    // Call PaymentOrderService to create order and atomically assign UPI destination
    const { order, upiUri, qrCodeUrl } = await PaymentOrderService.createOrder({
      customerId: decoded.mongoId,
      landId,
      amount: numAmount,
      customerNotes,
      strategy: strategy || 'round_robin',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment order initiated successfully',
      order: {
        orderId: order.orderId,
        amount: order.amount,
        assignedUpiId: order.assignedUpiString,
        assignedUpiName: order.assignedUpiName,
        qrCodeUrl,
        upiUri,
        expiresAt: order.expiresAt,
        status: order.status,
      },
      paymentUrl: `/customer/payments/${order.orderId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate investment order' },
      { status: 400 }
    );
  }
}

