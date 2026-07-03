"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bolt, Check, Heart, Home, Minus, Plus, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { categories, pickProducts, products, type Product } from "@/data/products";
import { type CartItem, useShopStore } from "@/store/useShopStore";

type View = "home" | "category" | "list" | "detail" | "cart" | "order" | "delivery" | "done" | "mine" | "wish" | "admin";

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

type DeliveryOrder = {
  id: string;
  amount: number;
  items: CartItem[];
  stepIndex: number;
  createdAt: string;
};

export default function MoonCartApp() {
  const [view, setView] = useState<View>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [lastOrderAmount, setLastOrderAmount] = useState(428);
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([]);
  const deliveryTimerRef = useRef<number | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryOrder[]>([]);
  const [wishInput, setWishInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const { cart, stats, addToCart, addToWishlist, removeFromWishlist, addMessage, removeFromCart, changeQuantity, markProductViewed, completeOrder, refreshStreak } = useShopStore();

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  useEffect(() => {
    return () => {
      if (deliveryTimerRef.current) window.clearInterval(deliveryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeDeliveries.length || deliveryTimerRef.current) return;
    deliveryTimerRef.current = window.setInterval(() => {
      setActiveDeliveries((orders) => {
        const completed: DeliveryOrder[] = [];
        const moving = orders
          .map((order) => {
            const stepIndex = Math.min(deliverySteps.length - 1, order.stepIndex + 1);
            const nextOrder = { ...order, stepIndex };
            if (stepIndex >= deliverySteps.length - 1) completed.push(nextOrder);
            return nextOrder;
          })
          .filter((order) => order.stepIndex < deliverySteps.length - 1);

        completed.forEach((order) => {
          completeOrder(order.amount, order.items);
          setLastOrderAmount(order.amount);
          setLastOrderItems(order.items);
        });

        if (!moving.length && deliveryTimerRef.current) {
          window.clearInterval(deliveryTimerRef.current);
          deliveryTimerRef.current = null;
          if (completed.length) setView("done");
        }
        return moving;
      });
    }, 2100);
  }, [activeDeliveries.length, completeOrder]);

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
    const orderItems = items?.length ? items.map((item) => ({ ...item })) : [{ ...selectedProduct, quantity: 1 }];
    setLastOrderAmount(amount);
    setLastOrderItems(orderItems);
    setView("order");
    window.setTimeout(() => {
      setActiveDeliveries((orders) => [
        ...orders,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount,
          items: orderItems,
          stepIndex: 0,
          createdAt: new Date().toISOString()
        }
      ]);
      setView("home");
    }, 2000);
  };

  const accelerate = (id?: string) => {
    setActiveDeliveries((orders) =>
      orders.map((order) =>
        !id || order.id === id ? { ...order, stepIndex: Math.min(deliverySteps.length - 1, order.stepIndex + 2) } : order
      )
    );
  };

  const shareText = () => {
    const itemText = lastOrderItems.length
      ? lastOrderItems.map((item) => `${item.title} x${item.quantity}`).join("、")
      : "一份虚拟快乐";
    return `今晚我在睡前逛逛 Moon Cart 买了：${itemText}，本次订单 ${money(lastOrderAmount)}，实际支付 ¥0。`;
  };

  const copyShareText = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText());
    }
  };

  const profileShareText = () =>
    `我的睡前逛逛 Moon Cart：累计虚拟消费 ${money(stats.virtualSpend)}，快乐次数 ${stats.happyCount}，连续打卡 ${stats.streak} 天，买过 ${stats.purchases?.length ?? 0} 次。`;

  const copyProfileShareText = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(profileShareText());
    }
  };

  const submitWish = () => {
    const title = wishInput.trim();
    if (!title) return;
    addToWishlist(title);
    setWishInput("");
  };

  const submitMessage = () => {
    const content = messageInput.trim();
    if (!content) return;
    addMessage(content);
    setMessageInput("");
  };

  return (
    <main className="moon-app mx-auto min-h-screen w-full max-w-[460px] bg-paper px-4 pb-24 pt-4 text-ink shadow-soft md:my-6 md:min-h-[860px] md:rounded-[28px]">
      <CriticalStyles />
      <DeliveryTicker orders={activeDeliveries} onOpen={() => setView("delivery")} />
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
              <button className="rounded-full bg-white px-4 py-4 font-semibold shadow-soft" onClick={() => addToWishlist(selectedProduct.title, "来自商品详情")}>
                <Heart size={18} />
              </button>
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
            <Header title="配送进度" onBack={() => setView("home")} />
            {!activeDeliveries.length ? (
              <Centered>
                <div className="text-6xl">🛵</div>
                <h2 className="mt-6 text-2xl font-semibold">暂无配送订单</h2>
                <p className="mt-3 leading-7 text-quiet">先去选一件今晚想买的快乐，下单后这里会显示实时配送进度。</p>
                <button className="mt-8 rounded-full bg-ink px-8 py-4 font-semibold text-white shadow-soft" onClick={() => openCategory(undefined)}>去逛逛</button>
              </Centered>
            ) : (
              <div className="space-y-4 pt-4">
                {activeDeliveries.map((order, index) => (
                  <DeliveryCard key={order.id} order={order} index={index} onAccelerate={() => accelerate(order.id)} />
                ))}
              </div>
            )}
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
              <section className="mt-4 w-full overflow-hidden rounded-[28px] bg-ink text-left text-white shadow-soft">
                <div className="p-5">
                  <div className="text-sm text-white/60">分享卡片</div>
                  <div className="mt-3 text-2xl font-semibold leading-tight">今晚我买了 {money(lastOrderAmount)}</div>
                  <div className="mt-4 rounded-[22px] bg-white/10 p-4">
                    <BoughtItems items={lastOrderItems} compact inverse />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-white/50">实际支付</div>
                      <div className="mt-1 text-3xl font-semibold">¥0</div>
                    </div>
                    <div className="text-right text-sm text-white/60">
                      睡前逛逛
                      <br />
                      Moon Cart
                    </div>
                  </div>
                  <button className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink" onClick={copyShareText}>
                    复制分享文案
                  </button>
                </div>
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
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">配送进度</span>
                <button className="rounded-full bg-black/5 px-3 py-2 text-sm font-semibold" onClick={() => setView("delivery")}>查看</button>
              </div>
              {activeDeliveries.length ? (
                <div className="hide-scrollbar flex gap-3 overflow-x-auto">
                  {activeDeliveries.map((order, index) => (
                    <button key={order.id} className="min-w-[220px] rounded-[22px] bg-black/[0.03] p-3 text-left" onClick={() => setView("delivery")}>
                      <div className="text-sm text-quiet">订单 {index + 1}</div>
                      <div className="mt-2 font-semibold">{deliverySteps[order.stepIndex]}</div>
                      <div className="mt-2 text-coral">{money(order.amount)}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-quiet">暂无配送中的虚拟订单。</p>
              )}
            </section>
            <section className="mt-4 rounded-[28px] bg-ink p-5 text-white shadow-soft">
              <div className="text-sm text-white/60">我的分享卡</div>
              <div className="mt-3 text-3xl font-semibold">{money(stats.virtualSpend)}</div>
              <div className="mt-1 text-sm text-white/60">累计虚拟消费 · 实际支付 ¥0</div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-lg font-semibold">{stats.happyCount}</div>
                  <div className="mt-1 text-xs text-white/50">快乐</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-lg font-semibold">{stats.streak}</div>
                  <div className="mt-1 text-xs text-white/50">连续</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="text-lg font-semibold">{stats.purchases?.length ?? 0}</div>
                  <div className="mt-1 text-xs text-white/50">买过</div>
                </div>
              </div>
              <button className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink" onClick={copyProfileShareText}>复制个人分享文案</button>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">心愿清单</span>
                <button className="rounded-full bg-black/5 px-3 py-2 text-sm font-semibold" onClick={() => setView("wish")}>管理</button>
              </div>
              {stats.wishlist?.length ? (
                <div className="flex flex-wrap gap-2">
                  {stats.wishlist.slice(0, 6).map((wish) => (
                    <span key={wish.id} className="rounded-full bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{wish.title}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-quiet">还没有心愿。找不到想买的东西时，可以先写进这里。</p>
              )}
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">给后台留言</div>
              <textarea
                className="min-h-24 w-full resize-none rounded-[20px] bg-black/[0.04] p-4 text-sm outline-none"
                placeholder="想要什么商品、想吐槽什么体验，都可以写在这里"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
              />
              <button className="mt-3 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white" onClick={submitMessage}>提交留言</button>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">本地后台</span>
                <button className="rounded-full bg-black/5 px-3 py-2 text-sm font-semibold" onClick={() => setView("admin")}>打开</button>
              </div>
              <p className="text-sm leading-6 text-quiet">先用本地数据看用户留言、心愿清单和虚拟订单记录。正式版再接数据库。</p>
            </section>
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

        {view === "wish" && (
          <Screen key="wish">
            <Header title="心愿清单" onBack={() => setView("mine")} />
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">想买但这里没有？</div>
              <input
                className="w-full rounded-[20px] bg-black/[0.04] px-4 py-4 text-sm outline-none"
                placeholder="比如：虚拟奶茶、虚拟旅行、某个品牌"
                value={wishInput}
                onChange={(event) => setWishInput(event.target.value)}
              />
              <button className="mt-3 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white" onClick={submitWish}>加入心愿清单</button>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">我的心愿</div>
              {stats.wishlist?.length ? (
                <div className="space-y-3">
                  {stats.wishlist.map((wish) => (
                    <div key={wish.id} className="flex items-center justify-between gap-3 rounded-[22px] bg-black/[0.03] p-3">
                      <div>
                        <div className="font-semibold">{wish.title}</div>
                        <div className="mt-1 text-xs text-quiet">{formatPurchaseDate(wish.createdAt)}</div>
                      </div>
                      <IconButton label="删除" onClick={() => removeFromWishlist(wish.id)}><Trash2 size={15} /></IconButton>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-quiet">还没有心愿。看到想买又没有的东西，就把它写下来。</p>
              )}
            </section>
          </Screen>
        )}

        {view === "admin" && (
          <Screen key="admin">
            <Header title="本地后台" onBack={() => setView("mine")} />
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">数据概览</span>
                <span className="text-xs text-quiet">LocalStorage</span>
              </div>
              <InfoRow label="心愿数量" value={`${stats.wishlist?.length ?? 0}`} />
              <InfoRow label="留言数量" value={`${stats.messages?.length ?? 0}`} />
              <InfoRow label="买过记录" value={`${stats.purchases?.length ?? 0}`} />
              <InfoRow label="累计虚拟消费" value={money(stats.virtualSpend)} tone="coral" />
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">用户心愿</div>
              {stats.wishlist?.length ? (
                <div className="space-y-2">
                  {stats.wishlist.map((wish) => (
                    <div key={wish.id} className="rounded-[20px] bg-black/[0.03] p-3">
                      <div className="font-semibold">{wish.title}</div>
                      <div className="mt-1 text-xs text-quiet">{formatPurchaseDate(wish.createdAt)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-quiet">暂无心愿。</p>
              )}
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">用户留言</div>
              {stats.messages?.length ? (
                <div className="space-y-2">
                  {stats.messages.map((message) => (
                    <div key={message.id} className="rounded-[20px] bg-black/[0.03] p-3">
                      <div className="leading-6">{message.content}</div>
                      <div className="mt-2 text-xs text-quiet">{formatPurchaseDate(message.createdAt)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-quiet">暂无留言。</p>
              )}
            </section>
          </Screen>
        )}
      </AnimatePresence>
      {["home", "list", "cart", "mine"].includes(view) && <TabBar view={view} setView={setView} cartCount={cartCount} />}
    </main>
  );
}

function CriticalStyles() {
  return (
    <style>{`
      .moon-app{box-sizing:border-box;min-height:100vh;width:100%;max-width:460px;margin:0 auto;padding:16px 16px 96px;background:#f8f8f6;color:#111;box-shadow:0 18px 45px rgba(17,17,17,.08);font-family:HarmonyOS Sans,Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .moon-app *{box-sizing:border-box}
      .moon-app button,.moon-app input,.moon-app textarea{font:inherit}
      .moon-app button{border:0;cursor:pointer;background:transparent;color:inherit;-webkit-tap-highlight-color:transparent}
      .moon-app .fixed{position:fixed}.moon-app .absolute{position:absolute}.moon-app .relative{position:relative}.moon-app .sticky{position:sticky}
      .moon-app .top-0{top:0}.moon-app .z-20{z-index:20}.moon-app .z-30{z-index:30}.moon-app .z-40{z-index:40}.moon-app .inset-x-0{left:0;right:0}.moon-app .bottom-0{bottom:0}.moon-app .bottom-3{bottom:12px}
      .moon-app .mx-auto{margin-left:auto;margin-right:auto}.moon-app .-mx-4{margin-left:-16px;margin-right:-16px}.moon-app .mb-3{margin-bottom:12px}.moon-app .mb-4{margin-bottom:16px}.moon-app .mb-8{margin-bottom:32px}.moon-app .mt-1{margin-top:4px}.moon-app .mt-2{margin-top:8px}.moon-app .mt-3{margin-top:12px}.moon-app .mt-4{margin-top:16px}.moon-app .mt-5{margin-top:20px}.moon-app .mt-6{margin-top:24px}.moon-app .mt-8{margin-top:32px}.moon-app .mt-10{margin-top:40px}
      .moon-app .block{display:block}.moon-app .flex{display:flex}.moon-app .grid{display:grid}.moon-app .hidden{display:none}.moon-app .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.moon-app .grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
      .moon-app .flex-col{flex-direction:column}.moon-app .flex-wrap{flex-wrap:wrap}.moon-app .items-center{align-items:center}.moon-app .items-start{align-items:flex-start}.moon-app .items-end{align-items:flex-end}.moon-app .justify-between{justify-content:space-between}.moon-app .justify-center{justify-content:center}.moon-app .justify-around{justify-content:space-around}
      .moon-app .gap-1{gap:4px}.moon-app .gap-2{gap:8px}.moon-app .gap-3{gap:12px}.moon-app .gap-4{gap:16px}.moon-app .space-y-2>*+*{margin-top:8px}.moon-app .space-y-3>*+*{margin-top:12px}.moon-app .space-y-4>*+*{margin-top:16px}
      .moon-app .min-h-screen{min-height:100vh}.moon-app .min-h-24{min-height:96px}.moon-app .min-h-28{min-height:112px}.moon-app .h-2{height:8px}.moon-app .h-4{height:16px}.moon-app .h-5{height:20px}.moon-app .h-8{height:32px}.moon-app .h-24{height:96px}.moon-app .h-44{height:176px}.moon-app .h-48{height:192px}.moon-app .h-80{height:320px}
      .moon-app .w-full{width:100%}.moon-app .w-5{width:20px}.moon-app .w-8{width:32px}.moon-app .w-11{width:44px}.moon-app .w-24{width:96px}.moon-app .max-w-xs{max-width:320px}.moon-app .max-w-\\[420px\\]{max-width:420px}.moon-app .max-w-\\[460px\\]{max-width:460px}.moon-app .min-w-0{min-width:0}.moon-app .min-w-20{min-width:80px}.moon-app .min-w-\\[220px\\]{min-width:220px}.moon-app .flex-1{flex:1 1 0%}.moon-app .shrink-0{flex-shrink:0}
      .moon-app .overflow-hidden{overflow:hidden}.moon-app .overflow-x-auto{overflow-x:auto}.moon-app .resize-none{resize:none}.moon-app .line-clamp-2{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}.moon-app .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.moon-app .whitespace-nowrap{white-space:nowrap}
      .moon-app .rounded-full{border-radius:9999px}.moon-app .rounded-2xl{border-radius:16px}.moon-app .rounded-\\[20px\\]{border-radius:20px}.moon-app .rounded-\\[22px\\]{border-radius:22px}.moon-app .rounded-\\[24px\\]{border-radius:24px}.moon-app .rounded-\\[26px\\]{border-radius:26px}.moon-app .rounded-\\[28px\\]{border-radius:28px}.moon-app .rounded-\\[32px\\]{border-radius:32px}
      .moon-app .bg-white{background:#fff}.moon-app .bg-ink{background:#111}.moon-app .bg-paper{background:#f8f8f6}.moon-app .bg-paper\\/90{background:rgba(248,248,246,.9)}.moon-app .bg-paper\\/95{background:rgba(248,248,246,.95)}.moon-app .bg-white\\/95{background:rgba(255,255,255,.95)}.moon-app .bg-white\\/45{background:rgba(255,255,255,.45)}.moon-app .bg-white\\/15{background:rgba(255,255,255,.15)}.moon-app .bg-white\\/10{background:rgba(255,255,255,.1)}.moon-app .bg-black\\/5{background:rgba(0,0,0,.05)}.moon-app .bg-black\\/\\[0\\.03\\]{background:rgba(0,0,0,.03)}.moon-app .bg-black\\/\\[0\\.04\\]{background:rgba(0,0,0,.04)}.moon-app .bg-coral{background:#ff6b6b}.moon-app .bg-coral\\/10{background:rgba(255,107,107,.1)}.moon-app .bg-mint\\/10{background:rgba(52,199,89,.1)}
      .moon-app .p-2{padding:8px}.moon-app .p-3{padding:12px}.moon-app .p-4{padding:16px}.moon-app .p-5{padding:20px}.moon-app .p-6{padding:24px}.moon-app .px-1{padding-left:4px;padding-right:4px}.moon-app .px-2{padding-left:8px;padding-right:8px}.moon-app .px-3{padding-left:12px;padding-right:12px}.moon-app .px-4{padding-left:16px;padding-right:16px}.moon-app .px-5{padding-left:20px;padding-right:20px}.moon-app .px-8{padding-left:32px;padding-right:32px}.moon-app .py-1{padding-top:4px;padding-bottom:4px}.moon-app .py-2{padding-top:8px;padding-bottom:8px}.moon-app .py-3{padding-top:12px;padding-bottom:12px}.moon-app .py-4{padding-top:16px;padding-bottom:16px}.moon-app .py-6{padding-top:24px;padding-bottom:24px}.moon-app .pb-2{padding-bottom:8px}.moon-app .pb-4{padding-bottom:16px}.moon-app .pb-24{padding-bottom:96px}.moon-app .pt-1{padding-top:4px}.moon-app .pt-4{padding-top:16px}.moon-app .pt-5{padding-top:20px}
      .moon-app .text-left{text-align:left}.moon-app .text-center{text-align:center}.moon-app .text-right{text-align:right}.moon-app .text-xs{font-size:12px;line-height:16px}.moon-app .text-sm{font-size:14px;line-height:20px}.moon-app .text-base{font-size:16px;line-height:24px}.moon-app .text-lg{font-size:18px;line-height:28px}.moon-app .text-xl{font-size:20px;line-height:28px}.moon-app .text-2xl{font-size:24px;line-height:32px}.moon-app .text-3xl{font-size:30px;line-height:36px}.moon-app .text-4xl{font-size:36px;line-height:40px}.moon-app .text-5xl{font-size:48px;line-height:1}.moon-app .text-6xl{font-size:60px;line-height:1}.moon-app .text-7xl{font-size:72px;line-height:1}.moon-app .text-8xl{font-size:96px;line-height:1}.moon-app .text-\\[44px\\]{font-size:44px}.moon-app .text-\\[10px\\]{font-size:10px}.moon-app .text-\\[11px\\]{font-size:11px}
      .moon-app .font-medium{font-weight:500}.moon-app .font-semibold{font-weight:600}.moon-app .leading-tight{line-height:1.25}.moon-app .leading-snug{line-height:1.375}.moon-app .leading-6{line-height:24px}.moon-app .leading-7{line-height:28px}.moon-app .leading-8{line-height:32px}.moon-app .leading-\\[1\\.08\\]{line-height:1.08}.moon-app .leading-none{line-height:1}.moon-app .tracking-normal{letter-spacing:0}
      .moon-app .text-ink{color:#111}.moon-app .text-quiet{color:#8e8e93}.moon-app .text-coral{color:#ff6b6b}.moon-app .text-mint{color:#34c759}.moon-app .text-white{color:#fff}.moon-app .text-white\\/50{color:rgba(255,255,255,.5)}.moon-app .text-white\\/60{color:rgba(255,255,255,.6)}
      .moon-app .shadow-soft{box-shadow:0 18px 45px rgba(17,17,17,.08)}.moon-app .backdrop-blur{backdrop-filter:blur(8px)}.moon-app .outline-none{outline:0}.moon-app .border-t{border-top:1px solid}.moon-app .border-black\\/5{border-color:rgba(0,0,0,.05)}
      .moon-app .masonry{column-count:2;column-gap:12px}.moon-app .masonry-item{break-inside:avoid;margin-bottom:12px}.moon-app .hide-scrollbar{scrollbar-width:none}.moon-app .hide-scrollbar::-webkit-scrollbar{display:none}
      .moon-app .bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-from,#ffe4e6),#fff,var(--tw-gradient-to,#ffedd5))}.moon-app .from-rose-100,.moon-app .from-amber-100,.moon-app .from-sky-100,.moon-app .from-violet-100,.moon-app .from-emerald-100,.moon-app .from-stone-100{--tw-gradient-from:#fce7e9}.moon-app .to-orange-100,.moon-app .to-lime-100,.moon-app .to-cyan-100,.moon-app .to-pink-100,.moon-app .to-teal-100,.moon-app .to-red-100{--tw-gradient-to:#fff1f2}
      @media (min-width:768px){.moon-app{margin-top:24px;margin-bottom:24px;min-height:860px;border-radius:28px}.moon-app .masonry{column-count:3}}
    `}</style>
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

function DeliveryTicker({ orders, onOpen }: { orders: DeliveryOrder[]; onOpen: () => void }) {
  if (!orders.length) return null;
  return (
    <div className="sticky top-0 z-40 -mx-4 mb-3 bg-paper/95 px-4 pb-2 pt-1 backdrop-blur">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto">
        {orders.map((order, index) => (
          <button key={order.id} className="flex min-w-[220px] items-center justify-between rounded-full bg-ink px-4 py-2 text-left text-white shadow-soft" onClick={onOpen}>
            <span className="min-w-0">
              <span className="block truncate text-xs text-white/50">订单 {index + 1} · {money(order.amount)}</span>
              <span className="block truncate text-sm font-semibold">{deliverySteps[order.stepIndex]}</span>
            </span>
            <span className="ml-3 shrink-0 rounded-full bg-white/15 px-2 py-1 text-xs">{Math.round(((order.stepIndex + 1) / deliverySteps.length) * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DeliveryCard({ order, index, onAccelerate }: { order: DeliveryOrder; index: number; onAccelerate: () => void }) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-soft">
      <div className="relative h-48 overflow-hidden bg-[linear-gradient(90deg,rgba(17,17,17,.04)_1px,transparent_1px),linear-gradient(rgba(17,17,17,.04)_1px,transparent_1px)] bg-[length:38px_38px]">
        <motion.div className="absolute bottom-10 left-6 h-2 rounded-full bg-coral" animate={{ width: `${Math.min(82, 10 + order.stepIndex * 7)}%` }} />
        <motion.div className="absolute bottom-5 text-4xl" animate={{ left: `${Math.min(78, 8 + order.stepIndex * 6.5)}%` }} transition={{ type: "spring", stiffness: 80, damping: 18 }}>
          🛵
        </motion.div>
        <div className="absolute left-6 top-8 rounded-[22px] bg-coral/10 p-4 text-3xl">🛍</div>
        <div className="absolute right-6 top-8 rounded-[22px] bg-mint/10 p-4 text-3xl">🏠</div>
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-quiet">订单 {index + 1}</span>
          <span className="rounded-full bg-coral/10 px-3 py-1 text-sm font-semibold text-coral">{Math.round(((order.stepIndex + 1) / deliverySteps.length) * 100)}%</span>
        </div>
        <h2 className="text-2xl font-semibold">{deliverySteps[order.stepIndex]}</h2>
        <div className="mt-3 text-sm text-quiet">{order.items.map((item) => item.title).join("、")}</div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-semibold">{money(order.amount)}</span>
          <button className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white" onClick={onAccelerate}>加速配送</button>
        </div>
      </div>
    </section>
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

function BoughtItems({ items, compact = false, inverse = false }: { items: CartItem[]; compact?: boolean; inverse?: boolean }) {
  if (!items.length) {
    return <p className={`text-sm ${inverse ? "text-white/60" : "text-quiet"}`}>这次是直接奖励自己，没有留下具体清单。</p>;
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
