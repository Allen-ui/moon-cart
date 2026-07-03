"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bolt, Check, Home, Minus, Plus, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { categories, pickProducts, products, type Product } from "@/data/products";
import { type CartItem, useShopStore } from "@/store/useShopStore";

type View = "home" | "category" | "list" | "detail" | "cart" | "order" | "delivery" | "done" | "mine";

const categoryShortcuts = [
  { label: "想吃点好的", icon: "🍔", category: "外卖" },
  { label: "数码科技", icon: "📱", category: "数码" },
  { label: "潮流鞋服", icon: "👟", category: "鞋服" },
  { label: "美妆护肤", icon: "💄", category: "美妆" },
  { label: "随便逛逛", icon: "🛍", category: undefined },
  { label: "我的购物车", icon: "❤️", category: "cart" }
];

const deliverySteps = [
  "订单生成",
  "商家接单",
  "骑手接单",
  "骑手到店",
  "商品制作中",
  "已取货",
  "配送中",
  "距离 2.3km",
  "距离 1.6km",
  "距离 800m",
  "距离 200m",
  "已送达"
];

const money = (value: number) => `¥${Math.round(value)}`;

export default function MoonCartApp() {
  const [view, setView] = useState<View>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [lastOrderAmount, setLastOrderAmount] = useState(428);
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([]);
  const [deliveryIndex, setDeliveryIndex] = useState(0);
  const { cart, stats, addToCart, removeFromCart, changeQuantity, markProductViewed, completeOrder, refreshStreak } = useShopStore();

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  const visibleProducts = useMemo(() => pickProducts(selectedCategory), [selectedCategory]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount = cartTotal > 300 ? 60 : cartTotal > 160 ? 30 : cartTotal > 80 ? 12 : 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const openCategory = (category?: string) => {
    setSelectedCategory(category);
    setView(category ? "list" : "category");
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    markProductViewed();
    setView("detail");
  };

  const startOrder = (amount = finalTotal || selectedProduct.price, items?: CartItem[]) => {
    setLastOrderAmount(amount);
    setLastOrderItems(items?.length ? items.map((item) => ({ ...item })) : [{ ...selectedProduct, quantity: 1 }]);
    setView("order");
    window.setTimeout(() => setView("delivery"), 2000);
  };

  useEffect(() => {
    if (view !== "delivery") return;
    setDeliveryIndex(0);
    const timer = window.setInterval(() => {
      setDeliveryIndex((current) => {
        if (current >= deliverySteps.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            completeOrder(lastOrderAmount, lastOrderItems);
            setView("done");
          }, 700);
          return current;
        }
        return current + 1;
      });
    }, 2100);
    return () => window.clearInterval(timer);
  }, [completeOrder, lastOrderAmount, lastOrderItems, view]);

  const accelerate = () => {
    setDeliveryIndex((index) => Math.min(deliverySteps.length - 1, index + 2));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[460px] bg-paper px-4 pb-24 pt-4 text-ink shadow-soft md:my-6 md:min-h-[860px] md:rounded-[28px]">
      <AnimatePresence mode="wait">
        {view === "home" && (
          <Screen key="home">
            <section className="flex min-h-[calc(100vh-8rem)] flex-col justify-between py-6">
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <div className="text-sm text-quiet">Moon Cart</div>
                  <button className="rounded-full bg-white p-3 shadow-soft" onClick={() => setView("mine")} aria-label="我的">
                    <UserRound size={19} />
                  </button>
                </div>
                <h1 className="text-[44px] font-semibold leading-[1.08] tracking-normal">
                  今晚
                  <br />
                  想买点什么？
                </h1>
                <p className="mt-5 text-xl leading-8 text-quiet">
                  不用花钱。
                  <br />
                  放心买。
                </p>
                <div className="mt-10 grid grid-cols-2 gap-3">
                  {categoryShortcuts.map((item) => (
                    <button
                      key={item.label}
                      className="min-h-28 rounded-[26px] bg-white p-4 text-left shadow-soft transition active:scale-[0.98]"
                      onClick={() => (item.category === "cart" ? setView("cart") : openCategory(item.category))}
                    >
                      <span className="block text-3xl">{item.icon}</span>
                      <span className="mt-4 block text-base font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="pb-2 text-center text-sm text-quiet">今天所有快乐 免费。</p>
            </section>
          </Screen>
        )}

        {view === "category" && (
          <Screen key="category">
            <Header title="今晚逛哪里" onBack={() => setView("home")} />
            <div className="grid grid-cols-2 gap-3 pt-4">
              {categories.map((category, index) => (
                <button key={category} onClick={() => openCategory(category)} className="rounded-[24px] bg-white p-5 text-left shadow-soft active:scale-[0.98]">
                  <div className="mb-8 text-3xl">{["🍱", "🍓", "🍫", "🧋", "🎧", "💄", "👟", "☕", "🕯", "✈️"][index]}</div>
                  <div className="text-lg font-semibold">{category}</div>
                  <div className="mt-1 text-sm text-quiet">约 {pickProducts(category).length} 件快乐</div>
                </button>
              ))}
            </div>
          </Screen>
        )}

        {view === "list" && (
          <Screen key="list">
            <Header title={selectedCategory ?? "随便逛逛"} onBack={() => (selectedCategory ? setView("category") : setView("home"))} right={<CartButton count={cartCount} onClick={() => setView("cart")} />} />
            <div className="hide-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
              <button onClick={() => setSelectedCategory(undefined)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${!selectedCategory ? "bg-ink text-white" : "bg-white text-ink"}`}>
                全部
              </button>
              {categories.map((category) => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${selectedCategory === category ? "bg-ink text-white" : "bg-white text-ink"}`}>
                  {category}
                </button>
              ))}
            </div>
            <div className="masonry pb-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />
              ))}
            </div>
          </Screen>
        )}

        {view === "detail" && (
          <Screen key="detail">
            <Header title="商品详情" onBack={() => setView("list")} right={<CartButton count={cartCount} onClick={() => setView("cart")} />} />
            <ProductVisual product={selectedProduct} large />
            <section className="mt-5 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold leading-tight">{selectedProduct.title}</h2>
                  <p className="mt-2 text-sm text-quiet">销量 {selectedProduct.sales} · {Math.floor(selectedProduct.id * 17 + 98)} 条评价</p>
                </div>
                <div className="shrink-0 text-2xl font-semibold text-coral">{money(selectedProduct.price)}</div>
              </div>
              <p className="mt-5 leading-7 text-quiet">{selectedProduct.intro}</p>
              <div className="mt-5 grid gap-3">
                <InfoRow label="优惠券" value={selectedProduct.coupon} tone="coral" />
                <InfoRow label="配送信息" value="今晚马上送达，实际不会发货" />
              </div>
            </section>
            <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[460px] gap-3 bg-paper/95 p-4 backdrop-blur">
              <button className="flex-1 rounded-full bg-white px-5 py-4 font-semibold shadow-soft" onClick={() => addToCart(selectedProduct)}>
                加入购物车
              </button>
              <button className="flex-1 rounded-full bg-ink px-5 py-4 font-semibold text-white shadow-soft" onClick={() => startOrder(selectedProduct.price, [{ ...selectedProduct, quantity: 1 }])}>
                立即下单
              </button>
            </div>
          </Screen>
        )}

        {view === "cart" && (
          <Screen key="cart">
            <Header title="我的购物车" onBack={() => setView("home")} />
            {cart.length === 0 ? (
              <EmptyCart onShop={() => openCategory(undefined)} />
            ) : (
              <>
                <div className="space-y-3 pt-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-[24px] bg-white p-3 shadow-soft">
                      <ProductVisual product={item} compact />
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 font-semibold">{item.title}</div>
                        <div className="mt-1 text-sm text-coral">{item.coupon}</div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-semibold">{money(item.price)}</span>
                          <div className="flex items-center gap-2">
                            <IconButton label="减少" onClick={() => changeQuantity(item.id, -1)}><Minus size={15} /></IconButton>
                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                            <IconButton label="增加" onClick={() => changeQuantity(item.id, 1)}><Plus size={15} /></IconButton>
                            <IconButton label="删除" onClick={() => removeFromCart(item.id)}><Trash2 size={15} /></IconButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <section className="mt-5 rounded-[28px] bg-white p-5 shadow-soft">
                  <InfoRow label="商品总价" value={money(cartTotal)} />
                  <InfoRow label="优惠金额" value={`-${money(discount)}`} tone="coral" />
                  <InfoRow label="凑单提示" value={cartTotal < 89 ? `再买 ${money(89 - cartTotal)} 即可包邮` : cartTotal < 300 ? `再买 ${money(300 - cartTotal)} 可减 60 元` : "今晚已经很会买了"} />
                  <div className="mt-5 flex items-end justify-between border-t border-black/5 pt-5">
                    <span className="text-quiet">合计</span>
                    <span className="text-3xl font-semibold">{money(finalTotal)}</span>
                  </div>
                </section>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button className="rounded-full bg-white py-4 font-semibold shadow-soft" onClick={() => openCategory(undefined)}>继续逛逛</button>
                  <button className="rounded-full bg-ink py-4 font-semibold text-white shadow-soft" onClick={() => startOrder(finalTotal, cart)}>立即下单</button>
                </div>
              </>
            )}
          </Screen>
        )}

        {view === "order" && (
          <Screen key="order">
            <Centered>
              <motion.div animate={{ scale: [0.95, 1.04, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-soft">
                <Check className="text-mint" size={42} />
              </motion.div>
              <h2 className="text-3xl font-semibold">订单生成成功</h2>
              <div className="mt-8 space-y-3 text-lg text-quiet">
                <p>正在联系商家…</p>
                <p>预计马上开始配送…</p>
              </div>
            </Centered>
          </Screen>
        )}

        {view === "delivery" && (
          <Screen key="delivery">
            <Header title="配送中" onBack={() => setView("home")} right={<button className="rounded-full bg-white p-3 shadow-soft" onClick={accelerate} aria-label="加速配送"><Bolt size={18} /></button>} />
            <section className="relative mt-4 h-[360px] overflow-hidden rounded-[32px] bg-white shadow-soft">
              <div className="absolute inset-5 rounded-[26px] bg-[linear-gradient(90deg,rgba(17,17,17,.04)_1px,transparent_1px),linear-gradient(rgba(17,17,17,.04)_1px,transparent_1px)] bg-[length:42px_42px]" />
              <motion.div className="absolute left-10 top-20 h-16 w-16 rounded-[22px] bg-coral/15 p-4 text-3xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 1.7, repeat: Infinity }}>
                🛍
              </motion.div>
              <motion.div className="absolute bottom-16 left-8 h-2 rounded-full bg-coral" animate={{ width: `${Math.min(85, 8 + deliveryIndex * 7)}%` }} />
              <motion.div className="absolute bottom-11 text-4xl" animate={{ left: `${Math.min(78, 8 + deliveryIndex * 6.6)}%` }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
                🛵
              </motion.div>
              <div className="absolute right-8 top-24 flex h-20 w-20 items-center justify-center rounded-[24px] bg-mint/10 text-3xl">🏠</div>
            </section>
            <section className="mt-5 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-quiet">当前状态</span>
                <span className="rounded-full bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">{Math.round(((deliveryIndex + 1) / deliverySteps.length) * 100)}%</span>
              </div>
              <h2 className="text-2xl font-semibold">{deliverySteps[deliveryIndex]}</h2>
              <div className="mt-5 grid gap-3">
                {deliverySteps.slice(0, deliveryIndex + 1).slice(-5).map((step) => (
                  <div key={step} className="flex items-center gap-3 text-sm text-quiet">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint/10 text-mint"><Check size={14} /></span>
                    {step}
                  </div>
                ))}
              </div>
            </section>
          </Screen>
        )}

        {view === "done" && (
          <Screen key="done">
            <Centered>
              <div className="text-7xl">🎉</div>
              <h2 className="mt-6 text-3xl font-semibold">快乐已送达</h2>
              <p className="mx-auto mt-5 max-w-xs text-lg leading-8 text-quiet">
                今天辛苦了。
                <br />
                虽然什么都没有收到。
                <br />
                但你已经奖励了努力生活的自己。
              </p>
              <section className="mt-8 w-full rounded-[28px] bg-white p-5 text-left shadow-soft">
                <InfoRow label="本次订单金额" value={money(lastOrderAmount)} />
                <InfoRow label="实际支付" value="¥0" tone="mint" />
                <InfoRow label="今日快乐值" value="+100" tone="coral" />
              </section>
              <section className="mt-4 w-full rounded-[28px] bg-white p-5 text-left shadow-soft">
                <div className="mb-3 font-semibold">刚刚买过</div>
                <BoughtItems items={lastOrderItems} />
              </section>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button className="rounded-full bg-white py-4 font-semibold shadow-soft" onClick={() => openCategory(undefined)}>继续逛逛</button>
                <button className="rounded-full bg-ink py-4 font-semibold text-white shadow-soft" onClick={() => setView("home")}>返回首页</button>
              </div>
            </Centered>
          </Screen>
        )}

        {view === "mine" && (
          <Screen key="mine">
            <Header title="我的" onBack={() => setView("home")} />
            <section className="mt-4 rounded-[32px] bg-ink p-6 text-white shadow-soft">
              <div className="text-sm text-white/60">累计虚拟消费</div>
              <div className="mt-3 text-5xl font-semibold">{money(stats.virtualSpend)}</div>
              <div className="mt-4 text-sm text-white/60">所有快乐都没有真的扣款。</div>
            </section>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard label="快乐次数" value={stats.happyCount} />
              <StatCard label="连续打卡" value={`${stats.streak} 天`} />
              <StatCard label="浏览商品" value={stats.viewedProducts} />
              <StatCard label="获得徽章" value={stats.badges.length} />
            </div>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">徽章</div>
              <div className="flex flex-wrap gap-2">
                {(stats.badges.length ? stats.badges : ["今晚第一单", "深夜常客", "虚拟大买家"]).map((badge, index) => (
                  <span key={badge} className={`rounded-full px-3 py-2 text-sm ${stats.badges.includes(badge) ? "bg-coral/10 text-coral" : "bg-black/5 text-quiet"}`}>
                    {index === 0 ? "🏅" : index === 1 ? "🌙" : "🛒"} {badge}
                  </span>
                ))}
              </div>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">买过什么</span>
                <span className="text-xs text-quiet">最近 {stats.purchases?.length ?? 0} 次</span>
              </div>
              {stats.purchases?.length ? (
                <div className="space-y-3">
                  {stats.purchases.slice(0, 8).map((record) => (
                    <div key={record.id} className="rounded-[22px] bg-black/[0.03] p-3">
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="font-semibold">{formatPurchaseDate(record.createdAt)}</span>
                        <span className="text-coral">{money(record.amount)}</span>
                      </div>
                      <BoughtItems items={record.items} compact />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-quiet">还没有买过的记录。完成一次快乐送达后，这里会自动留下本次清单。</p>
              )}
            </section>
          </Screen>
        )}
      </AnimatePresence>
      {["home", "list", "cart", "mine"].includes(view) && <TabBar view={view} setView={setView} cartCount={cartCount} />}
    </main>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.div>
  );
}

function Header({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between bg-paper/90 px-4 py-3 backdrop-blur">
      <button className="rounded-full bg-white p-3 shadow-soft" onClick={onBack} aria-label="返回">
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-11">{right}</div>
    </header>
  );
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button className="relative rounded-full bg-white p-3 shadow-soft" onClick={onClick} aria-label="购物车">
      <ShoppingBag size={18} />
      {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-semibold text-white">{count}</span>}
    </button>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button className="masonry-item block w-full rounded-[24px] bg-white p-2 text-left shadow-soft transition active:scale-[0.98]" onClick={onClick}>
      <ProductVisual product={product} />
      <div className="p-2">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold text-coral">{money(product.price)}</span>
          <span className="text-xs text-quiet">销量 {product.sales}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-coral/10 px-2 py-1 text-[11px] text-coral">{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function ProductVisual({ product, large = false, compact = false }: { product: Product; large?: boolean; compact?: boolean }) {
  const size = compact ? "h-24 w-24 shrink-0 rounded-[20px]" : large ? "h-80 rounded-[32px]" : "h-44 rounded-[20px]";
  return (
    <div className={`${size} relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${product.palette}`}>
      <div className="absolute inset-4 rounded-full bg-white/45 blur-2xl" />
      <span className={large ? "relative text-8xl" : compact ? "relative text-4xl" : "relative text-6xl"}>{product.emoji}</span>
    </div>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: "coral" | "mint" }) {
  const color = tone === "coral" ? "text-coral" : tone === "mint" ? "text-mint" : "text-ink";
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-quiet">{label}</span>
      <span className={`text-right font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function BoughtItems({ items, compact = false }: { items: CartItem[]; compact?: boolean }) {
  if (!items.length) {
    return <p className="text-sm text-quiet">这次是直接奖励自己，没有留下具体清单。</p>;
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "space-y-2"}>
      {items.map((item) => (
        <div key={`${item.id}-${item.title}`} className={compact ? "rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink" : "flex items-center justify-between rounded-2xl bg-black/[0.03] px-3 py-2"}>
          <span className="min-w-0">
            <span className="mr-2">{item.emoji}</span>
            <span>{item.title}</span>
          </span>
          {!compact && <span className="shrink-0 text-sm text-quiet">x {item.quantity}</span>}
        </div>
      ))}
    </div>
  );
}

function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <Centered>
      <div className="text-6xl">🛒</div>
      <h2 className="mt-6 text-2xl font-semibold">购物车还是空的</h2>
      <p className="mt-3 text-quiet">先把今晚想买的快乐放进来。</p>
      <button className="mt-8 rounded-full bg-ink px-8 py-4 font-semibold text-white shadow-soft" onClick={onShop}>继续逛逛</button>
    </Centered>
  );
}

function formatPurchaseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">{children}</section>;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-soft">
      <div className="text-sm text-quiet">{label}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function TabBar({ view, setView, cartCount }: { view: View; setView: (view: View) => void; cartCount: number }) {
  const items = [
    { view: "home" as View, label: "首页", icon: Home },
    { view: "cart" as View, label: "购物车", icon: ShoppingBag },
    { view: "mine" as View, label: "我的", icon: UserRound }
  ];
  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 mx-auto flex max-w-[420px] justify-center px-4">
      <div className="flex w-full justify-around rounded-full bg-white/95 p-2 shadow-soft backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;
          return (
            <button key={item.view} onClick={() => setView(item.view)} className={`relative flex min-w-20 flex-col items-center rounded-full px-4 py-2 text-xs ${active ? "bg-ink text-white" : "text-quiet"}`}>
              <span className="relative">
                <Icon size={18} />
                {item.view === "cart" && cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-semibold leading-none text-white">
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
