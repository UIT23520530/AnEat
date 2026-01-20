import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import fs from 'fs';

export async function POST(request: Request) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Normalize filename
    const normalizeFileName = (str: string) => {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9.-]/g, "")
    }

    const ext = file.name.split('.').pop();
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    const normalizedName = normalizeFileName(nameWithoutExt);
    const finalFileName = `${normalizedName}.${ext}`;

    // Save to public/assets/products (creating 'products' subfolder for better organization, or just assets as requested)
    // Let's use public/assets to match request exactly, but usually products go to a subfolder.
    // User said "thư mục public/assests" (typo). I'll presume "public/assets".
    const uploadDir = path.join(process.cwd(), 'public/assets');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, finalFileName);

    try {
        await writeFile(filePath, buffer);
        console.log(`Uploaded file saved to ${filePath}`);

        return NextResponse.json({
            success: true,
            url: `/assets/${finalFileName}`
        });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
