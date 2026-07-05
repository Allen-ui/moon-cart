"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";
import { parseLocalDate, formatLocalDate } from "@/utils/order";

function specsKey(s?: Record<string, string>): string {
  if (!s) return "";
  return Object.keys(s).sort().map((k) => `${k}:${s[k]}`).join("|");
}

export type BadgeCategory = "streak" | "spend" | "category" | "favorite" | "wishlist";

export type Badge = {
  id: string;
  name: string;
  icon: string;
  category: BadgeCategory;
  description: string;
  condition: number;
};

export const BADGES: Badge[] = [
  { id: "streak_1", name: "初次相遇", icon: "🌅", category: "streak", description: "连续打卡1天", condition: 1 },
  { id: "streak_3", name: "三日之约", icon: "🌤️", category: "streak", description: "连续打卡3天", condition: 3 },
  { id: "streak_7", name: "一周相伴", icon: "🌟", category: "streak", description: "连续打卡7天", condition: 7 },
  { id: "streak_14", name: "半月同行", icon: "🌙", category: "streak", description: "连续打卡14天", condition: 14 },
  { id: "streak_30", name: "月度达人", icon: "🏆", category: "streak", description: "连续打卡30天", condition: 30 },
  { id: "streak_60", name: "双月坚守", icon: "💎", category: "streak", description: "连续打卡60天", condition: 60 },
  { id: "streak_90", name: "季度之约", icon: "🌸", category: "streak", description: "连续打卡90天", condition: 90 },
  { id: "streak_180", name: "半载时光", icon: "🌈", category: "streak", description: "连续打卡180天", condition: 180 },
  { id: "streak_365", name: "周年纪念", icon: "🎂", category: "streak", description: "连续打卡365天", condition: 365 },
  { id: "streak_1000", name: "千年等一回", icon: "👑", category: "streak", description: "连续打卡1000天", condition: 1000 },
  { id: "spend_100", name: "小试牛刀", icon: "🪙", category: "spend", description: "累计消费满100元", condition: 100 },
  { id: "spend_500", name: "精明买家", icon: "💰", category: "spend", description: "累计消费满500元", condition: 500 },
  { id: "spend_1000", name: "千元达人", icon: "💴", category: "spend", description: "累计消费满1000元", condition: 1000 },
  { id: "spend_5000", name: "银卡尊享", icon: "🥈", category: "spend", description: "累计消费满5000元", condition: 5000 },
  { id: "spend_10000", name: "金卡荣耀", icon: "🥇", category: "spend", description: "累计消费满10000元", condition: 10000 },
  { id: "spend_30000", name: "铂金精英", icon: "💎", category: "spend", description: "累计消费满30000元", condition: 30000 },
  { id: "spend_50000", name: "钻石传奇", icon: "💠", category: "spend", description: "累计消费满50000元", condition: 50000 },
  { id: "spend_100000", name: "百万梦想", icon: "🏰", category: "spend", description: "累计消费满100000元", condition: 100000 },
  { id: "spend_500000", name: "财富自由", icon: "🚀", category: "spend", description: "累计消费满500000元", condition: 500000 },
  { id: "spend_1000000", name: "虚拟首富", icon: "👑", category: "spend", description: "累计消费满1000000元", condition: 1000000 },
  { id: "category_1", name: "初探世界", icon: "🎯", category: "category", description: "购买过1个品类", condition: 1 },
  { id: "category_3", name: "品类尝鲜者", icon: "🍀", category: "category", description: "购买过3个品类", condition: 3 },
  { id: "category_5", name: "五湖四海", icon: "🌍", category: "category", description: "购买过5个品类", condition: 5 },
  { id: "category_10", name: "十项全能", icon: "🔟", category: "category", description: "购买过10个品类", condition: 10 },
  { id: "category_15", name: "购物达人", icon: "🛍️", category: "category", description: "购买过15个品类", condition: 15 },
  { id: "category_20", name: "品类收藏家", icon: "📚", category: "category", description: "购买过20个品类", condition: 20 },
  { id: "category_25", name: "品类全满贯", icon: "🏅", category: "category", description: "购买过25个品类", condition: 25 },
  { id: "category_30", name: "购物探险家", icon: "🗺️", category: "category", description: "购买过30个品类", condition: 30 },
  { id: "category_40", name: "品类大师", icon: "🎓", category: "category", description: "购买过40个品类", condition: 40 },
  { id: "category_50", name: "万物皆有", icon: "🌌", category: "category", description: "购买过50个品类", condition: 50 },
  { id: "favorite_1", name: "初次心动", icon: "💗", category: "favorite", description: "收藏1件商品", condition: 1 },
  { id: "favorite_5", name: "心有所属", icon: "💕", category: "favorite", description: "收藏5件商品", condition: 5 },
  { id: "favorite_10", name: "收藏达人", icon: "💖", category: "favorite", description: "收藏10件商品", condition: 10 },
  { id: "favorite_20", name: "心动收藏家", icon: "💝", category: "favorite", description: "收藏20件商品", condition: 20 },
  { id: "favorite_30", name: "种草能手", icon: "🌱", category: "favorite", description: "收藏30件商品", condition: 30 },
  { id: "favorite_50", name: "购物清单", icon: "📋", category: "favorite", description: "收藏50件商品", condition: 50 },
  { id: "favorite_80", name: "审美在线", icon: "🎨", category: "favorite", description: "收藏80件商品", condition: 80 },
  { id: "favorite_100", name: "百宝囊", icon: "🎒", category: "favorite", description: "收藏100件商品", condition: 100 },
  { id: "favorite_150", name: "收藏大师", icon: "🏆", category: "favorite", description: "收藏150件商品", condition: 150 },
  { id: "favorite_200", name: "万物收藏", icon: "👑", category: "favorite", description: "收藏200件商品", condition: 200 },
  { id: "wishlist_1", name: "心愿萌芽", icon: "🌱", category: "wishlist", description: "添加1个心愿", condition: 1 },
  { id: "wishlist_3", name: "心愿清单", icon: "📝", category: "wishlist", description: "添加3个心愿", condition: 3 },
  { id: "wishlist_5", name: "梦想家", icon: "💫", category: "wishlist", description: "添加5个心愿", condition: 5 },
  { id: "wishlist_10", name: "许愿达人", icon: "⭐", category: "wishlist", description: "添加10个心愿", condition: 10 },
  { id: "wishlist_15", name: "心愿收藏家", icon: "🌟", category: "wishlist", description: "添加15个心愿", condition: 15 },
  { id: "wishlist_20", name: "梦想编织者", icon: "🕸️", category: "wishlist", description: "添加20个心愿", condition: 20 },
  { id: "wishlist_30", name: "心愿满满", icon: "🎁", category: "wishlist", description: "添加30个心愿", condition: 30 },
  { id: "wishlist_40", name: "造梦师", icon: "🎪", category: "wishlist", description: "添加40个心愿", condition: 40 },
  { id: "wishlist_50", name: "心愿大师", icon: "🏆", category: "wishlist", description: "添加50个心愿", condition: 50 },
  { id: "wishlist_99", name: "九十九个心愿", icon: "💎", category: "wishlist", description: "添加99个心愿", condition: 99 },
];

export const BADGE_CATEGORIES: { key: BadgeCategory; label: string; icon: string }[] = [
  { key: "streak", label: "连续打卡", icon: "📅" },
  { key: "spend", label: "消费金额", icon: "💰" },
  { key: "category", label: "品类探索", icon: "🛍️" },
  { key: "favorite", label: "收藏达人", icon: "💗" },
  { key: "wishlist", label: "心愿清单", icon: "⭐" },
];

export type CartItem = Product & {
  quantity: number;
  selectedSpecs?: Record<string, string>;
  finalPrice: number;
};

export type PurchaseRecord = {
  id: string;
  orderNo: string;
  createdAt: string;
  amount: number;
  items: CartItem[];
  status: "pending" | "shipping" | "completed" | "aftersale";
  afterSaleStatus?: "none" | "applied" | "processing" | "completed";
  afterSaleAppliedAt?: string;
  travelStartDate?: string;
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

export type Stats = {
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

const checkBadges = (stats: Stats): string[] => {
  const earned = new Set(stats.badges);
  const categorySet = new Set<string>();
  (stats.purchases ?? []).forEach((p) =>
    p.items.forEach((item) => categorySet.add(item.category))
  );
  const categoryCount = categorySet.size;
  const favoriteCount = (stats.favorites ?? []).length;
  const wishlistCount = (stats.wishlist ?? []).length;

  BADGES.forEach((badge) => {
    if (earned.has(badge.id)) return;
    switch (badge.category) {
      case "streak":
        if (stats.streak >= badge.condition) earned.add(badge.id);
        break;
      case "spend":
        if (stats.virtualSpend >= badge.condition) earned.add(badge.id);
        break;
      case "category":
        if (categoryCount >= badge.condition) earned.add(badge.id);
        break;
      case "favorite":
        if (favoriteCount >= badge.condition) earned.add(badge.id);
        break;
      case "wishlist":
        if (wishlistCount >= badge.condition) earned.add(badge.id);
        break;
    }
  });

  return Array.from(earned);
};

type ShopState = {
  cart: CartItem[];
  stats: Stats;
  addToCart: (product: Product, selectedSpecs?: Record<string, string>, finalPrice?: number, quantity?: number) => void;
  addToWishlist: (title: string, note?: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  addMessage: (content: string) => void;
  removeFromCart: (id: number) => void;
  changeQuantity: (id: number, delta: number) => void;
  updateCartItemSpecs: (id: number, selectedSpecs: Record<string, string>, finalPrice: number) => void;
  clearCart: () => void;
  markProductViewed: () => void;
  completeOrder: (amount: number, items?: CartItem[]) => void;
  updateOrderStatus: (id: string, status: PurchaseRecord["status"]) => void;
  refreshStreak: () => void;
  applyAfterSale: (id: string) => void;
  completeAfterSale: (id: string) => void;
  setAvatar: (avatar: string) => void;
  setNickname: (nickname: string) => void;
};

const todayKey = () => formatLocalDate(new Date());

const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatLocalDate(date);
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
      addToCart: (product, selectedSpecs, finalPrice, quantity = 1) =>
        set((state) => {
          const price = finalPrice ?? product.price;
          const qty = Math.max(1, Math.floor(quantity));
          const targetKey = specsKey(selectedSpecs);
          const existing = state.cart.find(
            (item) => item.id === product.id && specsKey(item.selectedSpecs) === targetKey
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id && specsKey(item.selectedSpecs) === targetKey
                  ? { ...item, quantity: item.quantity + qty }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: qty, selectedSpecs, finalPrice: price }] };
        }),
      addToWishlist: (title, note) =>
        set((state) => {
          const wishlist = [
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              title,
              note,
              createdAt: new Date().toISOString()
            },
            ...(state.stats.wishlist ?? [])
          ].slice(0, 99);
          const newStats = { ...state.stats, wishlist };
          return {
            stats: {
              ...newStats,
              badges: checkBadges(newStats)
            }
          };
        }),
      removeFromWishlist: (id) =>
        set((state) => ({
          stats: {
            ...state.stats,
            wishlist: (state.stats.wishlist ?? []).filter((item) => item.id !== id)
          }
        })),
      toggleFavorite: (product) =>
        set((state) => {
          const prev = state.stats.favorites ?? [];
          const next = prev.filter((f) => f.productId !== product.id);
          const favorites = (next.length === prev.length
            ? [{ productId: product.id, product, createdAt: new Date().toISOString() }, ...prev]
            : next
          ).slice(0, 200);
          const newStats = { ...state.stats, favorites };
          return {
            stats: {
              ...newStats,
              badges: checkBadges(newStats)
            }
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
      updateCartItemSpecs: (id, selectedSpecs, finalPrice) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, selectedSpecs, finalPrice } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      markProductViewed: () => set((state) => ({ stats: { ...state.stats, viewedProducts: state.stats.viewedProducts + 1 } })),
      completeOrder: (amount, items) =>
        set((state) => {
          const happyCount = state.stats.happyCount + 1;
          const orderItems = items?.length ? items : state.cart;
          const orderNo = `SG${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
          
          let travelStartDate: string | undefined;
          if (orderItems.length > 0 && orderItems.every((item) => item.category === "旅行")) {
            let earliest: { time: number; raw: string } | null = null;
            for (const item of orderItems) {
              if (!item.selectedSpecs) continue;
              const date = item.selectedSpecs["出发日期"] || item.selectedSpecs["入住日期"] || item.selectedSpecs["取车日期"];
              if (!date) continue;
              const t = parseLocalDate(date)?.getTime() ?? 0;
              if (!earliest || t < earliest.time) earliest = { time: t, raw: date };
            }
            travelStartDate = earliest?.raw;
          }
          
          const purchase: PurchaseRecord = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            orderNo,
            createdAt: new Date().toISOString(),
            amount,
            items: orderItems.map((item) => ({ ...item })),
            status: "shipping",
            afterSaleStatus: "none",
            travelStartDate,
          };
          const purchases = [purchase, ...(state.stats.purchases ?? [])].slice(0, 30);
          const newStats = {
            ...state.stats,
            virtualSpend: state.stats.virtualSpend + amount,
            happyCount,
            purchases
          };
          return {
            cart: [],
            stats: {
              ...newStats,
              badges: checkBadges(newStats)
            }
          };
        }),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          stats: {
            ...state.stats,
            purchases: (state.stats.purchases ?? []).map((purchase) =>
              purchase.id === id
                ? { ...purchase, status }
                : purchase
            )
          }
        })),
      applyAfterSale: (id) =>
        set((state) => ({
          stats: {
            ...state.stats,
            purchases: (state.stats.purchases ?? []).map((purchase) =>
              purchase.id === id
                ? {
                    ...purchase,
                    status: "aftersale" as const,
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
                ? { ...purchase, status: "completed" as const, afterSaleStatus: "completed" as const }
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
      refreshStreak: () =>
        set((state) => {
          const today = todayKey();
          if (state.stats.lastVisitDate === today) return {};
          const streak = state.stats.lastVisitDate === yesterdayKey() ? state.stats.streak + 1 : 1;
          const newStats = {
            ...initialStats,
            ...state.stats,
            purchases: state.stats.purchases ?? [],
            wishlist: state.stats.wishlist ?? [],
            messages: state.stats.messages ?? [],
            favorites: state.stats.favorites ?? [],
            badges: state.stats.badges ?? [],
            streak,
            lastVisitDate: today
          };
          return {
            stats: {
              ...newStats,
              badges: checkBadges(newStats)
            }
          };
        })
    }),
    {
      name: "moon-cart-storage",
      version: 1,
      partialize: (state) => ({ cart: state.cart, stats: state.stats }),
      migrate: (persistedState: unknown, version): { cart: unknown; stats: unknown } => {
        const state = persistedState as { cart?: unknown; stats?: Record<string, unknown> };
        const stats = { ...(state.stats ?? {}) } as Record<string, unknown>;
        if (version < 1) {
          stats.purchases = stats.purchases ?? [];
          stats.wishlist = stats.wishlist ?? [];
          stats.messages = stats.messages ?? [];
          stats.favorites = stats.favorites ?? [];
          stats.badges = stats.badges ?? [];
        }
        return { cart: state.cart ?? [], stats };
      },
    }
  )
);
