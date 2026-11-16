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

      if (body.displayName) account.displayName = body.displayName;
      if (body.provider) account.provider = body.provider;
      if (body.status) account.status = body.status;
      if (body.priority !== undefined) account.priority = Number(body.priority);
      if (body.weight !== undefined) account.weight = Number(body.weight);
      if (body.dailyTransactionLimit !== undefined)
        account.dailyTransactionLimit = Number(body.dailyTransactionLimit);
      if (body.dailyCollectionLimit !== undefined)
        account.dailyCollectionLimit = Number(body.dailyCollectionLimit);
      if (body.qrCode !== undefined) account.qrCode = body.qrCode;

      await account.save();

      return NextResponse.json({
        success: true,
        message: 'UPI account updated successfully',
        account,
      });
    } catch (error: any) {
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
        message: 'UPI account removed successfully',
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
);

