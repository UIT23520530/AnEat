"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutContextType {
  // Cart items
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  
  // Order info
  store: string;
  setStore: (store: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  addOns: {
    utensils: boolean;
    sauce: boolean;
    napkins: boolean;
  };
  setAddOns: (addOns: any) => void;
  
  // Payment info
  paymentMethod: "cash" | "card" | "e-wallet";
  setPaymentMethod: (method: "cash" | "card" | "e-wallet") => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  appliedDiscount: number;
  setAppliedDiscount: (discount: number) => void;
  
  // Calculations
  subtotal: number;
  total: number;
  
  // Actions
  handleItemQuantityChange: (id: string, quantity: number) => void;
  handleItemRemove: (id: string) => void;
  handleApplyDiscount: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [store, setStore] = useState("1");
  const [notes, setNotes] = useState("");
  const [addOns, setAddOns] = useState({
    utensils: false,
    sauce: false,
    napkins: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "e-wallet">("cash");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - appliedDiscount;

  const handleItemQuantityChange = (id: string, quantity: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleItemRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "ANEAT10") {
      setAppliedDiscount(subtotal * 0.1);
    } else if (discountCode) {
      alert("Mã khuyến mãi không hợp lệ");
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        items,
        setItems,
        store,
        setStore,
        notes,
        setNotes,
        addOns,
        setAddOns,
        paymentMethod,
        setPaymentMethod,
        discountCode,
        setDiscountCode,
        appliedDiscount,
        setAppliedDiscount,
        subtotal,
        total,
        handleItemQuantityChange,
        handleItemRemove,
        handleApplyDiscount,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
