
export async function createMoMoPosPayment({ amount, orderInfo, paymentCode }: { amount: number; orderInfo: string; paymentCode: string }) {
  const res = await fetch("http://localhost:3001/api/v1/staff/payment-pos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, orderInfo, paymentCode }),
  });
  if (!res.ok) throw new Error("Không thể tạo thanh toán MoMo POS");
  return res.json();
}
// src/services/payment.service.ts

export async function createMoMoPayment({ amount, orderInfo }: { amount: number; orderInfo: string }) {
  const res = await fetch("http://localhost:3001/api/v1/customer/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ amount, orderInfo }),
  });
  if (!res.ok) throw new Error("Không thể tạo thanh toán MoMo");
  return res.json();
}
