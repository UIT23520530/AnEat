import { PrismaClient, UserRole, OrderStatus, PaymentMethod, PaymentStatus, TemplateCategory, TemplateStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ============ IMAGE MAPPING UTILITIES ============

function normalizeName(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function findImageByName(productName: string, assetsDir: string): string | null {
  const normalizedName = normalizeName(productName);
  const possibleExtensions = ['.webp', '.png', '.jpg', '.jpeg'];

  if (!fs.existsSync(assetsDir)) {
    return null;
  }

  const files = fs.readdirSync(assetsDir);
  const stopWords = ['1', '2', '3', '4', '5', '6', 'mot', 'hai', 'ba', 'bon', 'nam', 'sau'];
  const nameWords = normalizedName.split('-').filter(w => w.length > 2 && !stopWords.includes(w));

  let bestMatch: { file: string; score: number } | null = null;

  for (const file of files) {
    const fileBaseName = path.basename(file, path.extname(file));
    const normalizedFile = normalizeName(fileBaseName);
    const ext = path.extname(file).toLowerCase();

    if (!possibleExtensions.includes(ext)) continue;

    let score = 0;
    if (normalizedFile === normalizedName) {
      score = 100;
    } else if (normalizedFile.includes(normalizedName)) {
      score = 80;
    } else if (normalizedName.includes(normalizedFile)) {
      score = 70;
    } else {
      const matchedWords = nameWords.filter(word => normalizedFile.includes(word)).length;
      if (matchedWords > 0) {
        score = (matchedWords / nameWords.length) * 60;
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { file, score };
    }
  }

  if (bestMatch && bestMatch.score >= 50) {
    return `/assets/${bestMatch.file}`;
  }
  return null;
}

// Mapping thủ công cho các sản phẩm không match tự động
const manualImageMapping: Record<string, string> = {
  'kem vani (cúp)': '/assets/kem-sua-tuoi-cup.webp',
  'kem vani': '/assets/kem-sua-tuoi-cup.webp',
};

function getProductImage(productName: string): string {
  const lowerName = productName.toLowerCase();

  // Kiểm tra mapping thủ công trước
  if (manualImageMapping[lowerName]) {
    return manualImageMapping[lowerName];
  }

  const assetsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'assets');
  const foundImage = findImageByName(productName, assetsDir);
  if (foundImage) {
    return foundImage;
  }
  return '/assets/default-product.jpg';
}

// ============ DATA DEFINITIONS ============

const branchesData = [
  {
    code: 'HCM-Q1',
    name: 'AnEat Quận 1',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '0281234567',
    email: 'q1@aneat.com',
  },
  {
    code: 'HCM-Q3',
    name: 'AnEat Quận 3',
    address: '456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM',
    phone: '0283456789',
    email: 'q3@aneat.com',
  },
  {
    code: 'HCM-TD',
    name: 'AnEat Thủ Đức',
    address: '789 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM',
    phone: '0287891234',
    email: 'thuduc@aneat.com',
  },
];

const adminsData = [
  {
    email: 'admin@aneat.com',
    password: 'admin123',
    name: 'Nguyễn Văn Admin',
    phone: '0900000001',
    role: UserRole.ADMIN_SYSTEM,
    branchCode: null,
  },
  {
    email: 'manager.q1@aneat.com',
    password: 'manager123',
    name: 'Trần Thị Quản Lý Q1',
    phone: '0901111111',
    role: UserRole.ADMIN_BRAND,
    branchCode: 'HCM-Q1',
  },
  {
    email: 'manager.q3@aneat.com',
    password: 'manager123',
    name: 'Lê Văn Quản Lý Q3',
    phone: '0902222222',
    role: UserRole.ADMIN_BRAND,
    branchCode: 'HCM-Q3',
  },
  {
    email: 'manager.td@aneat.com',
    password: 'manager123',
    name: 'Phạm Thị Quản Lý TD',
    phone: '0903333333',
    role: UserRole.ADMIN_BRAND,
    branchCode: 'HCM-TD',
  },
];

const staffData = [
  { email: 'staff.q1.01@aneat.com', name: 'Nguyễn Văn A', phone: '0911111111', branchCode: 'HCM-Q1' },
  { email: 'staff.q1.02@aneat.com', name: 'Trần Thị B', phone: '0911111112', branchCode: 'HCM-Q1' },
  { email: 'staff.q1.03@aneat.com', name: 'Lê Văn C', phone: '0911111113', branchCode: 'HCM-Q1' },
  { email: 'staff.q3.01@aneat.com', name: 'Phạm Thị D', phone: '0912222221', branchCode: 'HCM-Q3' },
  { email: 'staff.q3.02@aneat.com', name: 'Hoàng Văn E', phone: '0912222222', branchCode: 'HCM-Q3' },
  { email: 'staff.q3.03@aneat.com', name: 'Vũ Thị F', phone: '0912222223', branchCode: 'HCM-Q3' },
  { email: 'staff.td.01@aneat.com', name: 'Đặng Văn G', phone: '0913333331', branchCode: 'HCM-TD' },
  { email: 'staff.td.02@aneat.com', name: 'Bùi Thị H', phone: '0913333332', branchCode: 'HCM-TD' },
  { email: 'staff.td.03@aneat.com', name: 'Trương Văn I', phone: '0913333333', branchCode: 'HCM-TD' },
];

const logisticsData = [
  { email: 'logistics01@aneat.com', name: 'Nguyễn Văn Giao', phone: '0981111111' },
  { email: 'logistics02@aneat.com', name: 'Trần Thị Vận', phone: '0982222222' },
  { email: 'logistics03@aneat.com', name: 'Lê Văn Chuyển', phone: '0983333333' },
  { email: 'logistics04@aneat.com', name: 'Phạm Văn Tải', phone: '0984444444' },
  { email: 'logistics05@aneat.com', name: 'Hoàng Văn Kho', phone: '0985555555' },
];

const customersData = [
  { email: 'customer01@gmail.com', name: 'Khách Hàng A', phone: '0921111111' },
  { email: 'customer02@gmail.com', name: 'Khách Hàng B', phone: '0922222222' },
  { email: 'customer03@gmail.com', name: 'Khách Hàng C', phone: '0923333333' },
  { email: 'customer04@gmail.com', name: 'Khách Hàng D', phone: '0924444444' },
  { email: 'customer05@gmail.com', name: 'Khách Hàng E', phone: '0925555555' },
];

// Categories từ newdata.md
const categories = [
  {
    code: 'MON_NGON_PHAI_THU',
    name: 'Món ngon phải thử',
    description: 'Các combo đặc biệt phải thử',
    image: '/images/categories/combo.jpg',
    isActive: true,
  },
  {
    code: 'GA_GION_VUI_VE',
    name: 'Gà giòn vui vẻ',
    description: 'Gà rán giòn tan, ngon tuyệt',
    image: '/images/categories/fried-chicken.jpg',
    isActive: true,
  },
  {
    code: 'MY_Y',
    name: 'Mỳ ý',
    description: 'Mỳ Ý sốt cay đặc biệt',
    image: '/images/categories/pasta.jpg',
    isActive: true,
  },
  {
    code: 'BURGER',
    name: 'Burger',
    description: 'Burger tôm thơm ngon',
    image: '/images/categories/burger.jpg',
    isActive: true,
  },
  {
    code: 'PHAN_AN_PHU',
    name: 'Phần ăn phụ',
    description: 'Khoai tây chiên và các món phụ',
    image: '/images/categories/sides.jpg',
    isActive: true,
  },
  {
    code: 'TRANG_MIENG',
    name: 'Tráng miệng',
    description: 'Kem và các món tráng miệng',
    image: '/images/categories/desserts.jpg',
    isActive: true,
  },
  {
    code: 'THUC_UONG',
    name: 'Thức uống',
    description: 'Nước ngọt và trà chanh',
    image: '/images/categories/drinks.jpg',
    isActive: true,
  },
];

// Product Options từ newdata.md
type ProductOptionData = {
  name: string;
  description?: string;
  price: number;
  type: string;
  isRequired?: boolean;
  order: number;
};

const productOptionsMap: { [productCode: string]: ProductOptionData[] } = {
  'COMBO-001': [
    { name: 'Chọn Gà: 1 Miếng Gà Giòn', description: 'Gà giòn không cay', price: 0, type: 'CHICKEN', isRequired: true, order: 1 },
    { name: 'Chọn Gà: Miếng Gà Sốt Cay', description: 'Gà giòn sốt cay', price: 0, type: 'CHICKEN', isRequired: true, order: 2 },
    { name: 'Chọn Mì: Mì Ý (Up)', description: 'Mì Ý size lớn', price: 10000, type: 'PASTA', isRequired: true, order: 3 },
    { name: 'Chọn Mì: Mì Ý Sốt Cay Vừa', description: 'Mì Ý sốt cay size vừa', price: 15000, type: 'PASTA', isRequired: true, order: 4 },
    { name: 'Chọn Mì: Mì Ý Sốt Cay (Up)', description: 'Mì Ý sốt cay size lớn', price: 20000, type: 'PASTA', isRequired: true, order: 5 },
    { name: 'Nước Ngọt: 1 7Up Thường', description: '7Up size vừa', price: 0, type: 'DRINK', isRequired: true, order: 6 },
    { name: 'Nước Ngọt: 1 7Up Up', description: '7Up size lớn', price: 10000, type: 'DRINK', isRequired: true, order: 7 },
    { name: 'Nước Ngọt: 1 Pepsi Thường', description: 'Pepsi size vừa', price: 0, type: 'DRINK', isRequired: true, order: 8 },
    { name: 'Nước Ngọt: 1 Pepsi Up', description: 'Pepsi size lớn', price: 10000, type: 'DRINK', isRequired: true, order: 9 },
  ],
  'COMBO-002': [
    { name: 'Chọn Gà 1: Gà Giòn', description: 'Gà giòn không cay', price: 0, type: 'CHICKEN', isRequired: true, order: 1 },
    { name: 'Chọn Gà 1: Gà Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', isRequired: true, order: 2 },
    { name: 'Chọn Gà 2: Gà Giòn', description: 'Gà giòn không cay', price: 0, type: 'CHICKEN', isRequired: true, order: 3 },
    { name: 'Chọn Gà 2: Gà Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', isRequired: true, order: 4 },
    { name: 'Chọn Mì 1: Mì Ý (Up)', description: 'Mì Ý size lớn', price: 10000, type: 'PASTA', isRequired: true, order: 5 },
    { name: 'Chọn Mì 1: Mì Ý Sốt Cay Vừa', description: 'Mì Ý sốt cay vừa', price: 15000, type: 'PASTA', isRequired: true, order: 6 },
    { name: 'Chọn Mì 1: Mì Ý Sốt Cay (Up)', description: 'Mì Ý sốt cay lớn', price: 20000, type: 'PASTA', isRequired: true, order: 7 },
    { name: 'Chọn Mì 2: Mì Ý (Up)', description: 'Mì Ý size lớn', price: 10000, type: 'PASTA', isRequired: true, order: 8 },
    { name: 'Chọn Mì 2: Mì Ý Sốt Cay Vừa', description: 'Mì Ý sốt cay vừa', price: 15000, type: 'PASTA', isRequired: true, order: 9 },
    { name: 'Chọn Mì 2: Mì Ý Sốt Cay (Up)', description: 'Mì Ý sốt cay lớn', price: 20000, type: 'PASTA', isRequired: true, order: 10 },
    { name: 'Nước Ngọt 1: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', isRequired: true, order: 11 },
    { name: 'Nước Ngọt 1: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', isRequired: true, order: 12 },
    { name: 'Nước Ngọt 1: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', isRequired: true, order: 13 },
    { name: 'Nước Ngọt 1: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', isRequired: true, order: 14 },
    { name: 'Nước Ngọt 2: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', isRequired: true, order: 15 },
    { name: 'Nước Ngọt 2: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', isRequired: true, order: 16 },
    { name: 'Nước Ngọt 2: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', isRequired: true, order: 17 },
    { name: 'Nước Ngọt 2: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', isRequired: true, order: 18 },
  ],
  'COMBO-003': [
    { name: 'Chọn Gà 1: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', isRequired: true, order: 1 },
    { name: 'Chọn Gà 1: Gà Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', isRequired: true, order: 2 },
    { name: 'Chọn Gà 2: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', isRequired: true, order: 3 },
    { name: 'Chọn Gà 2: Gà Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', isRequired: true, order: 4 },
    { name: 'Chọn Gà 3: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', isRequired: true, order: 5 },
    { name: 'Chọn Gà 3: Gà Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', isRequired: true, order: 6 },
    { name: 'Chọn Mì 1: Mì Ý (Up)', description: 'Mì Ý lớn', price: 10000, type: 'PASTA', isRequired: true, order: 7 },
    { name: 'Chọn Mì 1: Mì Ý Sốt Cay Vừa', description: 'Mì Ý sốt cay vừa', price: 15000, type: 'PASTA', isRequired: true, order: 8 },
    { name: 'Chọn Mì 1: Mì Ý Sốt Cay (Up)', description: 'Mì Ý sốt cay lớn', price: 20000, type: 'PASTA', isRequired: true, order: 9 },
    { name: 'Chọn Mì 2: Mì Ý (Up)', description: 'Mì Ý lớn', price: 10000, type: 'PASTA', isRequired: true, order: 10 },
    { name: 'Chọn Mì 2: Mì Ý Sốt Cay Vừa', description: 'Mì Ý sốt cay vừa', price: 15000, type: 'PASTA', isRequired: true, order: 11 },
    { name: 'Chọn Mì 2: Mì Ý Sốt Cay (Up)', description: 'Mì Ý sốt cay lớn', price: 20000, type: 'PASTA', isRequired: true, order: 12 },
    { name: 'Chọn Khoai Tây: Vừa', description: 'Khoai tây vừa', price: 0, type: 'SIDE', isRequired: true, order: 13 },
    { name: 'Chọn Khoai Tây: Lớn', description: 'Khoai tây lớn', price: 5000, type: 'SIDE', isRequired: true, order: 14 },
    { name: 'Chọn Khoai Tây: BBQ', description: 'Khoai tây BBQ', price: 5000, type: 'SIDE', isRequired: true, order: 15 },
    { name: 'Nước Ngọt 1: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', isRequired: true, order: 16 },
    { name: 'Nước Ngọt 1: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', isRequired: true, order: 17 },
    { name: 'Nước Ngọt 1: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', isRequired: true, order: 18 },
    { name: 'Nước Ngọt 1: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', isRequired: true, order: 19 },
    { name: 'Nước Ngọt 2: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', isRequired: true, order: 20 },
    { name: 'Nước Ngọt 2: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', isRequired: true, order: 21 },
    { name: 'Nước Ngọt 2: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', isRequired: true, order: 22 },
    { name: 'Nước Ngọt 2: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', isRequired: true, order: 23 },
    { name: 'Nước Ngọt 3: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', isRequired: true, order: 24 },
    { name: 'Nước Ngọt 3: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', isRequired: true, order: 25 },
    { name: 'Nước Ngọt 3: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', isRequired: true, order: 26 },
    { name: 'Nước Ngọt 3: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', isRequired: true, order: 27 },
  ],
  'CHICKEN-001': [
    { name: 'Chọn Gà 1: Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 1 },
    { name: 'Chọn Gà 2: Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 2 },
  ],
  'CHICKEN-002': [
    { name: 'Chọn Gà 1: Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 1 },
    { name: 'Chọn Gà 2: Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 2 },
    { name: 'Chọn Gà 3: Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 3 },
    { name: 'Chọn Gà 4: Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 4 },
  ],
  'CHICKEN-003': [
    { name: 'Chọn Gà 1: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', order: 1 },
    { name: 'Chọn Gà 1: Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 2 },
    { name: 'Chọn Gà 2: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', order: 3 },
    { name: 'Chọn Gà 2: Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 4 },
    { name: 'Chọn Khoai Tây: Vừa', description: 'Khoai tây vừa', price: 0, type: 'SIDE', order: 5 },
    { name: 'Chọn Khoai Tây: Lớn', description: 'Khoai tây lớn', price: 5000, type: 'SIDE', order: 6 },
    { name: 'Chọn Khoai Tây: BBQ', description: 'Khoai tây BBQ', price: 5000, type: 'SIDE', order: 7 },
    { name: 'Nước Ngọt: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', order: 8 },
    { name: 'Nước Ngọt: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', order: 9 },
    { name: 'Nước Ngọt: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', order: 10 },
    { name: 'Nước Ngọt: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', order: 11 },
  ],
  'CHICKEN-004': [
    { name: 'Chọn Gà: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', order: 1 },
    { name: 'Chọn Gà: Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 2 },
    { name: 'Chọn Khoai Tây: Vừa', description: 'Khoai tây vừa', price: 0, type: 'SIDE', order: 3 },
    { name: 'Chọn Khoai Tây: Lớn', description: 'Khoai tây lớn', price: 5000, type: 'SIDE', order: 4 },
    { name: 'Chọn Khoai Tây: BBQ', description: 'Khoai tây BBQ', price: 5000, type: 'SIDE', order: 5 },
    { name: 'Nước Ngọt: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', order: 6 },
    { name: 'Nước Ngọt: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', order: 7 },
    { name: 'Nước Ngọt: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', order: 8 },
    { name: 'Nước Ngọt: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', order: 9 },
  ],
  'PASTA-001': [
    { name: 'Chọn Mì: Mỳ Ý Sốt Cay Lớn', description: 'Size lớn', price: 5000, type: 'PASTA', order: 1 },
  ],
  'PASTA-002': [
    { name: 'Chọn Mì: Mỳ Ý Sốt Cay Lớn', description: 'Size lớn', price: 5000, type: 'PASTA', order: 1 },
    { name: 'Nước Ngọt: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', order: 2 },
    { name: 'Nước Ngọt: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', order: 3 },
    { name: 'Nước Ngọt: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', order: 4 },
    { name: 'Nước Ngọt: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', order: 5 },
  ],
  'PASTA-003': [
    { name: 'Chọn Gà: Gà Giòn', description: 'Gà giòn', price: 0, type: 'CHICKEN', order: 1 },
    { name: 'Chọn Gà: Sốt Cay', description: 'Gà sốt cay', price: 0, type: 'CHICKEN', order: 2 },
    { name: 'Chọn Mì: Sốt Cay Vừa', description: 'Sốt cay vừa', price: 0, type: 'PASTA', order: 3 },
    { name: 'Chọn Mì: Sốt Cay (Up)', description: 'Sốt cay lớn', price: 10000, type: 'PASTA', order: 4 },
    { name: 'Nước Ngọt: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', order: 5 },
    { name: 'Nước Ngọt: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', order: 6 },
    { name: 'Nước Ngọt: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', order: 7 },
    { name: 'Nước Ngọt: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', order: 8 },
  ],
  'BURGER-001': [
    { name: 'Chọn Khoai: Vừa', description: 'Khoai tây vừa', price: 0, type: 'SIDE', order: 1 },
    { name: 'Chọn Khoai: Lớn (Up)', description: 'Khoai tây lớn', price: 10000, type: 'SIDE', order: 2 },
    { name: 'Chọn Khoai: BBQ', description: 'Khoai tây BBQ', price: 5000, type: 'SIDE', order: 3 },
    { name: 'Nước Ngọt: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', order: 4 },
    { name: 'Nước Ngọt: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', order: 5 },
    { name: 'Nước Ngọt: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', order: 6 },
    { name: 'Nước Ngọt: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', order: 7 },
  ],
  'BURGER-002': [
    { name: 'Nước Ngọt: 7Up Thường', description: '7Up vừa', price: 0, type: 'DRINK', order: 1 },
    { name: 'Nước Ngọt: 7Up Up', description: '7Up lớn', price: 10000, type: 'DRINK', order: 2 },
    { name: 'Nước Ngọt: Pepsi Thường', description: 'Pepsi vừa', price: 0, type: 'DRINK', order: 3 },
    { name: 'Nước Ngọt: Pepsi Up', description: 'Pepsi lớn', price: 10000, type: 'DRINK', order: 4 },
  ],
};

// Products từ newdata.md - sẽ được nhân bản cho mỗi branch
const baseProducts = [
  // Món ngon phải thử
  {
    code: 'COMBO-001',
    name: 'COMBO MỘT MÌNH ĂN NGON',
    description: '1 Gà Giòn Vui Vẻ + 1 Mì Ý + 1 Nước ngọt + 1 Tương Chua Ngọt',
    price: 78000,
    costPrice: 45000,
    quantity: 100,
    prepTime: 15,
    categoryCode: 'MON_NGON_PHAI_THU',
  },
  {
    code: 'COMBO-002',
    name: 'CẶP ĐÔI ĂN Ý',
    description: '2 Gà Giòn Vui Vẻ + 2 Mì Ý vừa + 1 Khoai tây chiên vừa + 2 Nước ngọt vừa + 2 Tương Chua Ngọt + 1 Tương Cà',
    price: 145500,
    costPrice: 85000,
    quantity: 80,
    prepTime: 20,
    categoryCode: 'MON_NGON_PHAI_THU',
  },
  {
    code: 'COMBO-003',
    name: 'CẢ NHÀ NO NÊ',
    description: '3 Gà giòn vui vẻ + 2 Mì Ý vừa + 1 Khoai tây chiên vừa + 3 Nước ngọt vừa + 3 Tương Chua Ngọt + 1 Tương Cà',
    price: 185000,
    costPrice: 110000,
    quantity: 60,
    prepTime: 25,
    categoryCode: 'MON_NGON_PHAI_THU',
  },

  // Gà giòn vui vẻ
  {
    code: 'CHICKEN-001',
    name: '2 MIẾNG GÀ',
    description: '2 Miếng Gà + 2 Tương Ớt Chua Ngọt',
    price: 66000,
    costPrice: 35000,
    quantity: 150,
    prepTime: 12,
    categoryCode: 'GA_GION_VUI_VE',
  },
  {
    code: 'CHICKEN-002',
    name: '4 MIẾNG GÀ',
    description: '4 Miếng Gà + 4 Tương Ớt Chua Ngọt',
    price: 126000,
    costPrice: 68000,
    quantity: 100,
    prepTime: 15,
    categoryCode: 'GA_GION_VUI_VE',
  },
  {
    code: 'CHICKEN-003',
    name: '2 GÀ GIÒN VUI VẺ + 1 KHOAI TÂY CHIÊN VỪA + 1 NƯỚC NGỌT',
    description: '2 Gà Giòn Vui Vẻ + 1 Khoai tây chiên vừa + 1 Nước ngọt + 2 Tương Chua Ngọt + 1 Tương Cà',
    price: 91000,
    costPrice: 52000,
    quantity: 120,
    prepTime: 15,
    categoryCode: 'GA_GION_VUI_VE',
  },
  {
    code: 'CHICKEN-004',
    name: '1 GÀ GIÒN VUI VẺ + 1 KHOAI TÂY CHIÊN VỪA + 1 NƯỚC NGỌT',
    description: '1 Gà Giòn Vui Vẻ + 1 Khoai tây chiên vừa + 1 Nước ngọt + 1 Tương Chua Ngọt + 1 Tương Cà',
    price: 58000,
    costPrice: 32000,
    quantity: 130,
    prepTime: 12,
    categoryCode: 'GA_GION_VUI_VE',
  },

  // Mỳ Ý
  {
    code: 'PASTA-001',
    name: 'MÌ Ý SỐT CAY VỪA',
    description: 'Mì Ý Sốt Cay vừa',
    price: 40000,
    costPrice: 22000,
    quantity: 200,
    prepTime: 10,
    categoryCode: 'MY_Y',
  },
  {
    code: 'PASTA-002',
    name: '1 MÌ Ý SỐT CAY VỪA + 1 NƯỚC',
    description: '1 Mì Ý Sốt Cay vừa + 1 Nước ngọt',
    price: 50000,
    costPrice: 28000,
    quantity: 180,
    prepTime: 12,
    categoryCode: 'MY_Y',
  },
  {
    code: 'PASTA-003',
    name: '1 MÌ Ý SỐT CAY VỪA + 1 GÀ GIÒN VUI VẺ + 1 NƯỚC NGỌT',
    description: 'Mì Ý Sốt Cay vừa + 1 Gà Giòn Vui Vẻ + 1 Nước ngọt + 1 Tương Chua Ngọt',
    price: 83000,
    costPrice: 48000,
    quantity: 150,
    prepTime: 15,
    categoryCode: 'MY_Y',
  },

  // Burger
  {
    code: 'BURGER-001',
    name: '1 BURGER TÔM + 1 KHOAI TÂY CHIÊN VỪA + 1 NƯỚC NGỌT',
    description: '1 Burger Tôm + 1 Khoai tây chiên vừa + 1 Nước ngọt + 1 Tương Cà',
    price: 65000,
    costPrice: 38000,
    quantity: 140,
    prepTime: 12,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-002',
    name: '1 BURGER TÔM + 1 NƯỚC NGỌT',
    description: '1 Burger Tôm + 1 Nước ngọt',
    price: 50000,
    costPrice: 30000,
    quantity: 160,
    prepTime: 10,
    categoryCode: 'BURGER',
  },
  {
    code: 'BURGER-003',
    name: '1 BURGER TÔM',
    description: 'Burger Tôm đơn',
    price: 40000,
    costPrice: 24000,
    quantity: 180,
    prepTime: 8,
    categoryCode: 'BURGER',
  },

  // Phần ăn phụ
  {
    code: 'SIDE-001',
    name: 'KHOAI TÂY CHIÊN VỪA',
    description: 'Khoai tây chiên giòn tan - Size vừa',
    price: 20000,
    costPrice: 8000,
    quantity: 250,
    prepTime: 5,
    categoryCode: 'PHAN_AN_PHU',
  },
  {
    code: 'SIDE-002',
    name: 'KHOAI TÂY CHIÊN LẮC BBQ VỪA',
    description: 'Khoai tây chiên lắc BBQ - Size vừa',
    price: 25000,
    costPrice: 10000,
    quantity: 200,
    prepTime: 6,
    categoryCode: 'PHAN_AN_PHU',
  },
  {
    code: 'SIDE-003',
    name: 'KHOAI TÂY CHIÊN LỚN',
    description: 'Khoai tây chiên giòn tan - Size lớn',
    price: 25000,
    costPrice: 10000,
    quantity: 220,
    prepTime: 6,
    categoryCode: 'PHAN_AN_PHU',
  },
  {
    code: 'SIDE-004',
    name: 'KHOAI TÂY CHIÊN LẮC BBQ LỚN',
    description: 'Khoai tây chiên lắc BBQ - Size lớn',
    price: 35000,
    costPrice: 14000,
    quantity: 180,
    prepTime: 7,
    categoryCode: 'PHAN_AN_PHU',
  },

  // Tráng miệng
  {
    code: 'DESSERT-001',
    name: 'KEM VANI (CÚP)',
    description: 'Kem vani thơm béo trong cốc',
    price: 5000,
    costPrice: 2000,
    quantity: 300,
    prepTime: 2,
    categoryCode: 'TRANG_MIENG',
  },
  {
    code: 'DESSERT-002',
    name: 'KEM SOCOLA (CÚP)',
    description: 'Kem socola đậm đà trong cốc',
    price: 7000,
    costPrice: 3000,
    quantity: 280,
    prepTime: 2,
    categoryCode: 'TRANG_MIENG',
  },
  {
    code: 'DESSERT-003',
    name: 'KEM SUNDAE DÂU',
    description: 'Kem sundae với sốt dâu ngọt dịu',
    price: 15000,
    costPrice: 6000,
    quantity: 200,
    prepTime: 3,
    categoryCode: 'TRANG_MIENG',
  },

  // Thức uống
  {
    code: 'DRINK-001',
    name: 'TRÀ CHANH HẠT CHIA',
    description: 'Trà chanh hạt chia mát lạnh',
    price: 20000,
    costPrice: 8000,
    quantity: 250,
    prepTime: 3,
    categoryCode: 'THUC_UONG',
  },
  {
    code: 'DRINK-002',
    name: 'PEPSI VỪA',
    description: 'Nước ngọt Pepsi - Size vừa',
    price: 12000,
    costPrice: 5000,
    quantity: 400,
    prepTime: 2,
    categoryCode: 'THUC_UONG',
  },
  {
    code: 'DRINK-003',
    name: '7UP VỪA',
    description: 'Nước ngọt 7Up - Size vừa',
    price: 12000,
    costPrice: 5000,
    quantity: 400,
    prepTime: 2,
    categoryCode: 'THUC_UONG',
  },
  {
    code: 'DRINK-004',
    name: 'PEPSI LỚN',
    description: 'Nước ngọt Pepsi - Size lớn',
    price: 17000,
    costPrice: 7000,
    quantity: 350,
    prepTime: 2,
    categoryCode: 'THUC_UONG',
  },
  {
    code: 'DRINK-005',
    name: '7UP LỚN',
    description: 'Nước ngọt 7Up - Size lớn',
    price: 17000,
    costPrice: 7000,
    quantity: 350,
    prepTime: 2,
    categoryCode: 'THUC_UONG',
  },
];

const banners = [
  {
    imageUrl: '/assets/fried-chicken-combo-meal.jpg',
    title: 'NO CĂNG BỤNG VUI BẬT MOOD',
    description: 'Combo siêu tiết kiệm chỉ 79.000đ',
    badge: 'HOT',
    displayOrder: 0,
    isActive: true,
  },
  {
    imageUrl: '/assets/cheese-burger.png',
    title: 'BURGER PHÔ MAI MỚI',
    description: 'Thử ngay burger phô mai tan chảy',
    badge: 'MỚI',
    displayOrder: 1,
    isActive: true,
  },
  {
    imageUrl: '/assets/classic-carbonara.png',
    title: 'MỲ Ý THƯỢNG HẠNG',
    description: 'Mỳ Ý Carbonara đặc biệt',
    badge: null,
    displayOrder: 2,
    isActive: true,
  },
];

const promotionsData = [
  {
    code: 'COMBO50K',
    type: 'FIXED' as const,
    value: 50000,
    maxUses: 1000,
    usedCount: 45,
    isActive: true,
    expiryDate: new Date('2026-12-31'),
    minOrderAmount: 200000,
  },
  {
    code: 'SALE20',
    type: 'PERCENTAGE' as const,
    value: 20,
    maxUses: 500,
    usedCount: 123,
    isActive: true,
    expiryDate: new Date('2026-06-30'),
    minOrderAmount: 100000,
  },
  {
    code: 'SALE30',
    type: 'PERCENTAGE' as const,
    value: 30,
    maxUses: 300,
    usedCount: 87,
    isActive: true,
    expiryDate: new Date('2026-12-31'),
    minOrderAmount: 250000,
  },
];

// ============ CLEANUP FUNCTION ============

async function cleanupDatabase() {
  console.log('🧹 Cleaning up existing data...\n');

  await prisma.billHistory.deleteMany();
  console.log('  ✅ Cleared bill histories');

  await prisma.bill.deleteMany();
  console.log('  ✅ Cleared bills');

  await prisma.orderItemOption.deleteMany();
  console.log('  ✅ Cleared order item options');

  await prisma.orderItem.deleteMany();
  console.log('  ✅ Cleared order items');

  await prisma.order.deleteMany();
  console.log('  ✅ Cleared orders');

  await prisma.stockTransaction.deleteMany();
  console.log('  ✅ Cleared stock transactions');

  await prisma.stockRequest.deleteMany();
  console.log('  ✅ Cleared stock requests');

  await prisma.productOption.deleteMany();
  console.log('  ✅ Cleared product options');

  await prisma.inventory.deleteMany();
  console.log('  ✅ Cleared inventories');

  await prisma.product.deleteMany();
  console.log('  ✅ Cleared products');

  await prisma.productCategory.deleteMany();
  console.log('  ✅ Cleared product categories');

  await prisma.review.deleteMany();
  console.log('  ✅ Cleared reviews');

  await prisma.customer.deleteMany();
  console.log('  ✅ Cleared customers');

  await prisma.promotion.deleteMany();
  console.log('  ✅ Cleared promotions');

  await prisma.banner.deleteMany();
  console.log('  ✅ Cleared banners');

  await prisma.user.deleteMany();
  console.log('  ✅ Cleared users');

  await prisma.branch.deleteMany();
  console.log('  ✅ Cleared branches');

  await prisma.systemSetting.deleteMany();
  console.log('  ✅ Cleared system settings');

  await prisma.template.deleteMany();
  console.log('  ✅ Cleared templates');

  console.log('\n✨ Database cleaned successfully!\n');
}

// ============ SEED FUNCTIONS ============

async function seedBranches() {
  console.log('\n📍 Seeding branches...');

  const branches = [];
  for (const branchData of branchesData) {
    const branch = await prisma.branch.create({
      data: branchData,
    });
    branches.push(branch);
    console.log(`  ✅ ${branch.name} (${branch.code})`);
  }

  return branches;
}

async function seedAdminsAndManagers(branches: any[]) {
  console.log('\n👤 Seeding admin & managers...');

  const users = [];
  for (const adminData of adminsData) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const branch = adminData.branchCode
      ? branches.find(b => b.code === adminData.branchCode)
      : null;

    const user = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        phone: adminData.phone,
        role: adminData.role,
        branchId: branch?.id || null,
        isActive: true,
      },
    });

    users.push(user);
    console.log(`  ✅ ${user.name} - ${user.role} (${user.email})`);

    if (branch && adminData.role === UserRole.ADMIN_BRAND) {
      await prisma.branch.update({
        where: { id: branch.id },
        data: { managerId: user.id },
      });
      console.log(`     🔗 Linked to ${branch.name}`);
    }
  }

  return users;
}

async function seedStaff(branches: any[]) {
  console.log('\n👥 Seeding staff...');

  const hashedPassword = await bcrypt.hash('staff123', 10);
  const staff = [];

  for (const staffMember of staffData) {
    const branch = branches.find(b => b.code === staffMember.branchCode);

    if (!branch) {
      console.log(`  ⚠️  Branch ${staffMember.branchCode} not found for ${staffMember.email}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: staffMember.email,
        password: hashedPassword,
        name: staffMember.name,
        phone: staffMember.phone,
        role: UserRole.STAFF,
        branchId: branch.id,
        isActive: true,
      },
    });

    staff.push(user);
    console.log(`  ✅ ${user.name} at ${branch.name} (${user.email})`);
  }

  return staff;
}

async function seedLogistics() {
  console.log('\n🚚 Seeding logistics staff...');

  const hashedPassword = await bcrypt.hash('logistics123', 10);
  const logistics = [];

  for (const logisticsMember of logisticsData) {
    const user = await prisma.user.create({
      data: {
        email: logisticsMember.email,
        password: hashedPassword,
        name: logisticsMember.name,
        phone: logisticsMember.phone,
        role: UserRole.LOGISTICS_STAFF,
        branchId: null,
        isActive: true,
      },
    });

    logistics.push(user);
    console.log(`  ✅ ${user.name} (${user.email})`);
  }

  return logistics;
}

async function seedCustomers() {
  console.log('\n🛍️  Seeding customers...');

  const customers = [];

  for (const customerData of customersData) {
    const customer = await prisma.customer.create({
      data: {
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        tier: 'BRONZE',
        totalSpent: 0,
        points: 0,
      },
    });

    customers.push(customer);
    console.log(`  ✅ ${customer.name} (${customer.email})`);
  }

  return customers;
}

async function seedCategories() {
  console.log('\n📂 Seeding categories...');

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.productCategory.create({
      data: category,
    });
    createdCategories.push(created);
    console.log(`  ✅ ${category.name} (${category.code})`);
  }

  return createdCategories;
}

async function seedProducts(branches: any[]) {
  console.log('\n🍔 Seeding products with image mapping and options...');

  const allProducts = [];
  let totalOptionsCreated = 0;

  for (const branch of branches) {
    console.log(`\n   Creating products for ${branch.name}...`);

    for (const product of baseProducts) {
      const { categoryCode, ...productData } = product;

      const category = await prisma.productCategory.findUnique({
        where: { code: categoryCode },
      });

      if (!category) {
        console.log(`  ⚠️  Category ${categoryCode} not found, skipping ${product.name}`);
        continue;
      }

      const productCode = `${product.code}-${branch.code}`;
      const imageUrl = getProductImage(product.name);

      const created = await prisma.product.create({
        data: {
          ...productData,
          code: productCode,
          image: imageUrl,
          categoryId: category.id,
          branchId: branch.id,
          isAvailable: true,
        },
      });

      allProducts.push(created);

      // Thêm product options nếu có
      const optionsData = productOptionsMap[product.code];
      if (optionsData && optionsData.length > 0) {
        for (const option of optionsData) {
          await prisma.productOption.create({
            data: {
              productId: created.id,
              name: option.name,
              description: option.description || '',
              price: option.price,
              type: option.type,
              isRequired: option.isRequired || false,
              isAvailable: true,
              order: option.order,
            },
          });
          totalOptionsCreated++;
        }
      }
    }
    console.log(`   ✅ Created ${baseProducts.length} products for ${branch.name}`);
  }

  console.log(`\n   📸 All products mapped with images from /assets`);
  console.log(`   🎛️  Created ${totalOptionsCreated} product options`);
  return allProducts;
}

async function seedBanners() {
  console.log('\n🌅 Seeding banners...');

  for (const banner of banners) {
    await prisma.banner.create({
      data: banner,
    });
    console.log(`  ✅ ${banner.title}`);
  }
}

async function seedPromotions() {
  console.log('\n🎁 Seeding promotions...');

  const createdPromotions = [];
  for (const promo of promotionsData) {
    const created = await prisma.promotion.create({
      data: promo,
    });
    createdPromotions.push(created);
    console.log(`  ✅ ${promo.code} - ${promo.type} (value: ${promo.value})`);
  }

  return createdPromotions;
}

async function seedOrders(branches: any[], customers: any[], staff: any[], allProducts: any[], promotions: any[]) {
  console.log('\n📦 Seeding sample orders...');

  const orderStatuses: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  let orderCount = 0;

  for (const branch of branches) {
    console.log(`\n   Creating orders for ${branch.name}...`);

    const branchProducts = allProducts.filter(p => p.branchId === branch.id);
    const branchStaff = staff.filter(s => s.branchId === branch.id);

    if (branchProducts.length === 0 || branchStaff.length === 0) {
      console.log(`   ⚠️  No products or staff for ${branch.name}, skipping orders`);
      continue;
    }

    const numOrders = 10 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numOrders; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const assignedStaff = branchStaff[Math.floor(Math.random() * branchStaff.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

      const numItems = 1 + Math.floor(Math.random() * 4);
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        selectedProducts.push(branchProducts[Math.floor(Math.random() * branchProducts.length)]);
      }

      let totalAmount = 0;
      const orderItems = selectedProducts.map(p => {
        const quantity = 1 + Math.floor(Math.random() * 3);
        totalAmount += p.price * quantity;
        return {
          productId: p.id,
          quantity,
          price: p.price,
        };
      });

      const usePromotion = Math.random() < 0.3 && promotions.length > 0;
      const promotion = usePromotion ? promotions[Math.floor(Math.random() * promotions.length)] : null;
      let discountAmount = 0;

      if (promotion && totalAmount >= (promotion.minOrderAmount || 0)) {
        if (promotion.type === 'FIXED') {
          discountAmount = promotion.value;
        } else if (promotion.type === 'PERCENTAGE') {
          discountAmount = Math.floor(totalAmount * promotion.value / 100);
        }
      }

      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          branchId: branch.id,
          staffId: assignedStaff.id,
          promotionId: promotion?.id || null,
          status,
          total: totalAmount,
          discountAmount,
          deliveryAddress: `${customer.name}'s address`,
          createdAt,
          completedAt: status === 'COMPLETED' ? new Date(createdAt.getTime() + 30 * 60 * 1000) : null,
          items: {
            create: orderItems,
          },
        },
      });

      if (status === 'COMPLETED') {
        const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await prisma.bill.create({
          data: {
            billNumber,
            orderId: order.id,
            branchId: branch.id,
            issuedById: assignedStaff.id,
            subtotal: totalAmount,
            taxAmount: 0,
            discountAmount,
            total: totalAmount - discountAmount,
            paymentMethod: Math.random() > 0.5 ? 'CASH' : 'CARD',
            paymentStatus: 'PAID',
            status: 'PAID',
          },
        });
      }

      orderCount++;
    }

    console.log(`   ✅ Created ${numOrders} orders for ${branch.name}`);
  }

  console.log(`\n  📊 Total orders created: ${orderCount}`);
  return orderCount;
}

async function seedReviews(customers: any[], allProducts: any[]) {
  console.log('\n⭐ Seeding product reviews...');

  const reviewTexts = [
    { rating: 5, comment: 'Rất ngon! Sẽ quay lại lần sau!' },
    { rating: 5, comment: 'Chất lượng tuyệt vời, phục vụ nhanh chóng!' },
    { rating: 4, comment: 'Ngon, giá hơi cao một chút nhưng chấp nhận được' },
    { rating: 4, comment: 'Đồ ăn ngon, không gian thoải mái' },
    { rating: 3, comment: 'Tạm ổn, có thể cải thiện thêm' },
    { rating: 5, comment: 'Combo rất đáng giá, gia đình mình rất thích!' },
    { rating: 4, comment: 'Gà giòn ngon, khoai tây chiên tuyệt!' },
  ];

  let reviewCount = 0;

  for (const customer of customers) {
    const numReviews = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numReviews; i++) {
      const product = allProducts[Math.floor(Math.random() * allProducts.length)];
      const reviewData = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

      await prisma.review.create({
        data: {
          customerId: customer.id,
          productId: product.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        },
      });

      reviewCount++;
    }
  }

  console.log(`  ✅ Created ${reviewCount} reviews`);
  return reviewCount;
}

async function seedStockRequests(branches: any[], allProducts: any[], staff: any[]) {
  console.log('\n📋 Seeding stock requests...');

  const requestTypes: ('RESTOCK' | 'ADJUSTMENT' | 'RETURN')[] = ['RESTOCK', 'ADJUSTMENT', 'RETURN'];
  const statuses: ('PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED')[] = [
    'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'
  ];

  let requestCount = 0;

  for (const branch of branches) {
    const branchProducts = allProducts.filter((p: any) => p.branchId === branch.id);
    const branchStaff = staff.filter((s: any) => s.branchId === branch.id);

    if (branchProducts.length === 0 || branchStaff.length === 0) continue;

    const numRequests = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numRequests; i++) {
      const product = branchProducts[Math.floor(Math.random() * branchProducts.length)];
      const requestedBy = branchStaff[Math.floor(Math.random() * branchStaff.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const type = requestTypes[Math.floor(Math.random() * requestTypes.length)];
      const requestedQuantity = 10 + Math.floor(Math.random() * 90);

      const requestNumber = `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000);

      const stockRequestData: any = {
        requestNumber,
        type,
        status,
        requestedQuantity,
        productId: product.id,
        branchId: branch.id,
        requestedById: requestedBy.id,
        requestedDate: createdAt,
        createdAt,
      };

      if (status === 'APPROVED' || status === 'COMPLETED') {
        stockRequestData.approvedQuantity = requestedQuantity;
        stockRequestData.approvedById = requestedBy.id;
        stockRequestData.expectedDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
      }

      if (status === 'COMPLETED') {
        stockRequestData.completedDate = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
      }

      if (status === 'REJECTED') {
        stockRequestData.rejectedReason = 'Không đủ ngân sách';
      }

      await prisma.stockRequest.create({
        data: stockRequestData,
      });

      requestCount++;
    }
  }

  console.log(`  ✅ Created ${requestCount} stock requests`);
  return requestCount;
}

async function seedShipments(branches: any[], logistics: any[]) {
  console.log('\n🚚 Seeding shipments...');

  const statuses: ('READY' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED')[] = [
    'READY', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'
  ];

  const productNames = [
    'Gà Rán Giòn',
    'Burger Bò',
    'Khoai Tây Chiên',
    'Mì Ý Sốt Cay',
    'Nước Ngọt',
    'Kem Sundae',
  ];

  let shipmentCount = 0;

  for (const branch of branches) {
    const numShipments = 2 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numShipments; i++) {
      const assignedTo = logistics[Math.floor(Math.random() * logistics.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const quantity = 10 + Math.floor(Math.random() * 90);

      const shipmentNumber = `SHIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);

      const shipmentData: any = {
        shipmentNumber,
        status,
        productName,
        quantity,
        fromLocation: 'Kho Trung Tâm TP.HCM',
        toLocation: branch.address,
        branchCode: branch.code,
        branchId: branch.id,
        assignedToId: assignedTo.id,
        assignedAt: createdAt,
        createdAt,
        priority: Math.random() > 0.7,
      };

      if (status === 'IN_TRANSIT') {
        shipmentData.startedAt = new Date(createdAt.getTime() + 1 * 60 * 60 * 1000);
      }

      if (status === 'DELIVERED' || status === 'COMPLETED') {
        shipmentData.startedAt = new Date(createdAt.getTime() + 1 * 60 * 60 * 1000);
        shipmentData.deliveredAt = new Date(createdAt.getTime() + 3 * 60 * 60 * 1000);
      }

      if (status === 'COMPLETED') {
        shipmentData.completedAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000);
      }

      await prisma.shipment.create({
        data: shipmentData,
      });

      shipmentCount++;
    }
  }

  console.log(`  ✅ Created ${shipmentCount} shipments`);
  return shipmentCount;
}

async function seedBillHistories() {
  console.log('\n📜 Seeding bill histories...');

  // Lấy một số bills đã tạo và tạo history cho chúng
  const bills = await prisma.bill.findMany({
    take: 10,
    include: {
      issuedBy: true,
    },
  });

  let historyCount = 0;

  for (const bill of bills) {
    // Tạo 1-2 history entries cho mỗi bill
    const numHistories = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numHistories; i++) {
      await prisma.billHistory.create({
        data: {
          version: i + 1,
          billNumber: bill.billNumber,
          status: bill.status,
          subtotal: bill.subtotal,
          taxAmount: bill.taxAmount,
          discountAmount: bill.discountAmount,
          total: bill.total,
          customerName: bill.customerName,
          customerPhone: bill.customerPhone,
          customerEmail: bill.customerEmail,
          customerAddress: bill.customerAddress,
          paymentMethod: bill.paymentMethod,
          paymentStatus: bill.paymentStatus,
          paidAmount: bill.paidAmount,
          changeAmount: bill.changeAmount,
          notes: bill.notes,
          internalNotes: bill.internalNotes,
          editReason: i === 0 ? 'Initial version' : 'Updated payment information',
          changedFields: i === 0 ? 'created' : 'paymentStatus,paidAmount',
          billId: bill.id,
          editedById: bill.issuedById,
          createdAt: new Date(bill.createdAt.getTime() + i * 5 * 60 * 1000),
        },
      });

      historyCount++;
    }
  }

  console.log(`  ✅ Created ${historyCount} bill histories`);
  return historyCount;
}

async function seedSystemSettings() {
  console.log('\n⚙️  Seeding system settings...');

  const settings = [
    // General Settings
    {
      key: 'store_name',
      value: 'AnEat - Gà Rán & Burger',
      type: 'text',
      category: 'general',
      description: 'Tên cửa hàng hiển thị',
      isPublic: true,
    },
    {
      key: 'store_slogan',
      value: 'Ngon - Rẻ - Sạch',
      type: 'text',
      category: 'general',
      description: 'Slogan của cửa hàng',
      isPublic: true,
    },
    {
      key: 'hotline',
      value: '1900 1234',
      type: 'text',
      category: 'contact',
      description: 'Số hotline chăm sóc khách hàng',
      isPublic: true,
    },
    {
      key: 'email_support',
      value: 'support@aneat.com',
      type: 'text',
      category: 'contact',
      description: 'Email hỗ trợ khách hàng',
      isPublic: true,
    },
    {
      key: 'facebook_url',
      value: 'https://facebook.com/aneat.vn',
      type: 'text',
      category: 'contact',
      description: 'Link Facebook fanpage',
      isPublic: true,
    },
    {
      key: 'instagram_url',
      value: 'https://instagram.com/aneat.vn',
      type: 'text',
      category: 'contact',
      description: 'Link Instagram',
      isPublic: true,
    },
    // Business Settings
    {
      key: 'opening_hours',
      value: '08:00 - 22:00',
      type: 'text',
      category: 'business',
      description: 'Giờ mở cửa',
      isPublic: true,
    },
    {
      key: 'delivery_fee',
      value: '15000',
      type: 'number',
      category: 'business',
      description: 'Phí giao hàng cơ bản (VND)',
      isPublic: true,
    },
    {
      key: 'min_order_amount',
      value: '50000',
      type: 'number',
      category: 'business',
      description: 'Đơn tối thiểu để đặt hàng (VND)',
      isPublic: true,
    },
    {
      key: 'free_delivery_threshold',
      value: '200000',
      type: 'number',
      category: 'business',
      description: 'Miễn phí ship từ (VND)',
      isPublic: true,
    },
    // About Settings
    {
      key: 'about_intro',
      value: 'AnEat là chuỗi cửa hàng gà rán và burger hàng đầu tại TP.HCM, cam kết mang đến cho khách hàng những sản phẩm chất lượng với giá cả phải chăng.',
      type: 'text',
      category: 'about',
      description: 'Giới thiệu ngắn về công ty',
      isPublic: true,
    },
    {
      key: 'mission',
      value: 'Mang đến món ăn nhanh ngon, sạch, bổ dưỡng với giá cả hợp lý cho mọi người',
      type: 'text',
      category: 'about',
      description: 'Sứ mệnh công ty',
      isPublic: true,
    },
    {
      key: 'vision',
      value: 'Trở thành chuỗi gà rán số 1 Việt Nam vào năm 2030',
      type: 'text',
      category: 'about',
      description: 'Tầm nhìn công ty',
      isPublic: true,
    },
    // Internal Settings
    {
      key: 'tax_rate',
      value: '10',
      type: 'number',
      category: 'business',
      description: 'Thuế VAT (%)',
      isPublic: false,
    },
    {
      key: 'points_per_1k',
      value: '1',
      type: 'number',
      category: 'business',
      description: 'Điểm tích lũy trên 1000 VND',
      isPublic: false,
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.create({
      data: setting,
    });
  }

  console.log(`  ✅ Created ${settings.length} system settings`);
  return settings.length;
}

// ============ SEED ABOUT US ============

async function seedAboutUs() {
  console.log('\n📖 Seeding About Us...');

  await prisma.aboutUs.create({
    data: {
      title: 'Về AnEat',
      content: `
        <p>Chào mừng bạn đến với <strong>AnEat</strong> - chuỗi nhà hàng gà rán và burger mới nổi tại Việt Nam!</p>
        
        <p>Được thành lập từ năm 2025, AnEat đã không ngừng phát triển và mở rộng với mục tiêu mang đến cho khách hàng những món ăn nhanh ngon miệng, chất lượng với giá cả hợp lý nhất.</p>
        
        <h3>Câu chuyện của chúng tôi</h3>
        <p>AnEat bắt đầu từ một cửa hàng nhỏ tại Quận 1, TP.HCM với niềm đam mê mang đến những món gà rán giòn rụm, thơm ngon theo công thức độc quyền. Sau hơn 4 tháng hoạt động, chúng tôi đã phát triển thành chuỗi cửa hàng với nhiều chi nhánh.</p>
        
        <h3>Cam kết chất lượng</h3>
        <p>Tại AnEat, chúng tôi luôn:</p>
        <ul>
          <li>Sử dụng nguyên liệu tươi ngon, có nguồn gốc rõ ràng</li>
          <li>Chế biến theo quy trình đảm bảo an toàn vệ sinh thực phẩm</li>
          <li>Phục vụ nhanh chóng, chu đáo</li>
          <li>Giá cả minh bạch, hợp lý</li>
        </ul>
        
        <p>Hãy đến AnEat để trải nghiệm những món ăn tuyệt vời cùng gia đình và bạn bè!</p>
      `,
      image: '/assets/burger-com.webp',
      mission: 'Mang đến cho khách hàng những món ăn nhanh ngon miệng, an toàn với giá cả hợp lý. Tạo ra trải nghiệm ẩm thực vui vẻ và tiện lợi cho mọi người.',
      vision: 'Trở thành chuỗi nhà hàng gà rán và burger được yêu thích nhất Việt Nam vào năm 2030, mở rộng ra khu vực Đông Nam Á.',
      values: JSON.stringify([
        'Chất lượng là ưu tiên hàng đầu',
        'Khách hàng là trung tâm mọi hoạt động',
        'Sáng tạo và cải tiến không ngừng',
        'Trung thực và minh bạch trong kinh doanh',
        'Đoàn kết và hỗ trợ lẫn nhau',
        'Bảo vệ môi trường và phát triển bền vững'
      ]),
      isActive: true,
    },
  });

  console.log('  ✅ Created About Us content');
  return 1;
}

// ============ SEED TEMPLATES ============

async function seedTemplates() {
  console.log('\n📝 Seeding templates...');

  const templates = [
    {
      name: 'Email Chào Mừng',
      type: 'email',
      description: 'Email gửi khi khách hàng đăng ký thành công',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Chào mừng đến với AnEat!</h1>
          <p>Xin chào <strong>{{name}}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký thành viên tại AnEat. Chúng tôi rất vui mừng được phục vụ bạn.</p>
          <p>Hãy khám phá ngay các món ngon tại cửa hàng của chúng tôi!</p>
          <a href="{{loginUrl}}" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt Món Ngay</a>
        </div>
      `,
      category: TemplateCategory.EMAIL,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
    },
    {
      name: 'SMS Xác Nhận Đơn Hàng',
      type: 'sms',
      description: 'SMS gửi khi đơn hàng được xác nhận',
      content: 'AnEat: Cam on ban da dat hang. Ma don {{orderId}}. Tong tien {{total}}. Don hang dang duoc chuan bi. Hotline: 1900xxxx',
      category: TemplateCategory.SMS,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
    },
    {
      name: 'Thông Báo Giao Hàng',
      type: 'notification',
      description: 'Thông báo app khi đơn hàng đang giao',
      content: 'Đơn hàng {{orderId}} của bạn đang được giao. Tài xế: {{driverName}} - {{driverPhone}}.',
      category: TemplateCategory.NOTIFICATION,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
    },
    {
      name: 'Hóa Đơn Bán Hàng',
      type: 'print',
      description: 'Mẫu in hóa đơn tại quầy',
      content: `
        <div style="width: 300px; font-family: 'Courier New', monospace; font-size: 14px;">
          <div style="text-align: center; margin-bottom: 10px;">
            <h2 style="margin: 0;">AnEat - Fast Food</h2>
            <p style="margin: 5px 0;">Chi nhánh: {{branchName}}</p>
            <p style="margin: 0;">ĐC: {{branchAddress}}</p>
            <p style="margin: 0;">SĐT: {{branchPhone}}</p>
          </div>
          <hr style="border-top: 1px dashed #000;"/>
          <p>Số HĐ: {{billId}}</p>
          <p>Ngày: {{date}}</p>
          <p>Thu ngân: {{staffName}}</p>
          <hr style="border-top: 1px dashed #000;"/>
          <table style="width: 100%;">
            {{#items}}
            <tr>
              <td>{{name}}</td>
              <td style="text-align: right;">x{{quantity}}</td>
              <td style="text-align: right;">{{total}}</td>
            </tr>
            {{/items}}
          </table>
          <hr style="border-top: 1px dashed #000;"/>
          <div style="display: flex; justify-content: space-between;">
            <strong>Tổng cộng:</strong>
            <strong>{{grandTotal}}</strong>
          </div>
          <hr style="border-top: 1px dashed #000;"/>
          <p style="text-align: center; margin-top: 10px;">Hẹn gặp lại quý khách!</p>
        </div>
      `,
      category: TemplateCategory.INVOICE,
      status: TemplateStatus.ACTIVE,
      isDefault: true,
    }
  ];

  for (const t of templates) {
    await prisma.template.create({
      data: t,
    });
  }

  console.log(`  ✅ Created ${templates.length} templates`);
  return templates.length;
}

// ============ MAIN FUNCTION ============

async function main() {
  console.log('🌱 Starting comprehensive seed with complete data...\n');
  console.log('═'.repeat(60));

  try {
    await cleanupDatabase();

    const branches = await seedBranches();
    const managers = await seedAdminsAndManagers(branches);
    const staff = await seedStaff(branches);
    const logistics = await seedLogistics();
    const customers = await seedCustomers();
    const categoriesCreated = await seedCategories();
    const allProducts = await seedProducts(branches);
    await seedBanners();
    await seedAboutUs();
    const promotions = await seedPromotions();
    const orderCount = await seedOrders(branches, customers, staff, allProducts, promotions);
    const reviewCount = await seedReviews(customers, allProducts);
    const stockRequestCount = await seedStockRequests(branches, allProducts, staff);
    const templateCount = await seedTemplates();
    const shipmentCount = await seedShipments(branches, logistics);
    const billHistoryCount = await seedBillHistories();
    const systemSettingsCount = await seedSystemSettings();

    console.log('\n' + '═'.repeat(60));
    console.log('✅ All seeds completed successfully!\n');

    console.log('📊 Summary:');
    console.log(`   Branches:        ${branches.length}`);
    console.log(`   Managers:        ${managers.filter(m => m.role === UserRole.ADMIN_BRAND).length}`);
    console.log(`   Staff:           ${staff.length}`);
    console.log(`   Logistics:       ${logistics.length}`);
    console.log(`   Customers:       ${customers.length}`);
    console.log(`   Categories:      ${categoriesCreated.length}`);
    console.log(`   Products:        ${allProducts.length} (across all branches with images)`);
    console.log(`   Promotions:      ${promotions.length}`);
    console.log(`   Orders:          ${orderCount} (with varied statuses & promotions)`);
    console.log(`   Reviews:         ${reviewCount}`);
    console.log(`   Stock Requests:  ${stockRequestCount}`);
    console.log(`   Shipments:       ${shipmentCount}`);
    console.log(`   Bill Histories:  ${billHistoryCount}`);
    console.log(`   System Settings: ${systemSettingsCount}`);
    console.log(`   Templates:       ${templateCount}`);

    console.log('\n📝 Test Credentials:');
    console.log('   Admin:          admin@aneat.com / admin123');
    console.log('   Manager Q1:     manager.q1@aneat.com / manager123');
    console.log('   Manager Q3:     manager.q3@aneat.com / manager123');
    console.log('   Manager TD:     manager.td@aneat.com / manager123');
    console.log('   Staff Q1:       staff.q1.01@aneat.com / staff123');
    console.log('   Staff Q3:       staff.q3.01@aneat.com / staff123');
    console.log('   Staff TD:       staff.td.01@aneat.com / staff123');
    console.log('   Logistics:      logistics01@aneat.com / logistics123');
    console.log('\n💡 Note: Products share images across branches (admin updates will affect all branches)');
    console.log('═'.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
