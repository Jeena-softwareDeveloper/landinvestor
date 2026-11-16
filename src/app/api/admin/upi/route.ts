import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UpiAccount from '@/models/UpiAccount';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

export const GET = withAuth(async () => {
  try {
    await connectDB();
    const accounts = await UpiAccount.find().sort({ priority: -1, createdAt: -1 }).lean();

    const stats = {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((a) => a.status === 'active').length,
      totalCollected: accounts.reduce((sum, a) => sum + (a.totalCollection || 0), 0),
      todayCollected: accounts.reduce((sum, a) => sum + (a.currentDailyAmount || 0), 0),
      todayTransactions: accounts.reduce((sum, a) => sum + (a.currentDailyCount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      accounts,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const {
      upiId,
      displayName,
      qrCode,
      provider,
      status,
      priority,
      weight,
      dailyTransactionLimit,
      dailyCollectionLimit,
    } = body;

    if (!upiId || !displayName) {
      return NextResponse.json(
        { success: false, message: 'UPI ID and Display Name are required' },
        { status: 400 }
      );
    }

    const cleanUpi = upiId.trim().toLowerCase();
    const existing = await UpiAccount.findOne({ upiId: cleanUpi });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `UPI ID "${cleanUpi}" already exists` },
        { status: 409 }
      );
    }

    const account = await UpiAccount.create({
      upiId: cleanUpi,
      displayName: displayName.trim(),
      qrCode: qrCode || '',
      provider: provider || 'Merchant Escrow Account',
      status: status || 'active',
      priority: priority !== undefined ? Number(priority) : 1,
      weight: weight !== undefined ? Number(weight) : 1,
      dailyTransactionLimit: dailyTransactionLimit !== undefined ? Number(dailyTransactionLimit) : 50,
      dailyCollectionLimit: dailyCollectionLimit !== undefined ? Number(dailyCollectionLimit) : 1000000,
      currentDailyCount: 0,
      currentDailyAmount: 0,
      totalTransactions: 0,
      totalCollection: 0,
      lastResetDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Merchant UPI account created successfully',
      account,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

