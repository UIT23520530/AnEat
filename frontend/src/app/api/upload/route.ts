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

        console.log('[Upload API] Checking Cloudinary config:', {
            cloudName: cloudName ? 'SET' : 'NOT SET',
            uploadPreset: uploadPreset ? 'SET' : 'NOT SET',
            cloudNameValue: cloudName,
            uploadPresetValue: uploadPreset,
        });

        if (!cloudName || !uploadPreset || cloudName === '' || uploadPreset === '') {
            console.error('[Upload API] Cloudinary configuration missing!');
            console.error('[Upload API] Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
            console.error('[Upload API] Current values:', { cloudName, uploadPreset });
            
            return NextResponse.json({ 
                success: false, 
                message: `Cloudinary chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào Environment Variables. Current: cloudName=${cloudName || 'empty'}, preset=${uploadPreset || 'empty'}` 
            }, { status: 500 });
        }

        console.log('[Upload API] Uploading to Cloudinary...', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
        });

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        
        // Optional: Add folder organization
        formData.append('folder', 'aneat-products');

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        console.log('[Upload API] Cloudinary URL:', cloudinaryUrl);

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
        });

        console.log('[Upload API] Cloudinary response status:', cloudinaryResponse.status);

        if (!cloudinaryResponse.ok) {
            const errorText = await cloudinaryResponse.text();
            console.error('[Upload API] Cloudinary upload failed:', errorText);
            return NextResponse.json({ 
                success: false, 
                message: `Failed to upload to Cloudinary: ${cloudinaryResponse.status} - ${errorText}` 
            }, { status: cloudinaryResponse.status });
        }

        const result = await cloudinaryResponse.json();
        console.log('[Upload API] Upload successful:', result.secure_url);
        
        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
        
    } catch (error) {
        console.error('[Upload API] Error uploading file:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
        }, { status: 500 });
    }
}
