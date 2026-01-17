import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { getProductImage } from './image-mapping';

const prisma = new PrismaClient();

interface ExcelProductRow {
  'CategoryID'?: string | number;
  'CategoryName'?: string;
  'Items'?: string;
  'Description'?: string;
  'Option'?: string;
  'Giá'?: number | string;
}

/**
 * Import menu từ file Excel
 * 
 * Cấu trúc Excel cần có các cột:
 * - CategoryID: Mã danh mục (code)
 * - CategoryName: Tên danh mục
 * - Items: Tên món ăn
 * - Description: Mô tả (optional)
 * - Option: Tên option/variant (ví dụ: "Cỡ Nhỏ", "Cỡ Vừa", "Cỡ Lớn")
 * - Giá: Giá bán (VND)
 * 
 * Mỗi dòng sẽ tạo một product riêng. Nếu có Option, tên product sẽ là "Items - Option"
 */
async function importMenuFromExcel() {
  console.log('📊 Importing menu from Excel...\n');

  try {
    // Đường dẫn file Excel (điều chỉnh theo vị trí file của bạn)
    const excelPath = path.join(process.cwd(), '..', 'AnEat - Menu.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ File Excel not found at: ${excelPath}`);
      console.log('💡 Please ensure the Excel file is in the project root directory');
      console.log(`💡 Current working directory: ${process.cwd()}`);
      return;
    }

    console.log(`📂 Reading Excel file: ${excelPath}\n`);

    // Đọc file Excel bằng ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    
    // Lấy sheet đầu tiên
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    // Đọc header row (row 1)
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || '';
    });

    console.log(`📋 Headers found: ${headers.filter(h => h).join(', ')}\n`);

    // Đọc data rows
    const rows: ExcelProductRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData: ExcelProductRow = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const headerName = headers[colNumber - 1];
        if (headerName) {
          rowData[headerName as keyof ExcelProductRow] = cell.value as any;
        }
      });
      
      // Chỉ thêm row nếu có Items và Giá
      if (rowData['Items'] && rowData['Giá']) {
        rows.push(rowData);
      }
    });
    
    console.log(`📄 Found ${rows.length} data rows in Excel file\n`);

    // Lấy branch đầu tiên (hoặc có thể config branchId)
    const branch = await prisma.branch.findFirst();
    if (!branch) {
      throw new Error('No branch found. Please run seed-manager.ts first');
    }
    console.log(`🏪 Using branch: ${branch.name} (${branch.code})\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Xử lý từng dòng
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Validate required fields
        if (!row['Items'] || !row['Giá']) {
          console.log(`⚠️  Row ${i + 2}: Missing Items or Giá, skipping...`);
          skipCount++;
          continue;
        }

        const items = String(row['Items']).trim();
        const option = row['Option'] ? String(row['Option']).trim() : '';
        const description = row['Description'] ? String(row['Description']).trim() : '';
        
        // Tạo tên product: "Items" hoặc "Items - Option"
        const name = option ? `${items} - ${option}` : items;
        
        // Tạo code: dựa trên CategoryID, Items và Option (sanitize)
        const categoryId = row['CategoryID'] ? String(row['CategoryID']).trim() : '';
        const codeBase = items.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 20);
        const optionSuffix = option 
          ? '-' + option.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 10)
          : '';
        const code = `${categoryId || 'PROD'}-${codeBase}${optionSuffix}`.substring(0, 50);
        
        // Parse giá (có thể là số hoặc string với dấu phẩy)
        const priceStr = String(row['Giá']).replace(/[^\d]/g, '');
        const price = parseInt(priceStr, 10);
        
        if (isNaN(price) || price <= 0) {
          console.log(`⚠️  Row ${i + 2}: Invalid price for ${name}, skipping...`);
          skipCount++;
          continue;
        }

        // Tìm category
        let category = await prisma.productCategory.findFirst({
          where: {
            OR: [
              row['CategoryID'] ? { code: String(row['CategoryID']).trim() } : {},
              row['CategoryName'] ? { name: { contains: String(row['CategoryName']).trim(), mode: 'insensitive' } } : {},
            ].filter(condition => Object.keys(condition).length > 0),
          },
        });

        if (!category) {
          console.log(`⚠️  Row ${i + 2}: Category not found for ${name}, skipping...`);
          skipCount++;
          continue;
        }

        // Default values
        const costPrice = 0; // Không có giá vốn trong Excel mới
        const quantity = 100; // Default
        const prepTime = 10; // Default
        const isAvailable = true;

        // Tự động gán ảnh dựa trên tên sản phẩm và category
        const productImage = getProductImage(name, category.name);

        // Kiểm tra product đã tồn tại chưa (theo code)
        const existing = await prisma.product.findUnique({
          where: { code },
        });

        if (existing) {
          // Update existing product
          await prisma.product.update({
            where: { code },
            data: {
              name,
              description: description || existing.description,
              price,
              costPrice,
              quantity,
              prepTime,
              categoryId: category.id,
              isAvailable,
              image: productImage || existing.image, // Giữ ảnh cũ nếu không tìm thấy ảnh mới
            },
          });
          console.log(`🔄 Updated product: ${name} (${code})${productImage ? ` (image: ${productImage})` : ''}`);
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              code,
              name,
              description,
              price,
              costPrice,
              quantity,
              prepTime,
              categoryId: category.id,
              branchId: branch.id,
              isAvailable,
              image: productImage, // Tự động gán ảnh
            },
          });
          console.log(`✅ Created product: ${name} (${code})${productImage ? ` (image: ${productImage})` : ''}`);
        }

        successCount++;
      } catch (err: any) {
        console.error(`❌ Row ${i + 2}: Error processing - ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('\n✨ Import completed!');
  } catch (error) {
    console.error('❌ Error importing from Excel:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importMenuFromExcel();
