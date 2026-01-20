/**
 * Script để copy ảnh từ folder anh-product sang frontend/public/assets
 * Tự động tìm và copy các file .webp, .jpg, .png
 */

import * as fs from 'fs';
import * as path from 'path';

const SOURCE_DIR = path.join(process.cwd(), '..', 'anh-product');
const TARGET_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'assets');

/**
 * Normalize tên file: loại bỏ dấu, chuyển thành lowercase, thay khoảng trắng bằng dấu gạch ngang
 * Giữ nguyên extension
 */
function normalizeFileName(fileName: string): string {
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  const normalized = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt (giữ dấu gạch ngang)
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu/cuối
  
  return normalized + ext.toLowerCase();
}

/**
 * Tìm file ảnh trong folder và subfolder
 */
function findImageFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Bỏ qua folder .DS_Store và các folder ẩn
      if (!file.startsWith('.')) {
        findImageFiles(filePath, fileList);
      }
    } else {
      // Chỉ lấy file ảnh
      const ext = path.extname(file).toLowerCase();
      if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Copy ảnh từ anh-product sang frontend/public/assets
 */
async function copyProductImages() {
  console.log('📸 Copying product images from anh-product to frontend/public/assets...\n');

  try {
    // Kiểm tra folder nguồn
    if (!fs.existsSync(SOURCE_DIR)) {
      console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
      return;
    }

    // Tạo folder đích nếu chưa có
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
      console.log(`✅ Created target directory: ${TARGET_DIR}`);
    }

    // Tìm tất cả file ảnh
    const imageFiles = findImageFiles(SOURCE_DIR);
    console.log(`📁 Found ${imageFiles.length} image files\n`);

    let copiedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Copy từng file
    for (const sourcePath of imageFiles) {
      try {
        const fileName = path.basename(sourcePath);
        // Giữ nguyên tên file (đã được normalize từ folder anh-product)
        const normalizedName = normalizeFileName(fileName);
        const ext = path.extname(fileName).toLowerCase();
        const targetPath = path.join(TARGET_DIR, normalizedName);

        // Kiểm tra file đã tồn tại chưa (so sánh theo normalized name)
        if (fs.existsSync(targetPath)) {
          // Kiểm tra xem file có giống nhau không
          const sourceStat = fs.statSync(sourcePath);
          const targetStat = fs.statSync(targetPath);
          
          if (sourceStat.size === targetStat.size && sourceStat.mtime.getTime() === targetStat.mtime.getTime()) {
            console.log(`⏭️  Skipped (already exists): ${normalizedName}`);
            skippedCount++;
            continue;
          } else {
            // File khác nhau, overwrite
            console.log(`🔄 Overwriting: ${normalizedName}`);
          }
        }

        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied: ${fileName} -> ${normalizedName}`);
        copiedCount++;
      } catch (err: any) {
        console.error(`❌ Error copying ${sourcePath}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log(`✅ Copied: ${copiedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('\n✨ Copy completed!');
  } catch (error) {
    console.error('❌ Error copying images:', error);
    throw error;
  }
}

// Run copy
copyProductImages();
