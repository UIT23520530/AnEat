/**
 * Utility để quản lý temp order trong cookie
 * Lưu đơn hàng tạm thời khi người dùng điền form checkout
 */

const TEMP_ORDER_COOKIE_NAME = "temp_order";
const COOKIE_EXPIRY_DAYS = 1; // Cookie hết hạn sau 1 ngày

interface TempOrderData {
  branchId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number; // cent
    options?: Array<{
      optionId: string;
      optionName: string;
      optionPrice: number; // cent
    }>;
  }>;
  notes?: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  promotionCode?: string;
  createdAt: string;
}

/**
 * Lưu temp order vào cookie
 */
export function saveTempOrderToCookie(data: TempOrderData): void {
  if (typeof window === "undefined") return;

  try {
    const jsonData = JSON.stringify(data);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
    
    // Encode để tránh lỗi với ký tự đặc biệt
    const encodedData = encodeURIComponent(jsonData);
    
    document.cookie = `${TEMP_ORDER_COOKIE_NAME}=${encodedData}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
  } catch (error) {
    console.error("Error saving temp order to cookie:", error);
  }
}

/**
 * Lấy temp order từ cookie
 */
export function getTempOrderFromCookie(): TempOrderData | null {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    const tempOrderCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${TEMP_ORDER_COOKIE_NAME}=`)
    );

    if (!tempOrderCookie) return null;

    const encodedData = tempOrderCookie.split("=")[1];
    if (!encodedData) return null;

    const jsonData = decodeURIComponent(encodedData);
    const data = JSON.parse(jsonData) as TempOrderData;

    // Kiểm tra xem cookie có hết hạn không (dựa vào createdAt)
    const createdAt = new Date(data.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > COOKIE_EXPIRY_DAYS) {
      // Cookie đã hết hạn, xóa nó
      clearTempOrderCookie();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error reading temp order from cookie:", error);
    // Nếu có lỗi khi đọc cookie, xóa nó để tránh lỗi lặp lại
    clearTempOrderCookie();
    return null;
  }
}

/**
 * Xóa temp order cookie
 */
export function clearTempOrderCookie(): void {
  if (typeof window === "undefined") return;

  document.cookie = `${TEMP_ORDER_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

/**
 * Kiểm tra xem có temp order trong cookie không
 */
export function hasTempOrderInCookie(): boolean {
  return getTempOrderFromCookie() !== null;
}
