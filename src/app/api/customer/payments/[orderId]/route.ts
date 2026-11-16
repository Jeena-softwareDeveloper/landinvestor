import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PaymentOrder from '@/models/PaymentOrder';
import Land from '@/models/Land';
import UpiAccount from '@/models/UpiAccount';
import { getCustomerTokenFromRequest, verifyCustomerToken } from '@/lib/auth';
import { PaymentOrderService } from '@/services/payment-order.service';
import { UpiRotationService } from '@/services/upi-rotation.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();
    const { orderId } = await params;

    const order = await PaymentOrder.findOne({
      orderId,
      customerId: decoded.mongoId,
    })
      .populate('landId', 'name location surveyNumber coverImage minInvestmentAmount')
      .populate('assignedUpiAccountId', 'displayName upiId provider')
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, message: 'Payment order not found' }, { status: 404 });
    }

    const { upiUri, qrCodeUrl } = UpiRotationService.generateUpiPaymentUrls(
      order.assignedUpiString,
      order.assignedUpiName,
      order.amount,
      order.orderId
    );

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        upiUri,
        qrCodeUrl: order.qrCodeUrl || qrCodeUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const token = getCustomerTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyCustomerToken(token);
    await connectDB();
    const { orderId } = await params;

    const body = await req.json();
    const { utr, paymentProof, customerNotes } = body;

    if (!utr) {
      return NextResponse.json(
        { success: false, message: 'Please provide the 12-digit UPI / Bank Reference (UTR) Number' },
        { status: 400 }
      );
    }

    // Verify order belongs to customer
    const orderCheck = await PaymentOrder.findOne({ orderId, customerId: decoded.mongoId });
    if (!orderCheck) {
      return NextResponse.json({ success: false, message: 'Payment order not found' }, { status: 404 });
    }

    const updatedOrder = await PaymentOrderService.submitUtr({
      orderId,
      utr,
      paymentProof,
      customerNotes,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment proof & UTR reference submitted successfully! Admin verification is in progress.',
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit payment reference' },
      { status: 400 }
    );
  }
}

