"use client";

import type { Product } from "@/data/products";

export function ProductVisual({
  product,
  large = false,
  compact = false,
}: {
  product: Product;
  large?: boolean;
  compact?: boolean;
}) {
  const size = compact
    ? "h-24 w-24 shrink-0 rounded-[20px]"
    : large
      ? "h-80 rounded-[32px]"
      : "h-44 rounded-[20px]";
  return (
    <div
      className={`${size} relative flex items-center justify-center overflow-hidden bg-black/[0.03]`}
    >
      <span
        className={
          large
            ? "relative text-9xl"
            : compact
              ? "relative text-5xl"
              : "relative text-7xl"
        }
      >
        {product.emoji}
      </span>
    </div>
  );
}
