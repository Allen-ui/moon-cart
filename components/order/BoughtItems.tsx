"use client";

import type { CartItem } from "@/store/useShopStore";

export function BoughtItems({
  items,
  compact = false,
  inverse = false,
}: {
  items: CartItem[];
  compact?: boolean;
  inverse?: boolean;
}) {
  if (!items.length) {
    return (
      <p className={`text-sm ${inverse ? "text-white/60" : "text-quiet"}`}>
        这次是直接奖励自己，没有留下具体清单。
      </p>
    );
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "space-y-2"}>
      {items.map((item) => (
        <div
          key={`${item.id}-${item.title}`}
          className={
            compact
              ? `rounded-full px-3 py-2 text-xs font-semibold ${inverse ? "bg-white/15 text-white" : "bg-white text-ink"}`
              : "flex items-center justify-between rounded-2xl bg-black/[0.03] px-3 py-2"
          }
        >
          <span className="min-w-0">
            <span className="mr-2">{item.emoji}</span>
            <span>{item.title}</span>
          </span>
          {!compact && (
            <span className="shrink-0 text-sm text-quiet">
              x {item.quantity}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
