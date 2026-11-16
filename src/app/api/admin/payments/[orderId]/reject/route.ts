import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import { PaymentOrderService } from '@/services/payment-order.service';

export const POST = withAuth(
  async (req: AuthenticatedRequest, context: any) => {
    try {
      const { orderId } = await context.params;
      const body = await req.json();
      const { rejectionReason, adminNotes } = body;

      if (!rejectionReason) {
        return NextResponse.json(
          { success: false, message: 'Please specify the rejection reason' },
          { status: 400 }
        );
      }

      const order = await PaymentOrderService.adminRejectOrder({
        orderId,
        adminUserId: req.user.userId,
        rejectionReason,
        adminNotes,
      });

      return NextResponse.json({
        success: true,
        message: `Payment order ${orderId} has been marked as rejected.`,
        order,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Rejection failed' },
        { status: 400 }
      );
    }
  }
);

