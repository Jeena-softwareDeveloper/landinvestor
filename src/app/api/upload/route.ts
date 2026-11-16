import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const folder = (formData.get('folder') as string) || 'land-investment';
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No file provided in form data' },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isCloudinaryConfigured()) {
        const uploadRes = await uploadToCloudinary(buffer, folder);
        results.push({
          url: uploadRes.url,
          publicId: uploadRes.publicId,
          format: uploadRes.format,
          source: 'cloudinary',
          name: file.name,
          size: file.size,
        });
      } else {
        // Fallback for development if keys are not yet pasted: base64 Data URL
        const mimeType = file.type || 'image/jpeg';
        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        results.push({
          url: dataUrl,
          publicId: `local-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          format: mimeType.split('/')[1] || 'jpg',
          source: 'local_fallback',
          name: file.name,
          size: file.size,
          warning: 'Cloudinary credentials not configured in .env.local. Served via local data URL.',
        });
      }
    }

    if (results.length === 1) {
      return NextResponse.json({
        success: true,
        ...results[0],
      });
    }

    return NextResponse.json({
      success: true,
      urls: results.map((r) => r.url),
      files: results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

