"use client";

import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { money } from "@/utils/format";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({
  product,
  onClick,
  showFavorite = true,
  onToggleFavorite,
  isFavorite,
  onAddToCart,
  onQuickAdd,
}: {
  product: Product;
  onClick: () => void;
  showFavorite?: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onAddToCart?: () => void;
  onQuickAdd?: (product: Product) => void;
}) {
  return (
    <div className="masonry-item relative">
      <button
        className="block w-full rounded-[24px] bg-white p-2 text-left shadow-soft transition active:scale-[0.98]"
        onClick={onClick}
      >
        <div className="relative rounded-xl bg-black/[0.03] overflow-hidden">
          <ProductVisual product={product} />
          {product.shop && product.category === "外卖" && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-coral/90 px-3 py-1 text-[11px] font-medium text-white">
              {product.shop}
            </span>
          )}
        </div>
        <div className="p-2">
          <h3 className="line-clamp-2 text-[13px] font-medium text-ink leading-snug">
            {product.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium text-price">
                {money(product.price)}
              </span>
              <span className="text-xs text-strike line-through">
                {money(product.price * 1.8)}
              </span>
            </div>
            <span className="text-xs text-muted">已售 {product.sales}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-coral/10 px-2 py-1 text-[11px] text-coral-deep"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>
      {showFavorite && onToggleFavorite && (
        <button
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart
            size={15}
            className={isFavorite ? "fill-coral text-coral" : "text-quiet"}
          />
        </button>
      )}
      {onAddToCart && (
        <button
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg active:scale-90 transition-transform"
          style={{ border: "2px solid var(--bg-primary)" }}
          onClick={(e) => {
            e.stopPropagation();
            if (product.specs && product.specs.length > 0 && onQuickAdd) {
              onQuickAdd(product);
            } else {
              onAddToCart();
            }
          }}
        >
          <ShoppingCart size={16} className="text-white" />
        </button>
      )}
    </div>
  );
}
