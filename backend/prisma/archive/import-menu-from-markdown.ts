import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { getProductImage } from './image-mapping';

const prisma = new PrismaClient();

interface MenuItem {
  name: string;
  description: string;
  options: MenuOption[];
  price: number;
  category: string;
}

interface MenuOption {
  group: string; // "Chọn Gà", "Chọn Mì", "Nước Ngọt"
  items: string[]; // ["Gà Giòn", "Gà Sốt Cay"]
  prices?: { [key: string]: number }; // Giá thêm cho từng option
}

interface UpsizePrice {
  name: string;
  price: number;
}

/**
 * Parse markdown menu và import vào database
 * 
 * Cấu trúc:
 * - Mỗi món có thể có nhiều nhóm options
 * - Options có thể có giá thêm (upsize)
 * - Tạo Product với ProductOptions
 */
async function importMenuFromMarkdown() {
  console.log('📊 Importing menu from markdown...\n');

  try {
    // Đọc file markdown
    const markdownPath = path.join(process.cwd(), '/archive/newdata.md');
    if (!fs.existsSync(markdownPath)) {
      console.error(`❌ File markdown not found at: ${markdownPath}`);
      return;
    }

    const content = fs.readFileSync(markdownPath, 'utf-8');
    const menuItems = parseMarkdownMenu(content);

    console.log(`📄 Found ${menuItems.length} menu items\n`);

    // Lấy branch đầu tiên
    const branch = await prisma.branch.findFirst();
    if (!branch) {
      throw new Error('No branch found. Please run seed-manager.ts first');
    }
    console.log(`🏪 Using branch: ${branch.name} (${branch.code})\n`);

    // Bảng giá upsize/option
    const upsizePrices: UpsizePrice[] = [
      { name: 'Upsize', price: 10000 },
      { name: 'Mỳ lớn', price: 5000 },
      { name: 'Mỳ sốt cay vừa', price: 15000 },
      { name: 'Mỳ sốt cay lớn', price: 20000 },
      { name: 'Up', price: 5000 }, // 7Up Up, Pepsi Up
      { name: 'Lớn', price: 5000 }, // Khoai tây lớn, Nước lớn
    ];

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Xử lý từng menu item
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      
      try {
        // Tìm hoặc tạo category
        let category = await prisma.productCategory.findFirst({
          where: {
            name: { contains: item.category, mode: 'insensitive' },
          },
        });

        if (!category) {
          // Tạo category mới
          const categoryCode = item.category
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_')
            .substring(0, 20);
          
          category = await prisma.productCategory.create({
            data: {
              code: categoryCode,
              name: item.category,
              description: `Danh mục ${item.category}`,
              isActive: true,
            },
          });
          console.log(`✅ Created category: ${item.category}`);
        }

        // Tạo code cho product
        const codeBase = item.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 30);
        const code = `${category.code}-${codeBase}`.substring(0, 50);

        // Tự động gán ảnh dựa trên tên sản phẩm và category
        const productImage = getProductImage(item.name, item.category);

        // Kiểm tra product đã tồn tại chưa
        const existingProduct = await prisma.product.findUnique({
          where: { code },
          include: { options: true },
        });

        let product;
        if (existingProduct) {
          // Xóa options cũ trước khi update
          if (existingProduct.options.length > 0) {
            await prisma.productOption.deleteMany({
              where: { productId: existingProduct.id },
            });
          }

          // Update existing product
          product = await prisma.product.update({
            where: { code },
            data: {
              name: item.name,
              description: item.description,
              price: item.price * 100, // Convert VND to cents
              categoryId: category.id,
              image: productImage || existingProduct.image, // Giữ ảnh cũ nếu không tìm thấy ảnh mới
            },
          });
          console.log(`🔄 Updated product: ${item.name}${productImage ? ` (image: ${productImage})` : ''}`);
        } else {
          // Create new product
          product = await prisma.product.create({
            data: {
              code,
              name: item.name,
              description: item.description,
              price: item.price * 100, // Convert VND to cents
              costPrice: 0,
              quantity: 100,
              prepTime: 10,
              categoryId: category.id,
              branchId: branch.id,
              isAvailable: true,
              image: productImage, // Tự động gán ảnh
            },
          });
          console.log(`✅ Created product: ${item.name}${productImage ? ` (image: ${productImage})` : ''}`);
        }

        // Tạo options cho product
        let optionOrder = 0;
        for (const optionGroup of item.options) {
          for (const optionName of optionGroup.items) {
            const cleanOptionName = optionName.trim();
            if (!cleanOptionName) continue;

            // Tìm giá thêm cho option này
            let optionPrice = 0;
            const lowerOption = cleanOptionName.toLowerCase();
            
            // Xử lý đặc biệt cho nước ngọt: thường = 0, Up = +5000
            if (lowerOption.includes('7up') || lowerOption.includes('pepsi')) {
              // Nếu có "Up" hoặc "Lớn" trong tên (không tính trong dấu ngoặc)
              const nameWithoutParentheses = cleanOptionName.replace(/\([^)]*\)/g, '');
              if (nameWithoutParentheses.toLowerCase().includes('up') || 
                  nameWithoutParentheses.toLowerCase().includes('lớn')) {
                optionPrice = 5000 * 100; // +5000 VND = 500000 cents
              } else {
                // Nước ngọt thường = 0
                optionPrice = 0;
              }
            } else {
              // Kiểm tra trong upsizePrices (theo thứ tự ưu tiên) cho các option khác
              for (const upsize of upsizePrices) {
                const lowerUpsize = upsize.name.toLowerCase();
                
                // Match chính xác hoặc chứa từ khóa
                if (lowerOption === lowerUpsize || 
                    lowerOption.includes(lowerUpsize) ||
                    (upsize.name === 'Up' && (lowerOption.includes(' up') || lowerOption.endsWith(' up'))) ||
                    (upsize.name === 'Lớn' && (lowerOption.includes(' lớn') || lowerOption.endsWith(' lớn')))) {
                  optionPrice = upsize.price * 100; // Convert to cents
                  break;
                }
              }
            }

            // Xác định type của option
            let optionType = 'OTHER';
            const lowerName = cleanOptionName.toLowerCase();
            
            if (lowerName.includes('up') || lowerName.includes('lớn') || lowerName.includes('vừa')) {
              optionType = 'SIZE';
            } else if (lowerName.includes('cay') || lowerName.includes('sốt') || lowerName.includes('sauce')) {
              optionType = 'SAUCE';
            } else if (lowerName.includes('pepsi') || lowerName.includes('7up') || lowerName.includes('nước')) {
              optionType = 'OTHER';
            } else if (lowerName.includes('gà') || lowerName.includes('miếng')) {
              optionType = 'OTHER';
            }

            await prisma.productOption.create({
              data: {
                productId: product.id,
                name: cleanOptionName,
                description: `${optionGroup.group}: ${cleanOptionName}`,
                price: optionPrice,
                type: optionType,
                isRequired: false,
                isAvailable: true,
                order: optionOrder++,
              },
            });
          }
        }

        if (item.options.length > 0) {
          console.log(`   └─ Created ${item.options.reduce((sum, g) => sum + g.items.length, 0)} options`);
        }

        successCount++;
      } catch (err: any) {
        console.error(`❌ Item ${i + 1}: Error processing "${item.name}" - ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('\n✨ Import completed!');
  } catch (error) {
    console.error('❌ Error importing from markdown:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Parse markdown content thành array of MenuItem
 */
function parseMarkdownMenu(content: string): MenuItem[] {
  const items: MenuItem[] = [];
  const lines = content.split('\n');

  let currentCategory = '';
  let inTable = false;
  let tableHeaders: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect category (## 1. Món ngon phải thử)
    if (line.startsWith('## ')) {
      const match = line.match(/## \d+\.\s*(.+)/);
      if (match) {
        currentCategory = match[1];
        inTable = false;
        continue;
      }
    }

    // Skip bảng giá upsize section
    if (line.includes('Bảng giá Upsize') || line.includes('ℹ️')) {
      break; // Dừng parse khi đến phần bảng giá
    }

    // Detect table header
    if (line.startsWith('|') && line.includes('Tên Món')) {
      inTable = true;
      tableHeaders = line.split('|').map(h => h.trim()).filter(h => h);
      continue;
    }

    // Skip separator lines
    if (line.startsWith('|---')) {
      continue;
    }

    // Parse table row
    if (inTable && line.startsWith('|') && !line.includes('Tên Món')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      
      if (parts.length < 2) continue;

      // Tìm index của các cột
      const nameIndex = tableHeaders.findIndex(h => h.includes('Tên'));
      const descIndex = tableHeaders.findIndex(h => h.includes('Mô Tả') || h.includes('Tả'));
      const optionIndex = tableHeaders.findIndex(h => h.includes('Tùy Chọn') || h.includes('Chọn'));
      const priceIndex = tableHeaders.findIndex(h => h.includes('Giá'));

      const name = parts[nameIndex]?.replace(/\*\*/g, '').trim() || '';
      const description = parts[descIndex]?.replace(/\*\*/g, '').trim() || '';
      const optionsText = parts[optionIndex] || '';
      const priceText = parts[priceIndex] || '';

      if (!name || !priceText) continue;

      // Parse price (có thể có dấu chấm phân cách hàng nghìn)
      const priceMatch = priceText.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/);
      let price = 0;
      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
      }

      // Parse options
      const options: MenuOption[] = [];
      if (optionsText && optionsText !== '-') {
        // Xử lý HTML <br> tags
        const cleanOptionsText = optionsText.replace(/<br\s*\/?>/gi, '\n');
        const optionLines = cleanOptionsText.split('\n').map(l => l.trim()).filter(l => l);
        
        let currentGroup: MenuOption | null = null;
        
        for (const optLine of optionLines) {
          // Detect group name (e.g., "**Chọn Gà:**" hoặc "**Chọn Gà 1 & 2:**")
          const groupMatch = optLine.match(/\*\*(.+?):\*\*/);
          if (groupMatch) {
            if (currentGroup && currentGroup.items.length > 0) {
              options.push(currentGroup);
            }
            currentGroup = {
              group: groupMatch[1].trim(),
              items: [],
            };
          } else if (currentGroup) {
            // Option item (có thể bắt đầu bằng + hoặc không)
            const cleanLine = optLine.replace(/^\+/, '').trim();
            if (cleanLine) {
              // Parse options, không split trong dấu ngoặc
              // Ví dụ: "7Up / Pepsi (Thường/Up)" -> ["7Up", "Pepsi (Thường/Up)"]
              // Hoặc: "7Up / Pepsi (Thường/Up)" -> ["7Up (Thường)", "7Up (Up)", "Pepsi (Thường)", "Pepsi (Up)"]
              const items: string[] = [];
              
              // Xử lý format đặc biệt: "7Up / Pepsi (Thường/Up)"
              const drinkPattern = /^(.+?)\s*\/\s*(.+?)\s*\((.+?)\/(.+?)\)$/;
              const drinkMatch = cleanLine.match(drinkPattern);
              
              if (drinkMatch) {
                // Format: "7Up / Pepsi (Thường/Up)"
                const drink1 = drinkMatch[1].trim(); // "7Up"
                const drink2 = drinkMatch[2].trim(); // "Pepsi"
                const option1 = drinkMatch[3].trim(); // "Thường"
                const option2 = drinkMatch[4].trim(); // "Up"
                
                items.push(`${drink1} (${option1})`);
                items.push(`${drink1} (${option2})`);
                items.push(`${drink2} (${option1})`);
                items.push(`${drink2} (${option2})`);
              } else {
                // Parse bình thường, không split trong dấu ngoặc
                let currentItem = '';
                let inParentheses = false;
                
                for (let i = 0; i < cleanLine.length; i++) {
                  const char = cleanLine[i];
                  if (char === '(') {
                    inParentheses = true;
                    currentItem += char;
                  } else if (char === ')') {
                    inParentheses = false;
                    currentItem += char;
                  } else if (char === '/' && !inParentheses) {
                    // Chỉ split khi không trong dấu ngoặc
                    if (currentItem.trim()) {
                      items.push(currentItem.trim());
                      currentItem = '';
                    }
                  } else {
                    currentItem += char;
                  }
                }
                
                // Thêm item cuối cùng
                if (currentItem.trim()) {
                  items.push(currentItem.trim());
                }
              }
              
              currentGroup.items.push(...items);
            }
          } else if (optLine && !optLine.startsWith('|')) {
            // Option không có group (standalone)
            const cleanLine = optLine.replace(/^\+/, '').trim();
            if (cleanLine) {
              options.push({
                group: 'Tùy chọn',
                items: [cleanLine],
              });
            }
          }
        }
        
        if (currentGroup && currentGroup.items.length > 0) {
          options.push(currentGroup);
        }
      }

      if (name && price > 0) {
        items.push({
          name,
          description,
          options,
          price,
          category: currentCategory || 'Khác',
        });
      }
    }
  }

  return items;
}

// Run import
importMenuFromMarkdown();
