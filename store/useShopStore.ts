"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = Product & { quantity: number };

type Stats = {
  virtualSpend: number;
  happyCount: number;
  streak: number;
  viewedProducts: number;
  badges: string[];
  lastVisitDate?: string;
};

type ShopState = {
  cart: CartItem[];
  stats: Stats;
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  changeQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  markProductViewed: () => void;
  completeOrder: (amount: number) => void;
  refreshStreak: () => void;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const initialStats: Stats = {
  virtualSpend: 0,
  happyCount: 0,
  streak: 0,
  viewedProducts: 0,
  badges: []
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      stats: initialStats,
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
      changeQuantity: (id, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
            .filter((item) => item.quantity > 0)
        })),
      clearCart: () => set({ cart: [] }),
      markProductViewed: () => set((state) => ({ stats: { ...state.stats, viewedProducts: state.stats.viewedProducts + 1 } })),
      completeOrder: (amount) =>
        set((state) => {
          const happyCount = state.stats.happyCount + 1;
          const badges = new Set(state.stats.badges);
          if (happyCount >= 1) badges.add("首次快乐");
          if (happyCount >= 3) badges.add("深夜常客");
          if (state.stats.virtualSpend + amount >= 1000) badges.add("虚拟大买家");
          return {
            cart: [],
            stats: {
              ...state.stats,
              virtualSpend: state.stats.virtualSpend + amount,
              happyCount,
              badges: Array.from(badges)
            }
          };
        }),
      refreshStreak: () => {
        const { stats } = get();
        const today = todayKey();
        if (stats.lastVisitDate === today) return;
        const streak = stats.lastVisitDate === yesterdayKey() ? stats.streak + 1 : 1;
        set({ stats: { ...stats, streak, lastVisitDate: today } });
      }
    }),
    {
      name: "justbuy-storage",
      partialize: (state) => ({ cart: state.cart, stats: state.stats })
    }
  )
);
