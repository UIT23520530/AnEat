"use server";

import { z } from "zod";

const orderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number."),
  address: z.string().min(10, "Address is too short."),
  paymentMethod: z.enum(["cod", "card"]),
  promoCode: z.string().optional(),
});

type OrderData = z.infer<typeof orderSchema>;

export async function placeOrder(data: OrderData) {
  const validation = orderSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Invalid order data.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  // In a real application, you would:
  // 1. Save the order to your database.
  // 2. Process the payment if it's not COD.
  // 3. Send a confirmation email.
  // etc.

  console.log("Server Action: Placing order with data:", validation.data);

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: `Order placed successfully for ${validation.data.name}!`,
    orderId: `ORD-${Date.now()}`,
  };
}
