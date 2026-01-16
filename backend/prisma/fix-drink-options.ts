import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script để sửa lại tên và giá của các options nước ngọt
 * - Sửa tên bị thiếu dấu ngoặc
 * - Sửa giá: nước ngọt thường = 0, Up = +5000đ
 */
async function fixDrinkOptions() {
  try {
    console.log('🔧 Bắt đầu sửa options nước ngọt...\n');

    // Lấy tất cả options có liên quan đến nước ngọt
    const allOptions = await prisma.productOption.findMany({
      where: {
        OR: [
          { name: { contains: '7Up', mode: 'insensitive' } },
          { name: { contains: 'Pepsi', mode: 'insensitive' } },
          { name: { contains: 'Nước', mode: 'insensitive' } },
          { description: { contains: 'Nước Ngọt', mode: 'insensitive' } },
        ],
      },
    });

    console.log(`📋 Tìm thấy ${allOptions.length} options liên quan đến nước ngọt\n`);

    let fixedCount = 0;
    let priceFixedCount = 0;
    let nameFixedCount = 0;

    for (const option of allOptions) {
      let needsUpdate = false;
      const updates: { name?: string; price?: number } = {};

      // Sửa tên bị thiếu dấu ngoặc
      let newName = option.name.trim();
      
      // Case 1: "Pepsi (Thường" hoặc "7Up (Thường" -> "Pepsi (Thường)" hoặc "7Up (Thường)"
      if (newName.includes('(Thường') && !newName.includes('(Thường)')) {
        newName = newName.replace('(Thường', '(Thường)');
        needsUpdate = true;
        nameFixedCount++;
      }
      
      // Case 2: "Up)" -> cần thêm tên nước ngọt phía trước
      if (newName === 'Up)' || newName.endsWith(' Up)') || (newName.includes('Up)') && !newName.match(/\(Up\)/))) {
        // Tìm tên nước ngọt từ description hoặc context
        const desc = option.description || '';
        let drinkName = '';
        
        if (desc.includes('7Up')) {
          drinkName = '7Up';
        } else if (desc.includes('Pepsi')) {
          drinkName = 'Pepsi';
        } else {
          // Nếu không tìm thấy, giữ nguyên và chỉ sửa dấu ngoặc
          newName = newName.replace(/Up\)/g, '(Up)');
          if (newName.startsWith('(')) {
            // Nếu chỉ có "(Up)", cần thêm tên
            newName = `7Up ${newName}`;
          }
        }
        
        if (drinkName) {
          newName = `${drinkName} (Up)`;
        } else {
          newName = newName.replace(/Up\)/g, '(Up)');
        }
        
        needsUpdate = true;
        nameFixedCount++;
      }
      
      // Case 3: "7Up" hoặc "Pepsi" đơn lẻ -> cần thêm "(Thường)" hoặc "(Up)"
      const lowerName = newName.toLowerCase();
      if ((lowerName === '7up' || lowerName === 'pepsi' || lowerName === '1 7up' || lowerName === '1 pepsi') && !newName.includes('(')) {
        // Kiểm tra xem có phải là Up không
        const isUp = option.description?.toLowerCase().includes('up') || 
                     option.name.toLowerCase().includes('up') ||
                     option.name.toLowerCase().includes('lớn');
        newName = isUp ? `${newName} (Up)` : `${newName} (Thường)`;
        needsUpdate = true;
        nameFixedCount++;
      }
      
      // Case 4: "1 7Up Thường" -> "1 7Up (Thường)"
      if (newName.match(/^\d+\s*(7Up|Pepsi)\s+Thường$/i)) {
        newName = newName.replace(/\s+Thường$/, ' (Thường)');
        needsUpdate = true;
        nameFixedCount++;
      }
      
      // Case 5: "1 7Up Up" -> "1 7Up (Up)"
      if (newName.match(/^\d+\s*(7Up|Pepsi)\s+Up$/i)) {
        newName = newName.replace(/\s+Up$/, ' (Up)');
        needsUpdate = true;
        nameFixedCount++;
      }

      if (newName !== option.name) {
        updates.name = newName;
      }

      // Sửa giá: nước ngọt thường = 0, Up = +5000đ
      const finalName = updates.name || option.name;
      const finalLowerName = finalName.toLowerCase();
      
      // Kiểm tra xem có phải là nước ngọt không
      const isDrink = finalLowerName.includes('7up') || 
                      finalLowerName.includes('pepsi') ||
                      finalLowerName.includes('nước');
      
      if (isDrink) {
        const isUp = finalLowerName.includes('(up)') || 
                     finalLowerName.includes('up') ||
                     finalLowerName.includes('lớn');
        
        const correctPrice = isUp ? 5000 * 100 : 0; // 5000 VND = 500000 cents, hoặc 0
        
        if (option.price !== correctPrice) {
          updates.price = correctPrice;
          needsUpdate = true;
          priceFixedCount++;
        }
      }

      if (needsUpdate) {
        await prisma.productOption.update({
          where: { id: option.id },
          data: updates,
        });
        
        console.log(`✅ Fixed: "${option.name}" -> "${updates.name || option.name}"`);
        if (updates.price !== undefined) {
          console.log(`   💰 Price: ${option.price / 100}đ -> ${updates.price / 100}đ`);
        }
        fixedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Fixed ${fixedCount} options`);
    console.log(`   - Name fixes: ${nameFixedCount}`);
    console.log(`   - Price fixes: ${priceFixedCount}`);
    console.log('\n✨ Hoàn thành!');
  } catch (error) {
    console.error('❌ Error fixing drink options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
fixDrinkOptions()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
