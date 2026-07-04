"use client";

import { ShoppingBag } from "lucide-react";

export function CartButton({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      className="relative rounded-full bg-white p-3 shadow-soft"
      onClick={onClick}
      aria-label="购物车"
    >
      <ShoppingBag size={18} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-price px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
