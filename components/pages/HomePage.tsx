"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Luggage,
  Gem,
  Shirt,
  BadgeCheck,
  Laptop,
  WashingMachine,
  Smartphone,
  Sparkles,
  Utensils,
  Home,
  Heart,
  Coffee,
  Car,
  Flower2,
  BriefcaseBusiness,
  Dumbbell,
  Store,
  Gift,
  Baby,
  Beef,
  ShoppingBag,
} from "lucide-react";
import type { Product } from "@/data/products";
import { products } from "@/data/products";
import { money } from "@/utils/format";
import { Screen } from "@/components/common/Screen";
import { ProductCard } from "@/components/product/ProductCard";

const HOME_CATEGORIES: Array<{ icon: LucideIcon; label: string; category?: string; keyword?: string }> = [
  { icon: Luggage, label: "箱包", category: "鞋服", keyword: "包|箱|背包|钱包" },
  { icon: Gem, label: "美妆护肤", category: "美妆" },
  { icon: Shirt, label: "女装", category: "鞋服", keyword: "裙|女装|上衣|毛衣|卫衣" },
  { icon: BadgeCheck, label: "黄金珠宝", category: "鞋服", keyword: "黄金|珠宝|项链|戒指|钻" },
  { icon: Laptop, label: "数码", category: "数码" },
  { icon: WashingMachine, label: "家电", category: "家电" },
  { icon: Smartphone, label: "手机", category: "数码", keyword: "手机|iPhone|华为|小米|OPPO|vivo" },
  { icon: Sparkles, label: "个护清洁", category: "美妆", keyword: "洗面|洗发|沐浴|牙膏|纸巾|清洁" },
  { icon: Utensils, label: "厨具", category: "生活用品", keyword: "锅|碗|刀|铲|烤|烘焙|餐具" },
  { icon: Home, label: "家居", category: "生活用品", keyword: "床|枕|被|垫|毯|收纳|家具|灯" },
  { icon: Heart, label: "医疗保健", category: "生活用品", keyword: "保健|按摩|理疗|体温|血压" },
  { icon: Coffee, label: "食品酒饮", category: "零食" },
  { icon: Car, label: "汽摩生活", category: "生活用品", keyword: "车|汽|摩托|车载" },
  { icon: Gem, label: "奢侈品", category: "鞋服", keyword: "LV|古驰|香奈儿|爱马仕|Gucci|奢侈品" },
  { icon: Flower2, label: "宠物鲜花", category: "生活用品", keyword: "宠物|猫|狗|鲜花|花" },
  { icon: BriefcaseBusiness, label: "文具", category: "数码", keyword: "笔|本|文具|书|阅读" },
  { icon: Dumbbell, label: "运动户外", category: "鞋服", keyword: "运动|健身|跑步|瑜伽|户外|登山" },
  { icon: Store, label: "工业品", category: "生活用品", keyword: "工具|五金|螺丝|工业" },
  { icon: Gift, label: "玩具乐器", category: "数码", keyword: "玩具|乐高|吉他|钢琴|乐器|模型" },
  { icon: Laptop, label: "电脑办公", category: "数码", keyword: "电脑|笔记本|键盘|鼠标|显示器|办公" },
  { icon: Baby, label: "母婴童装", category: "鞋服", keyword: "婴儿|童装|奶粉|纸尿裤|宝宝" },
  { icon: Shirt, label: "男装", category: "鞋服", keyword: "男装|衬衫|夹克|西装|男" },
  { icon: Flower2, label: "农资园艺", category: "水果", keyword: "种子|花盆|园艺|农" },
  { icon: Beef, label: "生鲜", category: "水果" },
  { icon: ShoppingBag, label: "鞋靴", category: "鞋服", keyword: "鞋|靴|拖鞋|运动鞋" },
];

const HOME_CATEGORY_ROW_HEIGHT = 76;
const HOME_CATEGORY_ROW_GAP = 12;
const HOME_CATEGORY_COLLAPSED_HEIGHT = HOME_CATEGORY_ROW_HEIGHT;
const HOME_CATEGORY_EXPANDED_HEIGHT =
  HOME_CATEGORY_ROW_HEIGHT * 5 + HOME_CATEGORY_ROW_GAP * 4;

const channelCategories: Record<"index" | "takeout" | "travel", string[]> = {
  index: [
    "鞋服", "美妆", "数码", "家电", "生活用品", "零食", "水果",
  ],
  takeout: ["外卖", "水果", "零食", "饮料"],
  travel: ["旅行"],
};

export interface HomePageProps {
  onOpenCategory: (
    category?: string,
    channel?: "index" | "takeout" | "travel",
    keyword?: string,
    title?: string,
    subCategory?: string,
  ) => void;
  onOpenProduct: (product: Product) => void;
  onOpenRecommend: () => void;
  onOpenTakeoutShops: (subCategory?: string) => void;
  onOpenTakeoutShop: (shopName: string) => void;
  onOpenFlight: () => void;
  onQuickAdd: (product: Product) => void;
  addToCart: (product: Product) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  blindBoxCanOpen: boolean;
  blindBoxOpening: boolean;
  onOpenBlindBox: () => void;
}

export function HomePage({
  onOpenCategory,
  onOpenProduct,
  onOpenRecommend,
  onOpenTakeoutShops,
  onOpenTakeoutShop,
  onOpenFlight,
  onQuickAdd,
  addToCart,
  toggleFavorite,
  isFavorite,
  blindBoxCanOpen,
  blindBoxOpening,
  onOpenBlindBox,
}: HomePageProps) {
  const [homeTab, setHomeTab] = useState<"index" | "takeout" | "travel">("index");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryExpanded) return;
    requestAnimationFrame(() => {
      categoryScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    });
  }, [categoryExpanded]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      onOpenCategory(undefined, homeTab, searchQuery.trim(), "搜索结果");
    }
  }, [searchQuery, homeTab, onOpenCategory]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    onOpenCategory(undefined, homeTab, "", "全部商品");
  }, [homeTab, onOpenCategory]);

  return (
    <Screen key="home">
      <section className="pb-4">
        <div className="sticky top-0 z-20 -mx-4 bg-paper px-4 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="text-sm font-semibold">睡前逛逛</div>
                <div className="text-[10px] text-quiet">Moon Cart</div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-0.5 rounded-full bg-black/[0.05] p-1">
              <button
                onClick={() => setHomeTab("index")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  homeTab === "index"
                    ? "bg-white text-ink shadow-sm"
                    : "text-quiet"
                }`}
              >
                首页
              </button>
              <button
                onClick={() => setHomeTab("takeout")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  homeTab === "takeout"
                    ? "bg-white text-ink shadow-sm"
                    : "text-quiet"
                }`}
              >
                外卖
              </button>
              <button
                onClick={() => setHomeTab("travel")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  homeTab === "travel"
                    ? "bg-white text-ink shadow-sm"
                    : "text-quiet"
                }`}
              >
                旅游
              </button>
            </div>
          </div>
          <div className="mt-3 flex min-h-[48px] items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
            <Search size={16} className="text-quiet" />
            <input
              type="text"
              maxLength={50}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearch();
                }
              }}
              placeholder={homeTab === "takeout" ? "搜索美食、店铺" : homeTab === "travel" ? "搜索酒店、景点、机票" : "今天想买点什么..."}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet text-ink"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="text-quiet hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={handleSearch}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
              >
                搜索
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {(homeTab === "takeout"
            ? [
                { emoji: "🍜", text: "满30减10", bg: "from-amber-500 to-orange-600" },
                { emoji: "🥤", text: "奶茶第二杯半价", bg: "from-emerald-500 to-teal-500" },
                { emoji: "🍱", text: "新人专享0元", bg: "from-lime-500 to-emerald-600" },
                { emoji: "⚡", text: "闪送30分钟达", bg: "from-cyan-500 to-teal-600" },
              ]
            : homeTab === "travel"
            ? [
                { emoji: "✈️", text: "机票买一送一", bg: "from-teal-500 to-cyan-600" },
                { emoji: "🏨", text: "酒店5折起", bg: "from-emerald-500 to-teal-600" },
                { emoji: "🎫", text: "门票特惠", bg: "from-emerald-500 to-teal-600" },
                { emoji: "🗺️", text: "跟团游立减500", bg: "from-orange-500 to-amber-600" },
              ]
            : [
                { emoji: "🎊", text: "限时特价", bg: "from-emerald-500 to-teal-600" },
                { emoji: "✨", text: "新人专享", bg: "from-amber-500 to-orange-600" },
                { emoji: "🎁", text: "每日盲盒", bg: "from-lime-500 to-emerald-600" },
                { emoji: "🔥", text: "热销榜单", bg: "from-orange-500 to-amber-600" },
              ]
          ).map((banner, i) => (
            <div
              key={i}
              className={`shrink-0 w-[70%] h-28 rounded-[24px] bg-gradient-to-r ${banner.bg} p-5 flex items-center justify-between text-white shadow-[0_18px_44px_rgba(0,0,0,0.24)] ring-1 ring-white/15`}
            >
              <div>
                <div className="text-xl font-bold">{banner.text}</div>
                <div className="mt-1 text-xs opacity-80">点击查看详情</div>
              </div>
              <div className="text-5xl">{banner.emoji}</div>
            </div>
          ))}
        </div>

        {homeTab === "index" ? (
          <div className="relative mt-4">
            <div
              className="hide-scrollbar"
              style={{
                overflowX: "auto",
                overflowY: "hidden",
                height: categoryExpanded
                  ? `${HOME_CATEGORY_EXPANDED_HEIGHT}px`
                  : `${HOME_CATEGORY_COLLAPSED_HEIGHT}px`,
                transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                setTouchStartX(touch.clientX);
                setTouchStartY(touch.clientY);
              }}
              onTouchEnd={(e) => {
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
                  setCategoryExpanded(true);
                }
                if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
                  setCategoryExpanded(false);
                }
              }}
              onPointerDown={(e) => {
                setTouchStartX(e.clientX);
                setTouchStartY(e.clientY);
              }}
              onPointerUp={(e) => {
                const deltaX = e.clientX - touchStartX;
                const deltaY = e.clientY - touchStartY;
                if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
                  setCategoryExpanded(true);
                }
                if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
                  setCategoryExpanded(false);
                }
              }}
            >
              <div className="grid grid-cols-5 gap-x-2 gap-y-4">
                {HOME_CATEGORIES.map((item) => {
                  const CategoryIcon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="flex min-h-[68px] flex-col items-center gap-1.5 active:scale-95 transition-transform"
                      onClick={() =>
                        onOpenCategory(item.category, homeTab, undefined, item.label, item.label)
                      }
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-soft">
                        <CategoryIcon size={22} strokeWidth={2} />
                      </div>
                      <span className="text-[11px] text-ink font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center">
              <button
                type="button"
                className="h-1.5 w-16 rounded-full overflow-hidden bg-gray-100"
                onClick={() => setCategoryExpanded((v) => !v)}
                aria-label="展开或收起分类"
              >
                <span
                  className="block h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: categoryExpanded ? "100%" : "20%",
                  }}
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {(homeTab === "takeout"
              ? [
                  { icon: "🍔", label: "快餐便当", category: "外卖", subCategory: "快餐便当" },
                  { icon: "🧋", label: "奶茶饮品", category: "外卖", subCategory: "奶茶饮品" },
                  { icon: "🍢", label: "烧烤炸串", category: "外卖", subCategory: "烧烤炸串" },
                  { icon: "🍰", label: "蛋糕甜点", category: "外卖", subCategory: "蛋糕甜点" },
                  { icon: "🍜", label: "面食粥品", category: "外卖", subCategory: "面食粥品" },
                  { icon: "🍣", label: "日料寿司", category: "外卖", subCategory: "日料寿司" },
                  { icon: "🍕", label: "披萨意面", category: "外卖", subCategory: "披萨意面" },
                  { icon: "🥡", label: "中式正餐", category: "外卖", subCategory: "中式正餐" },
                  { icon: "🍟", label: "西式快餐", category: "外卖", subCategory: "西式快餐" },
                  { icon: "🛍", label: "全部", category: undefined, keyword: "" },
                ]
              : [
                  { icon: "✈️", label: "机票", action: "flight" },
                  { icon: "🏨", label: "酒店", category: "旅行", keyword: "酒店|住宿|房|民宿|客栈" },
                  { icon: "🎫", label: "门票", category: "旅行", keyword: "门票|票|园|故宫|迪士尼|影城|长隆|野生动物|冰雪" },
                  { icon: "🚌", label: "跟团游", category: "旅行", keyword: "跟团|一日游|游|朝圣|深度" },
                  { icon: "🚗", label: "租车", category: "旅行", keyword: "租车|自驾|车" },
                  { icon: "🏖️", label: "度假", category: "旅行", keyword: "度假|海岛|海滩|海景|三亚|马尔代夫|亚特兰蒂斯|巴厘" },
                  { icon: "🏔️", label: "周边游", category: "旅行", keyword: "周边|西湖|长城|慕田峪|古镇|苏州|南京|园林|中山" },
                  { icon: "🎢", label: "游乐园", category: "旅行", keyword: "迪士尼|影城|游乐园|乐园|长隆|野生动物|欢乐谷" },
                  { icon: "⛺", label: "露营", category: "旅行", keyword: "露营|帐篷|营地|草原" },
                  { icon: "🛍", label: "全部", category: undefined, keyword: "" },
                ]
            ).map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1.5 p-2 active:scale-95 transition-transform"
                onClick={() => {
                  const i = item as { action?: string; category?: string; keyword?: string; label?: string; subCategory?: string };
                  if (i.action === "flight") {
                    onOpenFlight();
                  } else if (homeTab === "takeout") {
                    onOpenTakeoutShops(i.subCategory);
                  } else {
                    onOpenCategory(i.category, homeTab, i.keyword, i.label, i.subCategory);
                  }
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-soft">
                  {item.icon}
                </div>
                <span className="text-[11px] text-ink">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {homeTab === "index" && (
          <>
            <div className="mt-5 mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">🎁 今晚盲盒</h2>
              <span className="text-xs text-quiet">
                {blindBoxCanOpen ? "每天一次" : "明天再来"}
              </span>
            </div>
            <button
              disabled={!blindBoxCanOpen || blindBoxOpening}
              onClick={() => onOpenBlindBox()}
              className={`w-full rounded-[24px] p-5 text-left transition-all shadow-soft ${
                blindBoxCanOpen
                  ? "bg-white active:scale-[0.98]"
                  : "bg-white/60 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-20 w-20 shrink-0 rounded-[20px] flex items-center justify-center text-5xl ${
                  blindBoxCanOpen
                    ? "bg-primary/10"
                    : "bg-black/[0.03]"
                }`}>
                  {blindBoxCanOpen ? "🎁" : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-ink">神秘惊喜盲盒</div>
                  <div className="mt-1 text-xs text-quiet">
                    {blindBoxCanOpen ? "点我开启今日惊喜" : "明天再来开启新的惊喜"}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                      1000+款惊喜
                    </span>
                    <span className="inline-block rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-quiet">
                      {blindBoxCanOpen ? "今日可开" : "明日再来"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </>
        )}

        <div className={`${homeTab === "index" ? "mt-6" : "mt-5"} mb-3 flex items-center justify-between`}>
          <h2 className="text-lg font-semibold">
            {homeTab === "takeout" ? "🍜 附近热销" : homeTab === "travel" ? "🏖️ 热门目的地" : "💰 今日特惠"}
          </h2>
          <span className="text-xs text-quiet">
            {homeTab === "takeout" ? "30分钟送达" : homeTab === "travel" ? "超值低价" : "低至5折"}
          </span>
        </div>
        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {(() => {
            const raw = products.filter((p) =>
              homeTab === "takeout"
                ? p.category === "外卖" && p.shop
                : homeTab === "travel"
                ? p.category === "旅行"
                : p.category !== "盲盒"
            );
            if (homeTab === "takeout") {
              const seen = new Set<string>();
              const deduped: Product[] = [];
              for (const p of raw) {
                if (p.shop && !seen.has(p.shop)) {
                  seen.add(p.shop);
                  deduped.push(p);
                }
              }
              return deduped.slice(0, 15).map((product) => (
                <div
                  key={product.id}
                  className="shrink-0 w-36 relative"
                >
                  <button
                    className="w-full rounded-[20px] bg-white p-2 text-left shadow-soft active:scale-[0.98] transition-transform"
                    onClick={() => onOpenTakeoutShop(product.shop!)}
                  >
                    <div className="relative flex h-32 w-full items-center justify-center rounded-[16px] bg-black/[0.03] text-6xl">
                      {product.emoji}
                      <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-white">
                        {product.shop}
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="line-clamp-1 text-sm font-medium">
                        {product.title.split("·").slice(1).join("·") || product.title}
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-base font-semibold text-price">
                          {money(product.price)}
                        </span>
                        <span className="text-[10px] text-quiet line-through">
                          {money(product.price * 1.8)}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-quiet">
                        ⏱ 约30分钟
                      </div>
                    </div>
                  </button>
                  <button
                    className="absolute bottom-2 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md transition-transform active:scale-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(product);
                    }}
                  >
                    <ShoppingCart size={14} className="text-white" />
                  </button>
                </div>
              ));
            }
            return raw
              .slice(
                homeTab === "travel" ? 0 : 10,
                homeTab === "travel" ? 10 : 20
              )
              .map((product) => (
                <div
                  key={product.id}
                  className="shrink-0 w-36 relative"
                >
                  <button
                    className="w-full rounded-[20px] bg-white p-2 text-left shadow-soft active:scale-[0.98] transition-transform"
                    onClick={() => onOpenProduct(product)}
                  >
                    <div className="flex h-32 w-full items-center justify-center rounded-[16px] bg-black/[0.03] text-6xl">
                      {product.emoji}
                    </div>
                    <div className="p-2">
                      <div className="line-clamp-1 text-sm font-medium">
                        {product.title}
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-base font-semibold text-price">
                          {money(product.price)}
                        </span>
                        <span className="text-[10px] text-quiet line-through">
                          {money(product.price * 1.8)}
                        </span>
                      </div>
                      {homeTab === "travel" && (
                        <div className="mt-1 text-[10px] text-quiet">
                          ⭐ 4.8分 已售2.3k
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    className="absolute bottom-2 right-3 z-10 h-8 w-8 rounded-full bg-primary shadow-md flex items-center justify-center active:scale-90 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(product);
                    }}
                  >
                    <ShoppingCart size={14} className="text-white" />
                  </button>
                </div>
              ));
          })()}
        </div>

        <div className="mt-6 mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {homeTab === "takeout" ? "⭐ 为你推荐" : homeTab === "travel" ? "🎫 精选推荐" : "❤️ 猜你喜欢"}
          </h2>
          <button
            className="text-xs text-quiet"
            onClick={() => onOpenRecommend()}
          >
            更多
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products
            .filter((p) =>
              homeTab === "takeout"
                ? p.category === "外卖" && p.shop
                : homeTab === "travel"
                ? p.category === "旅行"
                : channelCategories["index"].includes(p.category)
            )
            .slice(
              homeTab === "takeout" || homeTab === "travel" ? 10 : 0,
              homeTab === "takeout" || homeTab === "travel" ? 20 : 10
            )
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onOpenProduct(product)}
                onToggleFavorite={() => toggleFavorite(product)}
                isFavorite={isFavorite(product.id)}
                onAddToCart={() => addToCart(product)}
                onQuickAdd={(p) => onQuickAdd(p)}
              />
            ))}
        </div>
      </section>
    </Screen>
  );
}
