import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Check if Cloudinary is configured
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            console.error('Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
            return NextResponse.json({ 
                success: false, 
                message: 'Cloud storage not configured. Please contact administrator.' 
            }, { status: 500 });
        }

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        
        // Optional: Add folder organization
        formData.append('folder', 'aneat-products');

        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!cloudinaryResponse.ok) {
            const errorText = await cloudinaryResponse.text();
            console.error('Cloudinary upload failed:', errorText);
            return NextResponse.json({ 
                success: false, 
                message: 'Failed to upload to cloud storage' 
            }, { status: cloudinaryResponse.status });
        }

        const result = await cloudinaryResponse.json();
        
        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
        
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
        }, { status: 500 });
    }
}
