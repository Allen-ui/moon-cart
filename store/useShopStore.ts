"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = Product & {
  quantity: number;
  selectedSpecs?: Record<string, string>;
  finalPrice: number;
};

export type PurchaseRecord = {
  id: string;
  createdAt: string;
  amount: number;
  items: CartItem[];
  afterSaleStatus?: "none" | "applied" | "processing" | "completed";
  afterSaleAppliedAt?: string;
};

export type WishItem = {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
};

export type FavoriteItem = {
  productId: number;
  product: Product;
  createdAt: string;
};

export type MessageItem = {
  id: string;
  content: string;
  createdAt: string;
};

type Stats = {
  virtualSpend: number;
  happyCount: number;
  streak: number;
  viewedProducts: number;
  badges: string[];
  purchases: PurchaseRecord[];
  wishlist: WishItem[];
  favorites: FavoriteItem[];
  messages: MessageItem[];
  lastVisitDate?: string;
  avatar?: string;
  nickname?: string;
};

type ShopState = {
  cart: CartItem[];
  stats: Stats;
  addToCart: (product: Product, selectedSpecs?: Record<string, string>, finalPrice?: number) => void;
  addToWishlist: (title: string, note?: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  addMessage: (content: string) => void;
  removeFromCart: (id: number) => void;
  changeQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  markProductViewed: () => void;
  completeOrder: (amount: number, items?: CartItem[]) => void;
  refreshStreak: () => void;
  applyAfterSale: (id: string) => void;
  completeAfterSale: (id: string) => void;
  setAvatar: (avatar: string) => void;
  setNickname: (nickname: string) => void;
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
  badges: [],
  purchases: [],
  wishlist: [],
  favorites: [],
  messages: []
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      stats: initialStats,
      addToCart: (product, selectedSpecs, finalPrice) =>
        set((state) => {
          const price = finalPrice ?? product.price;
          const existing = state.cart.find(
            (item) =>
              item.id === product.id &&
              JSON.stringify(item.selectedSpecs) === JSON.stringify(selectedSpecs)
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id &&
                JSON.stringify(item.selectedSpecs) === JSON.stringify(selectedSpecs)
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1, selectedSpecs, finalPrice: price }] };
        }),
      addToWishlist: (title, note) =>
        set((state) => ({
          stats: {
            ...state.stats,
            wishlist: [
              {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                title,
                note,
                createdAt: new Date().toISOString()
              },
              ...(state.stats.wishlist ?? [])
            ].slice(0, 50)
          }
        })),
      removeFromWishlist: (id) =>
        set((state) => ({
          stats: {
            ...state.stats,
            wishlist: (state.stats.wishlist ?? []).filter((item) => item.id !== id)
          }
        })),
      toggleFavorite: (product) =>
        set((state) => {
          const exists = (state.stats.favorites ?? []).some((f) => f.productId === product.id);
          const favorites = exists
            ? (state.stats.favorites ?? []).filter((f) => f.productId !== product.id)
            : [{ productId: product.id, product, createdAt: new Date().toISOString() }, ...(state.stats.favorites ?? [])];
          return {
            stats: { ...state.stats, favorites: favorites.slice(0, 200) }
          };
        }),
      isFavorite: (productId) => {
        const state = get();
        return (state.stats.favorites ?? []).some((f) => f.productId === productId);
      },
      addMessage: (content) =>
        set((state) => ({
          stats: {
            ...state.stats,
            messages: [
              {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                content,
                createdAt: new Date().toISOString()
              },
              ...(state.stats.messages ?? [])
            ].slice(0, 50)
          }
        })),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
      changeQuantity: (id, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
            .filter((item) => item.quantity > 0)
        })),
      clearCart: () => set({ cart: [] }),
      markProductViewed: () => set((state) => ({ stats: { ...state.stats, viewedProducts: state.stats.viewedProducts + 1 } })),
      completeOrder: (amount, items) =>
        set((state) => {
          const happyCount = state.stats.happyCount + 1;
          const badges = new Set(state.stats.badges);
          const orderItems = items?.length ? items : state.cart;
          const purchase: PurchaseRecord = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            createdAt: new Date().toISOString(),
            amount,
            items: orderItems.map((item) => ({ ...item }))
          };
          const purchases = [purchase, ...(state.stats.purchases ?? [])].slice(0, 30);
          if (happyCount >= 1) badges.add("首次快乐");
          if (happyCount >= 3) badges.add("深夜常客");
          if (state.stats.virtualSpend + amount >= 1000) badges.add("虚拟大买家");
          return {
            cart: [],
            stats: {
              ...state.stats,
              virtualSpend: state.stats.virtualSpend + amount,
              happyCount,
              badges: Array.from(badges),
              purchases
            }
          };
        }),
      applyAfterSale: (id) =>
        set((state) => ({
          stats: {
            ...state.stats,
            purchases: (state.stats.purchases ?? []).map((purchase) =>
              purchase.id === id
                ? {
                    ...purchase,
                    afterSaleStatus: "applied" as const,
                    afterSaleAppliedAt: new Date().toISOString()
                  }
                : purchase
            )
          }
        })),
      completeAfterSale: (id) =>
        set((state) => ({
          stats: {
            ...state.stats,
            purchases: (state.stats.purchases ?? []).map((purchase) =>
              purchase.id === id
                ? { ...purchase, afterSaleStatus: "completed" as const }
                : purchase
            )
          }
        })),
      setAvatar: (avatar) =>
        set((state) => ({
          stats: { ...state.stats, avatar }
        })),
      setNickname: (nickname) =>
        set((state) => ({
          stats: { ...state.stats, nickname: nickname.slice(0, 10) }
        })),
      refreshStreak: () => {
        const { stats } = get();
        const today = todayKey();
        if (stats.lastVisitDate === today) return;
        const streak = stats.lastVisitDate === yesterdayKey() ? stats.streak + 1 : 1;
        set({
          stats: {
            ...initialStats,
            ...stats,
            purchases: stats.purchases ?? [],
            wishlist: stats.wishlist ?? [],
            messages: stats.messages ?? [],
            badges: stats.badges ?? [],
            streak,
            lastVisitDate: today
          }
        });
      }
    }),
    {
      name: "moon-cart-storage",
      partialize: (state) => ({ cart: state.cart, stats: state.stats })
    }
  )
);
