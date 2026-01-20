"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItemOption {
  id: string;
  name: string;
  price: number; // Price in VND
}

export interface CartItem {
  id: string; // productId
  cartItemId: string; // Unique ID = productId + hash of options
  name: string;
  price: number; // Total price including options (VND)
  quantity: number;
  image: string;
  options?: CartItemOption[]; // Selected options
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

const CART_STORAGE_KEY = "shoppingCart";

// Tạo cartItemId unique từ productId và options
const generateCartItemId = (productId: string, options?: CartItemOption[]): string => {
  if (!options || options.length === 0) {
    return productId;
  }
  // Sort options by id để đảm bảo cùng options sẽ tạo ra cùng hash
  const sortedOptionIds = options.map(o => o.id).sort().join("-");
  return `${productId}_${sortedOptionIds}`;
};

// So sánh 2 mảng options có giống nhau không
const areOptionsEqual = (opts1?: CartItemOption[], opts2?: CartItemOption[]): boolean => {
  if (!opts1 && !opts2) return true;
  if (!opts1 || !opts2) return false;
  if (opts1.length !== opts2.length) return false;
  
  const ids1 = opts1.map(o => o.id).sort();
  const ids2 = opts2.map(o => o.id).sort();
  return ids1.every((id, index) => id === ids2[index]);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Khôi phục giỏ hàng từ localStorage khi load trang
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as CartItem[];
        // Đảm bảo các item cũ có cartItemId
        const migratedCart = parsedCart.map(item => ({
          ...item,
          cartItemId: item.cartItemId || generateCartItemId(item.id, item.options)
        }));
        setCartItems(migratedCart);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  // Lưu giỏ hàng vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, "cartItemId">) => {
    const cartItemId = generateCartItemId(item.id, item.options);
    
    setCartItems((prevItems) => {
      // Tìm item có cùng productId VÀ cùng options
      const existingItem = prevItems.find(
        (i) => i.id === item.id && areOptionsEqual(i.options, item.options)
      );
      
      if (existingItem) {
        // Cộng dồn quantity
        return prevItems.map((i) =>
          i.cartItemId === existingItem.cartItemId 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      }
      
      // Thêm mới với cartItemId unique
      return [...prevItems, { ...item, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
      );
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Tính toán totalItems và totalPrice
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};