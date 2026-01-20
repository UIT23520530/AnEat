"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTempOrderFromCookie, saveTempOrderToCookie } from "@/lib/temp-order-cookie";
import { useCart } from "./cart-context";

interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  cartItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: CartItemOption[];
}

interface CheckoutContextType {
  // Cart items
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  
  // Order info
  store: string;
  setStore: (store: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  orderType: "DELIVERY" | "PICKUP";
  setOrderType: (type: "DELIVERY" | "PICKUP") => void;
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
  handleItemQuantityChange: (cartItemId: string, quantity: number) => void;
  handleItemRemove: (cartItemId: string) => void;
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
  const [store, setStore] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [notes, setNotes] = useState("");
  const [addOns, setAddOns] = useState({
    utensils: false,
    sauce: false,
    napkins: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "e-wallet">("cash");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Restore state from cookie on mount
  useEffect(() => {
    const tempOrder = getTempOrderFromCookie();
    if (tempOrder) {
      if (tempOrder.branchId) setStore(tempOrder.branchId);
      if (tempOrder.deliveryAddress) setDeliveryAddress(tempOrder.deliveryAddress === "Lấy tại cửa hàng" ? "" : tempOrder.deliveryAddress);
      if (tempOrder.deliveryPhone) setPhoneNumber(tempOrder.deliveryPhone);
      if (tempOrder.orderType) setOrderType(tempOrder.orderType);
      if (tempOrder.notes) setNotes(tempOrder.notes);
      
      // We don't restore items here because they usually come from CartContext
      // but we could if needed. Since cart-context already has localStorage, 
      // we'll let it handle the items.
    }
  }, []);

  // Save state to cookie whenever it changes
  useEffect(() => {
    if (!store) return;
    
    const tempOrderData = {
      branchId: store,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price, // Giá đã là VND
        options: item.options?.map(opt => ({
          optionId: opt.id,
          optionName: opt.name,
          optionPrice: opt.price,
        })) || [],
      })),
      deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : "Lấy tại cửa hàng",
      deliveryPhone: phoneNumber,
      orderType,
      notes,
      createdAt: new Date().toISOString(),
    };
    
    saveTempOrderToCookie(tempOrderData);
  }, [store, items, deliveryAddress, phoneNumber, orderType, notes]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - appliedDiscount;

  const { updateQuantity, removeFromCart } = useCart();

  const handleItemQuantityChange = (cartItemId: string, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    setItems(items.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    ));
    // Sync to main cart
    updateQuantity(cartItemId, newQuantity);
  };

  const handleItemRemove = (cartItemId: string) => {
    setItems(items.filter(item => item.cartItemId !== cartItemId));
    // Sync to main cart
    removeFromCart(cartItemId);
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
        deliveryAddress,
        setDeliveryAddress,
        phoneNumber,
        setPhoneNumber,
        orderType,
        setOrderType,
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
