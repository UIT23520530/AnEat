
export async function createMoMoPosPayment({ amount, orderInfo, paymentCode, returnUrl }: { amount: number; orderInfo: string; paymentCode: string; returnUrl?: string }) {
  const res = await fetch("http://localhost:3001/api/v1/staff/payment-pos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, orderInfo, paymentCode, returnUrl }),
  });
  if (!res.ok) throw new Error("Không thể tạo thanh toán MoMo POS");
  return res.json();
}
// src/services/payment.service.ts

export async function createMoMoPayment({ amount, orderInfo, orderNumber, returnUrl }: { amount: number; orderInfo: string; orderNumber?: string; returnUrl?: string }) {
  const res = await fetch("http://localhost:3001/api/v1/customer/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ amount, orderInfo, orderNumber, returnUrl }),
  });
  if (!res.ok) throw new Error("Không thể tạo thanh toán MoMo");
  return res.json();
}
