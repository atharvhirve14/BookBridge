import { createContext, useCallback, useContext, useEffect, useState } from "react";
const CART_KEY = "bookbridge_cart";
const CartContext = createContext(null);
function readCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop stale entries from older versions that used numeric (non-ObjectId) ids.
    return parsed.filter((i) => typeof i.bookId === "string" && /^[0-9a-fA-F]{24}$/.test(i.bookId));
  } catch {
    return [];
  }
}
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable – the cart just won't survive a reload */
    }
  }, [items]);
  const add = useCallback((item) => {
    setItems((prev) => (prev.some((i) => i.bookId === item.bookId) ? prev : [...prev, { ...item, qty: 1 }]));
  }, []);
  const remove = useCallback((bookId) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((bookId) => items.some((i) => i.bookId === bookId), [items]);
  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        clear,
        has,
        count: items.length,
        total: items.reduce((sum, i) => sum + i.price, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
