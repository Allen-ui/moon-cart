"use client";

import { Home, ShoppingCart, UserRound } from "lucide-react";
import type { View } from "@/types";

export function TabBar({
  view,
  setView,
  cartCount,
}: {
  view: View;
  setView: (view: View) => void;
  cartCount: number;
}) {
  const items = [
    { view: "home" as View, label: "首页", icon: Home },
    { view: "cart" as View, label: "购物车", icon: ShoppingCart },
    { view: "mine" as View, label: "我的", icon: UserRound },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 mx-auto flex max-w-[420px] justify-center px-4">
      <div className="flex w-full justify-around rounded-full bg-white/95 p-1.5 shadow-soft backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`relative flex min-w-[60px] flex-col items-center rounded-full px-3 py-2 text-[11px] transition-all ${active ? "bg-primary text-white" : "text-quiet"}`}
            >
              <span className="relative">
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {item.view === "cart" && cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-price px-1 text-[10px] font-medium leading-none text-white">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
