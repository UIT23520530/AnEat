import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Chuyển đổi chuỗi tiếng Việt thành slug (không dấu, lowercase)
 * @param text - Chuỗi cần chuyển đổi
 * @returns Slug đã được chuẩn hóa
 */
export function createSlug(text: string): string {
  if (!text) return "";
  
  // Chuyển đổi tiếng Việt có dấu thành không dấu
  const vietnameseMap: { [key: string]: string } = {
    à: "a", á: "a", ạ: "a", ả: "a", ã: "a",
    â: "a", ầ: "a", ấ: "a", ậ: "a", ẩ: "a", ẫ: "a",
    ă: "a", ằ: "a", ắ: "a", ặ: "a", ẳ: "a", ẵ: "a",
    è: "e", é: "e", ẹ: "e", ẻ: "e", ẽ: "e",
    ê: "e", ề: "e", ế: "e", ệ: "e", ể: "e", ễ: "e",
    ì: "i", í: "i", ị: "i", ỉ: "i", ĩ: "i",
    ò: "o", ó: "o", ọ: "o", ỏ: "o", õ: "o",
    ô: "o", ồ: "o", ố: "o", ộ: "o", ổ: "o", ỗ: "o",
    ơ: "o", ờ: "o", ớ: "o", ợ: "o", ở: "o", ỡ: "o",
    ù: "u", ú: "u", ụ: "u", ủ: "u", ũ: "u",
    ư: "u", ừ: "u", ứ: "u", ự: "u", ử: "u", ữ: "u",
    ỳ: "y", ý: "y", ỵ: "y", ỷ: "y", ỹ: "y",
    đ: "d",
    À: "A", Á: "A", Ạ: "A", Ả: "A", Ã: "A",
    Â: "A", Ầ: "A", Ấ: "A", Ậ: "A", Ẩ: "A", Ẫ: "A",
    Ă: "A", Ằ: "A", Ắ: "A", Ặ: "A", Ẳ: "A", Ẵ: "A",
    È: "E", É: "E", Ẹ: "E", Ẻ: "E", Ẽ: "E",
    Ê: "E", Ề: "E", Ế: "E", Ệ: "E", Ể: "E", Ễ: "E",
    Ì: "I", Í: "I", Ị: "I", Ỉ: "I", Ĩ: "I",
    Ò: "O", Ó: "O", Ọ: "O", Ỏ: "O", Õ: "O",
    Ô: "O", Ồ: "O", Ố: "O", Ộ: "O", Ổ: "O", Ỗ: "O",
    Ơ: "O", Ờ: "O", Ớ: "O", Ợ: "O", Ở: "O", Ỡ: "O",
    Ù: "U", Ú: "U", Ụ: "U", Ủ: "U", Ũ: "U",
    Ư: "U", Ừ: "U", Ứ: "U", Ự: "U", Ử: "U", Ữ: "U",
    Ỳ: "Y", Ý: "Y", Ỵ: "Y", Ỷ: "Y", Ỹ: "Y",
    Đ: "D",
  };

  let slug = text
    .split("")
    .map((char) => vietnameseMap[char] || char)
    .join("");

  // Chuyển thành lowercase
  slug = slug.toLowerCase();

  // Thay thế các ký tự đặc biệt và khoảng trắng bằng dấu gạch ngang
  slug = slug
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim();

  // Loại bỏ dấu gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}

