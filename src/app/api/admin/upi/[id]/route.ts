import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UpiAccount from '@/models/UpiAccount';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

export const PUT = withAuth(
  async (req: AuthenticatedRequest, context: any) => {
    try {
      await connectDB();
      const { id } = await context.params;
      const body = await req.json();

      const account = await UpiAccount.findById(id);
      if (!account) {
        return NextResponse.json({ success: false, message: 'UPI account not found' }, { status: 404 });
      }

      // Allow changing upiId with uniqueness validation
      if (body.upiId) {
        const cleanUpi = body.upiId.trim().toLowerCase();
        const existing = await UpiAccount.findOne({
          upiId: cleanUpi,
          _id: { $ne: id },
        });
        if (existing) {
          return NextResponse.json(
            { success: false, message: `UPI ID "${cleanUpi}" is already used by another account` },
            { status: 409 }
          );
        }
        account.upiId = cleanUpi;
      }

      if (body.displayName) account.displayName = body.displayName.trim();
      if (body.provider) account.provider = body.provider.trim();
      if (body.status) account.status = body.status;
      if (body.priority !== undefined) account.priority = Math.max(1, Number(body.priority));
      if (body.weight !== undefined) account.weight = Math.max(1, Number(body.weight));
      if (body.dailyTransactionLimit !== undefined)
        account.dailyTransactionLimit = Math.max(1, Number(body.dailyTransactionLimit));
      if (body.dailyCollectionLimit !== undefined)
        account.dailyCollectionLimit = Math.max(1000, Number(body.dailyCollectionLimit));
      if (body.qrCode !== undefined) account.qrCode = body.qrCode;

      await account.save();

      return NextResponse.json({
        success: true,
        message: 'Merchant UPI account updated successfully',
        account,
      });
    } catch (error: any) {
      console.error('Update UPI account error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
);

export const DELETE = withAuth(
  async (req: AuthenticatedRequest, context: any) => {
    try {
      await connectDB();
      const { id } = await context.params;

      const account = await UpiAccount.findByIdAndDelete(id);
      if (!account) {
        return NextResponse.json({ success: false, message: 'UPI account not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Merchant UPI account "${account.displayName}" (${account.upiId}) removed successfully`,
      });
    } catch (error: any) {
      console.error('Delete UPI account error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
);
