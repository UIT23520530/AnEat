"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

// 1. Define types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  cartItems: CartItem[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  totalItems: number;
  totalPrice: number;
}

// Action types for reducer
type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_CART"; payload: CartItem[] };

// 2. Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedCartItems = state.cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item,
        );
        return { ...state, cartItems: updatedCartItems };
      } else {
        // Item does not exist, add it
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.id !== action.payload.id,
        ),
      };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        // If quantity is 0 or less, remove the item
        return {
          ...state,
          cartItems: state.cartItems.filter(
            (item) => item.id !== action.payload.id,
          ),
        };
      }
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item,
        ),
      };
    case "SET_CART":
      return { ...state, cartItems: action.payload };
    default:
      return state;
  }
};

const initialState: CartState = {
  cartItems: [],
};

// 4. CartProvider Component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("shoppingCart");
      if (storedCart) {
        dispatch({ type: "SET_CART", payload: JSON.parse(storedCart) });
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("shoppingCart", JSON.stringify(state.cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [state.cartItems]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id: itemId } });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: itemId, quantity: newQuantity },
    });
  };

  // 5. Calculate total items and price
  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = state.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const totalPrice = state.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return { totalItems, totalPrice };
  }, [state.cartItems]);

  const contextValue: CartContextType = {
    cartItems: state.cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// 6. Custom hook to use the CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
