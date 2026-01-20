/**
 * Utility để mapping tên sản phẩm/category sang tên file ảnh
 * Hỗ trợ cả .webp, .png, .jpg
 * Tự động tìm ảnh trong folder anh-product dựa trên tên sản phẩm
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Normalize tên: loại bỏ dấu, chuyển thành lowercase, thay khoảng trắng bằng dấu gạch ngang
 */
function normalizeName(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu/cuối
}

/**
 * Tìm file ảnh trong folder assets dựa trên tên sản phẩm
 * Tìm kiếm thông minh: khớp chính xác hoặc khớp một phần
 */
function findImageByName(productName: string, assetsDir: string): string | null {
  const normalizedName = normalizeName(productName);
  const possibleExtensions = ['.webp', '.png', '.jpg', '.jpeg'];

  if (!fs.existsSync(assetsDir)) {
    return null;
  }

  const files = fs.readdirSync(assetsDir);
  
  // Loại bỏ các từ không quan trọng để tìm kiếm tốt hơn
  const stopWords = ['1', '2', '3', '4', '5', '6', 'mot', 'hai', 'ba', 'bon', 'nam', 'sau'];
  const nameWords = normalizedName
    .split('-')
    .filter(w => w.length > 2 && !stopWords.includes(w));
  
  let bestMatch: { file: string; score: number } | null = null;

  // Tìm file khớp tốt nhất
  for (const file of files) {
    const fileBaseName = path.basename(file, path.extname(file));
    const normalizedFile = normalizeName(fileBaseName);
    const ext = path.extname(file).toLowerCase();
    
    if (!possibleExtensions.includes(ext)) continue;

    // Tính điểm khớp
    let score = 0;
    
    // Khớp chính xác
    if (normalizedFile === normalizedName) {
      score = 100;
    }
    // File chứa toàn bộ tên sản phẩm
    else if (normalizedFile.includes(normalizedName)) {
      score = 80;
    }
    // Tên sản phẩm chứa tên file (ví dụ: "combo một mình" chứa "combo-1-minh-an-ngon")
    else if (normalizedName.includes(normalizedFile)) {
      score = 70;
    }
    // Khớp theo từng từ quan trọng
    else {
      const matchedWords = nameWords.filter(word => normalizedFile.includes(word)).length;
      if (matchedWords > 0) {
        score = (matchedWords / nameWords.length) * 60;
      }
    }

    // Lưu match tốt nhất
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { file, score };
    }
  }

  // Chỉ trả về nếu điểm khớp >= 50
  if (bestMatch && bestMatch.score >= 50) {
    return `/assets/${bestMatch.file}`;
  }

  return null;
}

/**
 * Mapping tên sản phẩm/category sang tên file ảnh
 * Hỗ trợ cả .webp, .png, .jpg
 */
export function getProductImage(productName: string, category: string): string | null {
  const name = productName.toLowerCase().trim();
  const cat = category.toLowerCase().trim();
  const assetsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'assets');

  // Ưu tiên: Tìm ảnh dựa trên tên sản phẩm trong folder assets
  const foundImage = findImageByName(productName, assetsDir);
  if (foundImage) {
    return foundImage;
  }

  // Fallback: Mapping dựa trên từ khóa trong tên sản phẩm (ưu tiên khớp chính xác)
  const imageMap: { [key: string]: string } = {
    // Combo - ưu tiên khớp chính xác
    'combo một mình ăn ngon': '/assets/combo-1-minh-an-ngon',
    'combo một mình': '/assets/combo-1-minh-an-ngon',
    'cặp đôi ăn ý': '/assets/cap-doi-an-y',
    'cặp đôi': '/assets/cap-doi-an-y',
    'cả nhà no nê': '/assets/combo-ca-nha-no-ne',
    'cả nhà': '/assets/combo-ca-nha-no-ne',
    'combo': '/assets/combo-1-minh-an-ngon',
    
    // Gà - ưu tiên theo số lượng (ưu tiên khớp chính xác)
    '4 miếng gà': '/assets/6-mieng-ga-gion-vui-ve',
    '4 miếng': '/assets/6-mieng-ga-gion-vui-ve',
    '6 miếng gà': '/assets/6-mieng-ga-gion-vui-ve',
    '2 miếng gà': '/assets/2-mieng-ga-gion-vui-ve',
    '2 gà giòn vui vẻ + 1 khoai tây chiên vừa + 1 nước ngọt': '/assets/2-ga-gion-vui-ve-1-khoai-tay-chien-vua-1-nuoc-ngot',
    '1 gà giòn vui vẻ + 1 khoai tây chiên vừa + 1 nước ngọt': '/assets/1-ga-gion-vui-ve-1-khoai-tay-chien-vua-1-nuoc-ngot',
    'gà giòn': '/assets/2-mieng-ga-gion-vui-ve',
    'gà rán': '/assets/2-mieng-ga-gion-vui-ve',
    'gà sốt cay': '/assets/spicy-chicken-wings',
    'miếng gà': '/assets/2-mieng-ga-gion-vui-ve',
    'cánh gà': '/assets/spicy-chicken-wings',
    
    // Mì Ý - ưu tiên khớp chính xác
    '1 mì ý sốt cay vừa + 1 gà giòn vui vẻ + 1 nước ngọt': '/assets/1-ga-gion-vui-ve-1-my-y-jolly-1-nuoc-ngot',
    '1 mì ý sốt cay vừa + 1 nước': '/assets/1-my-y-jolly-1-nuoc-ngot',
    'mì ý sốt cay vừa': '/assets/1-my-y-jolly',
    'mì ý': '/assets/1-my-y-jolly',
    'mỳ ý': '/assets/1-my-y-jolly',
    'carbonara': '/assets/classic-carbonara',
    'bolognese': '/assets/bolognese-pasta',
    
    // Burger - ưu tiên khớp chính xác
    '1 burger tôm + 1 khoai tây chiên vừa + 1 nước ngọt': '/assets/1-burger-tom-1-khoai-tay-chien-vua-1-nuoc-ngot',
    '1 burger tôm + 1 nước ngọt': '/assets/1-burger-tom-1-nuoc-ngot',
    '1 burger tôm': '/assets/1-burger-tom',
    'burger tôm': '/assets/1-burger-tom',
    'burger': '/assets/1-burger-tom',
    'burger bò': '/assets/classic-burger',
    'burger phô mai': '/assets/cheese-burger',
    'burger gà': '/assets/cheese-burger',
    
    // Khoai tây - ưu tiên khớp chính xác
    'khoai tây chiên lắc bbq lớn': '/assets/khoai-tay-lac-vi-bbq-lon',
    'khoai tây chiên lắc bbq vừa': '/assets/khoai-tay-lac-vi-bbq-vua',
    'khoai tây chiên lớn': '/assets/khoai-tay-chien-lon',
    'khoai tây chiên vừa': '/assets/khoai-tay-chien-vua',
    'khoai tây': '/assets/khoai-tay-chien-vua',
    'khoai': '/assets/khoai-tay-chien-vua',
    
    // Nước uống - ưu tiên khớp chính xác
    'pepsi lớn': '/assets/pepsi-lon',
    'pepsi vừa': '/assets/pepsi-vua',
    '7up lớn': '/assets/7up-lon',
    '7up vừa': '/assets/7up-vua',
    'pepsi': '/assets/pepsi-vua',
    '7up': '/assets/7up-vua',
    'nước ngọt': '/assets/7up-vua',
    'trà chanh hạt chia': '/assets/tra-chanh-hat-chia',
    'trà chanh': '/assets/tra-chanh-hat-chia',
    
    // Tráng miệng - ưu tiên khớp chính xác
    'kem sundae dâu': '/assets/kem-sundae-dau',
    'kem socola (cúp)': '/assets/kem-socola-cup',
    'kem vani (cúp)': '/assets/kem-sua-tuoi-cup',
    'kem socola': '/assets/kem-socola-cup',
    'kem vani': '/assets/kem-sua-tuoi-cup',
    'sundae': '/assets/kem-sundae-dau',
    'kem': '/assets/kem-sua-tuoi-cup',
  };

  // Tìm match trong mapping (ưu tiên khớp dài nhất trước)
  const sortedKeywords = Object.keys(imageMap).sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    if (name.includes(keyword)) {
      const imageBasePath = imageMap[keyword];
      // Kiểm tra file có tồn tại không (thử .webp trước, sau đó .png, .jpg)
      const possibleExtensions = ['.webp', '.png', '.jpg', '.jpeg'];
      
      for (const ext of possibleExtensions) {
        const fullPath = path.join(assetsDir, imageBasePath.replace('/assets/', '') + ext);
        if (fs.existsSync(fullPath)) {
          return imageBasePath + ext;
        }
      }
    }
  }

  // Fallback: dựa trên category
  const categoryMap: { [key: string]: string } = {
    'món ngon phải thử': '/assets/combo-1-minh-an-ngon',
    'gà giòn vui vẻ': '/assets/2-mieng-ga-gion-vui-ve',
    'mỳ ý': '/assets/1-my-y-jolly',
    'burger': '/assets/1-burger-tom',
    'phần ăn phụ': '/assets/khoai-tay-chien-vua',
    'tráng miệng': '/assets/kem-sua-tuoi-cup',
    'thức uống': '/assets/7up-vua',
  };

  for (const [catKeyword, imageBasePath] of Object.entries(categoryMap)) {
    if (cat.includes(catKeyword)) {
      // Kiểm tra file có tồn tại không
      const possibleExtensions = ['.webp', '.png', '.jpg', '.jpeg'];
      
      for (const ext of possibleExtensions) {
        const fullPath = path.join(assetsDir, imageBasePath.replace('/assets/', '') + ext);
        if (fs.existsSync(fullPath)) {
          return imageBasePath + ext;
        }
      }
    }
  }

  // Không tìm thấy, trả về null
  return null;
}
