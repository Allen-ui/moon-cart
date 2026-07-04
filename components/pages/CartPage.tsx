"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/data/products";
import { products } from "@/data/products";
import type { CartItem } from "@/store/useShopStore";
import { money } from "@/utils/format";
import { Header } from "@/components/common/Header";
import { Screen } from "@/components/common/Screen";
import { EmptyCart } from "@/components/common/EmptyCart";
import { ProductVisual } from "@/components/product/ProductVisual";

const calculateSpecPrice = (product: Product, selectedSpecs: Record<string, string>) => {
  let totalDelta = 0;
  if (product.specs) {
    product.specs.forEach((spec) => {
      const selectedName = selectedSpecs[spec.label];
      if (selectedName) {
        const option = spec.options.find((o) => o.name === selectedName);
        if (option) {
          totalDelta += option.priceDelta;
        }
      }
    });
  }
  return product.price + totalDelta;
};

export interface CartPageProps {
  cart: CartItem[];
  onBack: () => void;
  onShop: () => void;
  addToCart: (product: Product, specs?: Record<string, string>, price?: number) => void;
  removeFromCart: (id: number) => void;
  changeQuantity: (id: number, delta: number) => void;
  updateCartItemSpecs: (id: number, specs: Record<string, string>, price: number) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  startOrder: (amount: number, items: CartItem[]) => void;
}

export function CartPage({
  cart,
  onBack,
  onShop,
  addToCart,
  removeFromCart,
  changeQuantity,
  updateCartItemSpecs,
  toggleFavorite,
  isFavorite,
  startOrder,
}: CartPageProps) {
  const [selectedCartItems, setSelectedCartItems] = useState<Set<number>>(new Set());
  const [claimedCouponAmount, setClaimedCouponAmount] = useState(0);
  const [couponTarget, setCouponTarget] = useState(0);
  const [flashMessage, setFlashMessage] = useState<string>("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [editingSpecs, setEditingSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cart.length > 0 && selectedCartItems.size === 0) {
      setSelectedCartItems(new Set(cart.map((item) => item.id)));
    }
  }, [cart.length]);

  const selectedItems = useMemo(
    () => cart.filter((item) => selectedCartItems.has(item.id)),
    [cart, selectedCartItems]
  );

  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity, 0),
    [selectedItems]
  );

  const selectedCount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems]
  );

  const isAllSelected = cart.length > 0 && selectedCartItems.size === cart.length;

  const takeoutItems = useMemo(
    () => selectedItems.filter((item) => item.category === "外卖"),
    [selectedItems]
  );

  const travelItems = useMemo(
    () => selectedItems.filter((item) => item.category === "旅行"),
    [selectedItems]
  );

  const deliveryItems = useMemo(
    () => selectedItems.filter((item) => item.category !== "外卖" && item.category !== "旅行"),
    [selectedItems]
  );

  const takeoutTotal = useMemo(
    () => takeoutItems.reduce((sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity, 0),
    [takeoutItems]
  );

  const travelTotal = useMemo(
    () => travelItems.reduce((sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity, 0),
    [travelItems]
  );

  const deliveryTotal = useMemo(
    () => deliveryItems.reduce((sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity, 0),
    [deliveryItems]
  );

  const cartSelectedCategory = useMemo(() => {
    if (takeoutItems.length > 0) return "takeout";
    if (travelItems.length > 0) return "travel";
    if (deliveryItems.length > 0) return "delivery";
    return null;
  }, [takeoutItems, travelItems, deliveryItems]);

  const mixedCategories = useMemo(() => {
    const count =
      (takeoutItems.length > 0 ? 1 : 0) +
      (travelItems.length > 0 ? 1 : 0) +
      (deliveryItems.length > 0 ? 1 : 0);
    return count > 1;
  }, [takeoutItems, travelItems, deliveryItems]);

  const currentTotal = useMemo(() => {
    if (cartSelectedCategory === "takeout") return takeoutTotal;
    if (cartSelectedCategory === "travel") return travelTotal;
    return deliveryTotal;
  }, [cartSelectedCategory, takeoutTotal, travelTotal, deliveryTotal]);

  const couponAmount = useMemo(
    () => (couponTarget > 0 ? couponTarget - currentTotal : 0),
    [couponTarget, currentTotal]
  );

  const canUseCoupon = currentTotal > 0 && claimedCouponAmount > 0;
  const canCheckout = claimedCouponAmount > 0 && couponAmount <= 0;

  useEffect(() => {
    if (currentTotal <= 0 && claimedCouponAmount > 0) {
      setClaimedCouponAmount(0);
      setCouponTarget(0);
    }
  }, [currentTotal, claimedCouponAmount]);

  const finalSelectedTotal = canUseCoupon ? selectedTotal - claimedCouponAmount : selectedTotal;

  const claimCoupon = useCallback(() => {
    if (currentTotal <= 0) return;
    const target = Math.ceil(currentTotal / 50) * 50;
    const coupon = target * 0.1;
    setCouponTarget(target);
    setClaimedCouponAmount(Math.floor(coupon));
    setFlashMessage(`领券成功！获得 ${money(Math.floor(coupon))} 优惠券`);
    setTimeout(() => {
      setFlashMessage("");
    }, 2000);
    const needMore = target - currentTotal;
    if (needMore > 0) {
      setTimeout(() => {
        setFlashMessage(`再买 ${money(needMore)} 即可使用优惠券结算`);
      }, 2200);
      setTimeout(() => {
        setFlashMessage("");
      }, 4200);
    }
  }, [currentTotal]);

  const clearFlashMessage = useCallback(() => {
    setFlashMessage("");
  }, []);

  const toggleSelectItem = useCallback(
    (id: number) => {
      setSelectedCartItems((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
        return newSelected;
      });
    },
    []
  );

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedCartItems(new Set());
    } else {
      setSelectedCartItems(new Set(cart.map((item) => item.id)));
    }
  }, [isAllSelected, cart]);

  const couponRecommendProducts = useMemo(() => {
    if (couponAmount <= 0) return [];
    const cartIds = new Set(cart.map((item) => item.id));
    let categoryFilter: string[] = [];
    if (cartSelectedCategory === "takeout") {
      categoryFilter = ["外卖"];
    } else if (cartSelectedCategory === "travel") {
      categoryFilter = ["旅行"];
    } else {
      categoryFilter = [
        "数码",
        "美妆护肤",
        "女装",
        "男装",
        "箱包",
        "黄金珠宝",
        "家电",
        "家居用品",
        "食品饮料",
        "生鲜水果",
        "母婴用品",
        "运动户外",
        "图书音像",
        "宠物用品",
        "汽车用品",
        "医药健康",
      ];
    }
    return products
      .filter(
        (p) =>
          !cartIds.has(p.id) && categoryFilter.includes(p.category) && p.price >= couponAmount
      )
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);
  }, [couponAmount, cart, products, cartSelectedCategory]);

  const addCouponProduct = useCallback(
    (product: Product) => {
      addToCart(product);
      const newSelected = new Set(selectedCartItems);
      newSelected.add(product.id);
      setSelectedCartItems(newSelected);

      const newCurrentTotal = currentTotal + product.price;
      const newCouponAmount = couponTarget - newCurrentTotal;

      setCouponModalOpen(false);
      if (newCouponAmount <= 0) {
        setFlashMessage(`已添加 ${product.title}，凑单完成！可以结算啦`);
      } else {
        setFlashMessage(`已添加 ${product.title}，还差 ${money(newCouponAmount)} 可享9折`);
      }
      setTimeout(() => setFlashMessage(""), 2000);
    },
    [addToCart, selectedCartItems, currentTotal, couponTarget]
  );

  return (
    <Screen key="cart">
      <Header title="购物车" onBack={onBack} />
      {flashMessage && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/80 backdrop-blur-md px-5 py-2.5 text-sm text-white shadow-lg border border-white/10"
          onClick={clearFlashMessage}
        >
          {flashMessage}
        </div>
      )}
      {cart.length === 0 ? (
        <EmptyCart onShop={onShop} />
      ) : (
        <>
          <div className="space-y-3 pt-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl bg-white p-3 items-start shadow-soft"
              >
                <button
                  onClick={() => toggleSelectItem(item.id)}
                  className="self-center shrink-0"
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: selectedCartItems.has(item.id) ? "#FF5000" : "#636366",
                      background: selectedCartItems.has(item.id) ? "#FF5000" : "#ffffff",
                    }}
                  >
                    {selectedCartItems.has(item.id) && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
                <ProductVisual product={item} compact />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="line-clamp-1 font-semibold flex-1 min-w-0 text-sm">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-quiet">x{item.quantity}</span>
                  </div>
                  {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                    <button
                      className="mt-1.5 text-left"
                      onClick={() => {
                        setEditingCartItem(item);
                        setEditingSpecs({ ...item.selectedSpecs });
                      }}
                    >
                      <span className="text-xs px-2.5 py-1 rounded-full bg-black/[0.05] text-quiet">
                        {Object.values(item.selectedSpecs).join(" / ")} ›
                      </span>
                    </button>
                  )}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg text-price">
                        {money(
                          canCheckout && selectedCartItems.has(item.id)
                            ? (item.finalPrice ?? item.price) * (1 - claimedCouponAmount / selectedTotal)
                            : item.finalPrice ?? item.price
                        )}
                      </span>
                      {canCheckout && selectedCartItems.has(item.id) && (
                        <span className="text-xs text-quiet line-through">
                          {money(item.finalPrice ?? item.price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.05] text-ink hover:bg-black/[0.08] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.05] text-ink hover:bg-black/[0.08] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-quiet hover:text-coral transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedCount > 0 && cartSelectedCategory && (
            <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎫</span>
                <div className="text-sm">
                  <span className="font-bold text-primary">领券凑单更划算</span>
                  {couponAmount > 0 && (
                    <div className="text-xs text-quiet mt-0.5">
                      再买 <span className="text-primary font-semibold">{money(couponAmount)}</span>{" "}
                      可享9折
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={claimCoupon}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  claimedCouponAmount > 0
                    ? "bg-black/[0.06] text-quiet"
                    : "bg-primary text-white"
                }`}
              >
                {claimedCouponAmount > 0 ? "已领券" : "领券"}
              </button>
            </div>
          )}
          <section className="mt-5 rounded-[24px] bg-white p-5 shadow-soft">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-quiet">已选商品</span>
                <span className="font-medium">{selectedCount} 件</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-quiet">商品总价</span>
                <span className="font-medium">{money(selectedTotal)}</span>
              </div>
              {claimedCouponAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-quiet">优惠券</span>
                  <span className="text-primary font-medium">
                    -{money(claimedCouponAmount)}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 flex items-end justify-between">
              <span className="text-quiet text-sm">合计</span>
              <span className="text-2xl font-bold text-price">{money(finalSelectedTotal)}</span>
            </div>
          </section>
          <div className="mt-5 flex items-center gap-3 px-1">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 shrink-0"
            >
              <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: isAllSelected ? "#FF5000" : "#636366",
                        background: isAllSelected ? "#FF5000" : "transparent",
                      }}
                    >
                {isAllSelected && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-quiet">全选</span>
            </button>
            {selectedCount > 0 && (
              <button
                onClick={() => {
                  selectedCartItems.forEach((id) => removeFromCart(id));
                  setSelectedCartItems(new Set());
                  setClaimedCouponAmount(0);
                  setFlashMessage("已删除选中商品");
                  setTimeout(() => setFlashMessage(""), 2000);
                }}
                className="flex items-center gap-1.5 shrink-0 text-quiet hover:text-coral transition-colors"
              >
                <Trash2 size={20} />
                <span className="text-sm">删除</span>
              </button>
            )}
            <div className="flex-1" />
            {selectedCount === 0 ? (
              <button
                className="rounded-full py-2.5 px-5 font-semibold text-white text-sm opacity-40 bg-primary shrink-0"
                disabled
              >
                请选择
              </button>
            ) : mixedCategories ? (
              <button
                className="rounded-full py-2.5 px-5 font-semibold text-white text-sm bg-coral shrink-0"
                onClick={() => {
                  setFlashMessage("只能选择同一类商品结算哦");
                  setTimeout(() => setFlashMessage(""), 2000);
                }}
              >
                同类结算
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full py-2.5 px-4 font-semibold text-sm text-primary border border-primary shrink-0"
                  onClick={() => {
                    if (claimedCouponAmount > 0 && couponAmount > 0) {
                      setCouponModalOpen(true);
                    } else if (claimedCouponAmount === 0) {
                      claimCoupon();
                      setTimeout(() => setCouponModalOpen(true), 300);
                    }
                  }}
                >
                  {claimedCouponAmount > 0
                    ? couponAmount <= 0
                      ? "已凑单"
                      : "去凑单"
                    : "领券凑单"}
                </button>
                <button
                  className="rounded-full py-2.5 px-5 font-bold text-white text-sm bg-primary shadow-soft shrink-0"
                  onClick={() => {
                    const total = canCheckout
                      ? (cartSelectedCategory === "takeout"
                          ? takeoutTotal
                          : cartSelectedCategory === "travel"
                          ? travelTotal
                          : selectedTotal) - claimedCouponAmount
                      : cartSelectedCategory === "takeout"
                      ? takeoutTotal
                      : cartSelectedCategory === "travel"
                      ? travelTotal
                      : selectedTotal;
                    const items =
                      cartSelectedCategory === "takeout"
                        ? takeoutItems
                        : cartSelectedCategory === "travel"
                        ? travelItems
                        : deliveryItems;
                    startOrder(total, items);
                  }}
                >
                  {canCheckout ? "结算" : "直接结算"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {couponModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={() => setCouponModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[28px] overflow-hidden max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-black/5">
              <div className="text-lg font-semibold">凑单领券</div>
              <div className="text-sm text-quiet mt-1">
                再买 <span className="text-primary font-semibold">{money(couponAmount)}</span>{" "}
                可享9折优惠，已领优惠券{" "}
                <span className="text-primary font-semibold">{money(claimedCouponAmount)}</span>
              </div>
            </div>
            <div className="px-5 py-3 overflow-y-auto max-h-[50vh] space-y-3">
              {couponRecommendProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl bg-black/[0.02] p-3"
                >
                  <div className="h-14 w-14 shrink-0 rounded-[14px] bg-black/[0.03] flex items-center justify-center text-3xl">
                    {product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product.title}</div>
                    <div className="text-primary font-semibold mt-0.5">
                      {money(product.price)}
                    </div>
                  </div>
                  <button
                    onClick={() => addCouponProduct(product)}
                    className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white"
                  >
                    加购
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-black/5">
              <button
                onClick={() => setCouponModalOpen(false)}
                className="w-full rounded-full bg-black/[0.06] py-3 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCartItem && editingCartItem.specs && editingCartItem.specs.length > 0 && (
        <AnimatePresence>
          {editingCartItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setEditingCartItem(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-[460px] rounded-t-[32px] bg-white p-5 pb-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10" />
                <div className="flex items-center gap-3">
                  <ProductVisual product={editingCartItem} compact />
                  <div className="flex-1">
                    <div className="font-semibold">{editingCartItem.title}</div>
                    <div className="mt-1 text-lg font-semibold text-price">
                      {money(calculateSpecPrice(editingCartItem, editingSpecs))}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-3 font-semibold">修改规格</div>
                  {editingCartItem.specs.map((spec) => (
                    <div key={spec.label} className="mt-3">
                      <div className="mb-2 text-sm text-quiet">{spec.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {spec.options.map((option) => {
                          const isSelected = editingSpecs[spec.label] === option.name;
                          return (
                            <button
                              key={option.name}
                              onClick={() =>
                                setEditingSpecs((prev) => ({
                                  ...prev,
                                  [spec.label]: option.name,
                                }))
                              }
                              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-all ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-black/[0.03] text-ink active:bg-black/5"
                              }`}
                            >
                              <span>{option.name}</span>
                              {option.priceDelta !== 0 && (
                                <span
                                  className={`text-xs ${
                                    isSelected ? "text-white/80" : "text-quiet"
                                  }`}
                                >
                                  {option.priceDelta > 0
                                    ? `+${option.priceDelta}`
                                    : option.priceDelta}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)] active:bg-primary/80"
                  onClick={() => {
                    if (editingCartItem) {
                      updateCartItemSpecs(
                        editingCartItem.id,
                        editingSpecs,
                        calculateSpecPrice(editingCartItem, editingSpecs)
                      );
                    }
                    setEditingCartItem(null);
                  }}
                >
                  确认修改
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Screen>
  );
}
