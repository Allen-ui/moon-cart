"use client";

import { memo } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { money } from "@/utils/format";
import { ProductVisual } from "./ProductVisual";

type ProductCardProps = {
  product: Product;
  onClick: (product: Product) => void;
  showFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
  onAddToCart?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
};

function ProductCardComponent({
  product,
  onClick,
  showFavorite = true,
  onToggleFavorite,
  isFavorite,
  onAddToCart,
  onQuickAdd,
}: ProductCardProps) {
  return (
    <div className="relative" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 300px" }}>
      <button
        className="block w-full rounded-[24px] bg-white p-2 text-left shadow-soft transition active:scale-[0.98]"
        onClick={() => onClick(product)}
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
            onToggleFavorite(product);
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
              onAddToCart(product);
            }
          }}
        >
          <ShoppingCart size={16} className="text-white" />
        </button>
      )}
    </div>
  );
}

// React.memo 默认浅比较：当 product 引用稳定、回调通过 useCallback 稳定下来时，
// 父组件因购物车/计时器等无关 state 重渲染时，列表项不会重复渲染
export const ProductCard = memo(ProductCardComponent);
