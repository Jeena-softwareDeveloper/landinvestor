import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Land from '@/models/Land';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const land = await Land.findOne({
      _id: id,
      publicApproved: { $ne: false },
    }).lean();

    if (!land) {
      return NextResponse.json(
        { success: false, message: 'Property not found or not approved for public display' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      land,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}

