"use client";

import { CheckoutProvider } from "@/contexts/checkout-context";
import { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
