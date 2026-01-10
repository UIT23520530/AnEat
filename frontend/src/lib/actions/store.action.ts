// src/lib/actions/store.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { Store } from "@/types";

// --- MOCK DATABASE ---
// Dữ liệu này sẽ tồn tại trong bộ nhớ của server
let mockStores: Store[] = [
    { id: "1", name: "Store #1", address: "123 Main Street, District 1, Ho Chi Minh City", phone: "0123456789", email: "store1@fastfood.com", manager: "Nguyễn Văn A", status: "active", revenue: 22800000, orders: 454 },
    { id: "2", name: "Store #2", address: "456 Second Avenue, District 3, Ho Chi Minh City", phone: "0987654321", email: "store2@fastfood.com", manager: "Trần Thị B", status: "active", revenue: 18500000, orders: 378 },
    { id: "3", name: "Store #3", address: "789 Third Road, District 7, Ho Chi Minh City", phone: "0369852147", email: "store3@fastfood.com", manager: "Lê Văn C", status: "active", revenue: 25600000, orders: 512 },
    { id: "4", name: "Store #4", address: "321 Fourth Street, District 10, Ho Chi Minh City", phone: "0258963147", email: "store4@fastfood.com", manager: "Phạm Thị D", status: "maintenance", revenue: 19200000, orders: 401 },
];
// --- END MOCK DATABASE ---

// Hàm lấy dữ liệu (sẽ được gọi bởi Server Component)
export async function getStores() {
  // Mô phỏng độ trễ mạng
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("SERVER: Fetching stores from mock database.");
  return mockStores;
}

// Action: Tạo store mới
export async function createStore(formData: FormData) {
  const newStore: Store = {
    id: Date.now().toString(), // ID tạm thời
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    manager: formData.get("manager") as string,
    status: "active", // Mặc định
    revenue: 0,
    orders: 0,
  };

  mockStores.push(newStore);
  console.log("SERVER: Created new store. Total:", mockStores.length);
  revalidatePath("/admin/stores"); // Quan trọng: Yêu cầu Next.js render lại trang
}

// Action: Cập nhật store
export async function updateStore(id: string, formData: FormData) {
  const storeIndex = mockStores.findIndex((s) => s.id === id);
  if (storeIndex === -1) return;

  mockStores[storeIndex] = {
    ...mockStores[storeIndex],
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    manager: formData.get("manager") as string,
  };
  
  console.log("SERVER: Updated store with id:", id);
  revalidatePath("/admin/stores");
}

// Action: Xóa store
export async function deleteStore(id: string) {
  mockStores = mockStores.filter((s) => s.id !== id);
  console.log("SERVER: Deleted store with id:", id);
  revalidatePath("/admin/stores");
}