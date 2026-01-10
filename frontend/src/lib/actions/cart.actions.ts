"use server";

import { revalidatePath } from "next/cache";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function addItemToServerCart(item: CartItem) {
  // In a real-world scenario, you would add the item to a database.
  // For this example, we'll just log it to the console.
  console.log("Server Action: Adding item to server cart", item);

  // You might want to revalidate a path if the server cart state affects other pages.
  // For example, revalidating a cart page.
  // revalidatePath('/cart');

  return { success: true, message: "Item added to server cart." };
}
