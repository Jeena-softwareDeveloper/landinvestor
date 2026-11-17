import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    await connectDB();

    // Ensure default Administrator exists
    let admin = await User.findOne({ email: 'admin@landvest.com' });
    if (!admin) {
      admin = new User({
        name: 'Super Administrator',
        email: 'admin@landvest.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
      });
      await admin.save();
    }

    return NextResponse.json({
      success: true,
      message: 'System initialization complete. Super Administrator ready.',
      credentials: {
        admin: { email: 'admin@landvest.com', password: 'password123' },
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
