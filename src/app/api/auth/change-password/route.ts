import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getTokenFromRequest, verifyToken, comparePassword, hashPassword } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);

    const body = await req.json();
    const validated = changePasswordSchema.safeParse({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      confirmPassword: body.newPassword,
    });

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validated.error.format() },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const isMatch = await user.comparePassword(body.currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Current password does not match records' },
        { status: 400 }
      );
    }

    user.password = body.newPassword; // Pre-save hook will hash it
    await user.save();

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
