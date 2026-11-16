import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import { PaymentOrderService } from '@/services/payment-order.service';

export const POST = withAuth(
  async (req: AuthenticatedRequest, context: any) => {
    try {
      const { orderId } = await context.params;
      const body = await req.json().catch(() => ({}));
      const { adminNotes } = body;

      const result = await PaymentOrderService.adminVerifyOrder({
        orderId,
        adminUserId: req.user.userId,
        adminNotes,
      });

      return NextResponse.json({
        success: true,
        message: `Payment order ${orderId} verified successfully! Investment contract is now active.`,
        order: result.order,
        investment: result.investment,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Verification failed' },
        { status: 400 }
      );
    }
  }
);

