"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Baby,
  BadgeCheck,
  Beef,
  BriefcaseBusiness,
  Car,
  ChevronDown,
  ChevronRight,
  Coffee,
  Dumbbell,
  Flower2,
  Gem,
  Gift,
  Heart,
  Home,
  Hotel,
  Laptop,
  Luggage,
  Minus,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Ticket,
  Trash2,
  Utensils,
  UserRound,
  WashingMachine,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  categories,
  pickProducts,
  products,
  type Product,
} from "@/data/products";
import type { View } from "@/types";
import { money, shortMoney, formatPurchaseDate } from "@/utils/format";
import { getMemberLevel, getNextLevel, MEMBER_LEVELS, type MemberLevel } from "@/utils/member";
import { fuzzySearch } from "@/utils/search";
import {
  getDeliverySteps,
  calculateSpecPrice,
  getChannelFromItems,
  validateTravelSpecs,
  calculateTravelCountdown,
  parseLocalDate,
  type DeliveryOrder,
} from "@/utils/order";

import { Screen } from "@/components/common/Screen";
import { Header } from "@/components/common/Header";
import { TabBar } from "@/components/common/TabBar";
import { IconButton } from "@/components/common/IconButton";
import { StatCard } from "@/components/common/StatCard";
import { EmptyCart } from "@/components/common/EmptyCart";
import { Centered } from "@/components/common/Centered";
import { InfoRow } from "@/components/common/InfoRow";

import { ProductVisual } from "@/components/product/ProductVisual";
import { ProductCard } from "@/components/product/ProductCard";
import { CartButton } from "@/components/product/CartButton";

import { BoughtItems } from "@/components/order/BoughtItems";
import { OrderCard } from "@/components/order/OrderCard";
import { OrderPanel } from "@/components/order/OrderPanel";
import { DeliveryTicker } from "@/components/order/DeliveryTicker";
import { DeliveryCard } from "@/components/order/DeliveryCard";

const channelCategories: Record<"index" | "takeout" | "travel", string[]> = {
  index: categories.filter((c) => c !== "盲盒" && c !== "外卖" && c !== "水果" && c !== "零食" && c !== "饮料" && c !== "旅行"),
  takeout: ["外卖", "水果", "零食", "饮料"],
  travel: ["旅行"],
};

// 首页电商分类入口（25个，横向滚动，默认显示5个）
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

// 子分类（与首页快捷入口完全一致，确保 tab 栏显示与点击入口一致）
const subCategoriesByChannel: Record<
  "index" | "takeout" | "travel",
  Array<{ label: string; category?: string; keyword?: string; subCategory?: string }>
> = {
  index: HOME_CATEGORIES.map((c) => ({ label: c.label, category: c.category, keyword: c.keyword })),
  takeout: [
    { label: "快餐便当", category: "外卖", subCategory: "快餐便当" },
    { label: "奶茶饮品", category: "外卖", subCategory: "奶茶饮品" },
    { label: "烧烤炸串", category: "外卖", subCategory: "烧烤炸串" },
    { label: "蛋糕甜点", category: "外卖", subCategory: "蛋糕甜点" },
    { label: "面食粥品", category: "外卖", subCategory: "面食粥品" },
    { label: "日料寿司", category: "外卖", subCategory: "日料寿司" },
    { label: "披萨意面", category: "外卖", subCategory: "披萨意面" },
    { label: "中式正餐", category: "外卖", subCategory: "中式正餐" },
    { label: "西式快餐", category: "外卖", subCategory: "西式快餐" },
  ],
  travel: [
    { label: "酒店", category: "旅行", keyword: "酒店|住宿|房|民宿|客栈" },
    { label: "门票", category: "旅行", keyword: "门票|通票|套票|船票|游船|故宫|迪士尼|影城|长隆|野生动物|冰雪|动物园|乐园" },
    { label: "跟团游", category: "旅行", keyword: "跟团|一日游|朝圣|深度游|周边游|亲子游" },
    { label: "租车", category: "旅行", keyword: "租车|自驾" },
    { label: "度假", category: "旅行", keyword: "度假|马尔代夫|亚特兰蒂斯|巴厘岛度假" },
    { label: "周边游", category: "旅行", keyword: "周边|西湖|长城|慕田峪|古镇|苏州|南京|园林|中山" },
    { label: "游乐园", category: "旅行", keyword: "迪士尼|影城|游乐园|乐园|长隆|野生动物|欢乐谷" },
    { label: "露营", category: "旅行", keyword: "露营|帐篷|营地|草原" },
  ],
};
import { type CartItem, type PurchaseRecord, useShopStore, BADGES, BADGE_CATEGORIES, type BadgeCategory } from "@/store/useShopStore";
// qrcode 仅在生成分享卡时用到（每次点击才加载），从首屏 bundle 中剔除以减少 ~80KB
type QRCodeModule = typeof import("qrcode");
let qrCodeModulePromise: Promise<QRCodeModule> | null = null;
const getQRCode = () => {
  if (!qrCodeModulePromise) qrCodeModulePromise = import("qrcode");
  return qrCodeModulePromise;
};

const categoryShortcuts = [
  { label: "想吃点好的", icon: "🍔", category: "外卖" },
  { label: "数码科技", icon: "📱", category: "数码" },
  { label: "潮流鞋服", icon: "👟", category: "鞋服" },
  { label: "美妆护肤", icon: "💄", category: "美妆" },
  { label: "随便逛逛", icon: "🛍", category: undefined },
  { label: "我的已下单", icon: "❤️", category: "cart" },
];

const zodiacSigns = [
  { name: "白羊座", emoji: "♈" },
  { name: "金牛座", emoji: "♉" },
  { name: "双子座", emoji: "♊" },
  { name: "巨蟹座", emoji: "♋" },
  { name: "狮子座", emoji: "♌" },
  { name: "处女座", emoji: "♍" },
  { name: "天秤座", emoji: "♎" },
  { name: "天蝎座", emoji: "♏" },
  { name: "射手座", emoji: "♐" },
  { name: "摩羯座", emoji: "♑" },
  { name: "水瓶座", emoji: "♒" },
  { name: "双鱼座", emoji: "♓" },
];

const chineseZodiac = [
  { name: "鼠", emoji: "🐭" },
  { name: "牛", emoji: "🐮" },
  { name: "虎", emoji: "🐯" },
  { name: "兔", emoji: "🐰" },
  { name: "龙", emoji: "🐲" },
  { name: "蛇", emoji: "🐍" },
  { name: "马", emoji: "🐴" },
  { name: "羊", emoji: "🐑" },
  { name: "猴", emoji: "🐵" },
  { name: "鸡", emoji: "🐔" },
  { name: "狗", emoji: "🐶" },
  { name: "猪", emoji: "🐷" },
];

// 航班相关数据（FLIGHT_CITY_DATA / DOMESTIC_AIRLINES / INTERNATIONAL_AIRLINES）
// 与搜索逻辑 searchFlights 已抽到 lib/flights.ts，仅在机票视图按需动态加载
type FlightsModule = typeof import("@/lib/flights");
let flightsModulePromise: Promise<FlightsModule> | null = null;
const getFlightsModule = (): Promise<FlightsModule> => {
  if (!flightsModulePromise) flightsModulePromise = import("@/lib/flights");
  return flightsModulePromise;
};
type FlightResult = Awaited<ReturnType<FlightsModule["searchFlights"]>>[number];

// 盲盒 1000+ 商品数据已抽到 data/blindBoxItems.ts，仅当用户点击盲盒时按需加载
// 避免首屏 bundle 携带 416 行生成逻辑与 1000 项数据
type BlindBoxModule = typeof import("@/data/blindBoxItems");
let blindBoxModulePromise: Promise<BlindBoxModule> | null = null;
const getBlindBoxModule = (): Promise<BlindBoxModule> => {
  if (!blindBoxModulePromise) blindBoxModulePromise = import("@/data/blindBoxItems");
  return blindBoxModulePromise;
};

export default function MoonCartApp() {
  const [view, setView] = useState<View>("home");
  const [prevView, setPrevView] = useState<View>("home");
  const [homeTab, setHomeTab] = useState<"index" | "takeout" | "travel">("index");
  const [listChannel, setListChannel] = useState<"index" | "takeout" | "travel">("index");
  const [categoryChannel, setCategoryChannel] = useState<"index" | "takeout" | "travel">("index");
  const [subKeyword, setSubKeyword] = useState("");
  const [listTitle, setListTitle] = useState<string>("");
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const categorySwipeRef = useRef({ x: 0, y: 0, moved: false, swipedAt: 0 });
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const listTabScrollRef = useRef<HTMLDivElement>(null);

  // 滚动 list 页 tab 栏到选中的子分类（居中显示）
  const scrollListTabToCenter = useCallback(() => {
    const container = listTabScrollRef.current as HTMLDivElement | null;
    if (!container) return;
    const buttons = Array.from(
      container.querySelectorAll<HTMLElement>("button[data-label]")
    );
    const target = buttons.find((b) => b.dataset.label === listTitle);
    if (target) {
      const scrollLeft =
        target.offsetLeft - container.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "auto",
      });
    }
  }, [listTitle]);

  // list 页面 tab 栏容器挂载时立即滚动（无延迟）
  const listTabScrollCallback = useCallback(
    (node: HTMLDivElement | null) => {
      (listTabScrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (node) {
        // 等 React 完成 DOM 插入后再滚动
        requestAnimationFrame(() => scrollListTabToCenter());
      }
    },
    [scrollListTabToCenter]
  );

  // list 页面内切换 tab 时立即滚动
  useEffect(() => {
    if (view !== "list") return;
    scrollListTabToCenter();
  }, [view, listTitle, listChannel, scrollListTabToCenter]);

  useEffect(() => {
    if (categoryExpanded) return;
    requestAnimationFrame(() => {
      categoryScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    });
  }, [categoryExpanded]);

  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    string | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [productQuantity, setProductQuantity] = useState(1);
  const getTravelNights = (product: Product, specs: Record<string, string>) => {
    const title = product.title;
    const isHotel = /酒店|民宿|住宿|客栈|房/.test(title);
    const isRental = /租车|自驾/.test(title);
    if (!isHotel && !isRental) return 1;
    const startKey = isHotel ? "入住日期" : "取车日期";
    const endKey = isHotel ? "退房日期" : "还车日期";
    const start = specs[startKey];
    const end = specs[endKey];
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
    return Math.max(1, diff);
  };
  const getTravelPersonCount = (specs: Record<string, string>) => {
    const adults = Number(specs["成人"] ?? 1);
    const children = Number(specs["儿童"] ?? 0);
    return Math.max(1, adults + children);
  };
  const isHotelProduct = (title: string) => /酒店|民宿|住宿|客栈|房/.test(title);
  const isRentalProduct = (title: string) => /租车|自驾/.test(title);
  const isTicketProduct = (title: string) => /机票|门票|通票|套票|船票|游船|影城|迪士尼|欢乐谷|乐园/.test(title);
  const isPerPersonProduct = (title: string) => {
    if (isHotelProduct(title) || isRentalProduct(title) || isTicketProduct(title)) return false;
    return true;
  };
  const calculateRentalInfo = (dailyRate: number, specs: Record<string, string>) => {
    const startDate = specs["取车日期"];
    const endDate = specs["还车日期"];
    const startTime = specs["取车时间"] ?? "10:00";
    const endTime = specs["还车时间"] ?? "10:00";
    if (!startDate || !endDate) {
      return { days: 1, overtimeHours: 0, overtimeFee: 0, totalDays: 1, totalPrice: dailyRate, extraDays: 0 };
    }
    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);
    const totalHours = Math.max(0, (end.getTime() - start.getTime()) / 3600000);
    const fullDays = Math.floor(totalHours / 24);
    const overtimeHours = totalHours - fullDays * 24;
    const hourlyRate = (dailyRate / 24) * 1.2;
    let overtimeFee = 0;
    let extraDays = 0;
    if (overtimeHours > 1 && overtimeHours <= 4) {
      overtimeFee = Math.ceil(overtimeHours) * hourlyRate;
    } else if (overtimeHours > 4) {
      extraDays = 1;
    }
    const totalDays = Math.max(1, fullDays + extraDays);
    const totalPrice = totalDays * dailyRate + overtimeFee;
    return { days: fullDays, overtimeHours, overtimeFee, totalDays, totalPrice, extraDays };
  };
  const getTravelUnitPrice = (product: Product, specs: Record<string, string>) => {
    const title = product.title;
    const specPrice = calculateSpecPrice(product, specs);
    if (isRentalProduct(title)) {
      const info = calculateRentalInfo(specPrice, specs);
      return info.totalPrice;
    }
    if (isHotelProduct(title)) {
      return specPrice * getTravelNights(product, specs);
    }
    return specPrice;
  };
  const [lastOrderAmount, setLastOrderAmount] = useState(428);
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([]);
  const deliveryTimerRef = useRef<number | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryOrder[]>([]);
  const [viewedTravelOrders, setViewedTravelOrders] = useState<Set<string>>(new Set());
  const [wishInput, setWishInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [ordersTab, setOrdersTab] = useState<"all" | "delivery" | "takeout" | "travel">("all");
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [editingSpecs, setEditingSpecs] = useState<Record<string, string>>({});
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [quickAddSpecs, setQuickAddSpecs] = useState<Record<string, string>>({});
  const [couponAddProduct, setCouponAddProduct] = useState<Product | null>(null);
  const [couponAddSpecs, setCouponAddSpecs] = useState<Record<string, string>>({});
  const [couponAddQuantity, setCouponAddQuantity] = useState(1);
  const [specHint, setSpecHint] = useState("");
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [flightTripType, setFlightTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [flightFrom, setFlightFrom] = useState("北京");
  const [flightTo, setFlightTo] = useState("上海");
  const [flightDate, setFlightDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [flightReturnDate, setFlightReturnDate] = useState("");
  const [flightCabin, setFlightCabin] = useState<"economy" | "business" | "first">("economy");
  const [flightAdults, setFlightAdults] = useState(1);
  const [flightChildren, setFlightChildren] = useState(0);
  const [flightCityPicker, setFlightCityPicker] = useState<null | "from" | "to">(null);
  const [flightCityTab, setFlightCityTab] = useState<"domestic" | "international">("domestic");
  const [flightCityKeyword, setFlightCityKeyword] = useState("");
  const [flightResults, setFlightResults] = useState<null | FlightResult[]>(null);
  const [flightSearching, setFlightSearching] = useState(false);
  const [flightSortBy, setFlightSortBy] = useState<"price" | "time" | "duration">("price");
  const [selectedFlight, setSelectedFlight] = useState<null | FlightResult>(null);
  // 城市数据进入 flight 视图后异步加载，避免首屏携带 200+ 城市数据
  const [flightCityData, setFlightCityData] = useState<Record<"domestic" | "international", Array<{ code: string; name: string; pinyin: string; region?: string }>> | null>(null);
  useEffect(() => {
    if (view !== "flight" || flightCityData) return;
    let cancelled = false;
    getFlightsModule().then((m) => {
      if (!cancelled) setFlightCityData(m.FLIGHT_CITY_DATA);
    });
    return () => { cancelled = true; };
  }, [view, flightCityData]);
  const [flightBaggage, setFlightBaggage] = useState<"none" | "20kg" | "40kg">("none");
  const [hotRoutesSeed, setHotRoutesSeed] = useState(Date.now());
  const [recommendSeed, setRecommendSeed] = useState(Date.now());

  const ALL_ROUTES = useMemo(() => [
    { from: "北京", to: "上海", price: 680, tag: "直飞", duration: "2h15m" },
    { from: "上海", to: "广州", price: 720, tag: "直飞", duration: "2h30m" },
    { from: "广州", to: "成都", price: 850, tag: "直飞", duration: "2h45m" },
    { from: "成都", to: "杭州", price: 690, tag: "直飞", duration: "2h40m" },
    { from: "杭州", to: "深圳", price: 780, tag: "直飞", duration: "2h20m" },
    { from: "深圳", to: "北京", price: 820, tag: "直飞", duration: "3h10m" },
    { from: "北京", to: "广州", price: 910, tag: "直飞", duration: "3h20m" },
    { from: "上海", to: "成都", price: 880, tag: "直飞", duration: "3h05m" },
    { from: "北京", to: "成都", price: 750, tag: "直飞", duration: "2h55m" },
    { from: "广州", to: "杭州", price: 660, tag: "直飞", duration: "2h15m" },
    { from: "深圳", to: "上海", price: 730, tag: "直飞", duration: "2h25m" },
    { from: "成都", to: "深圳", price: 810, tag: "直飞", duration: "2h50m" },
    { from: "杭州", to: "北京", price: 700, tag: "直飞", duration: "2h10m" },
    { from: "上海", to: "北京", price: 650, tag: "直飞", duration: "2h15m" },
    { from: "北京", to: "深圳", price: 890, tag: "直飞", duration: "3h15m" },
    { from: "成都", to: "广州", price: 830, tag: "直飞", duration: "2h40m" },
    { from: "广州", to: "上海", price: 700, tag: "直飞", duration: "2h30m" },
    { from: "深圳", to: "成都", price: 800, tag: "直飞", duration: "2h50m" },
    { from: "北京", to: "杭州", price: 690, tag: "直飞", duration: "2h10m" },
    { from: "上海", to: "深圳", price: 740, tag: "直飞", duration: "2h25m" },
  ], []);

  // 热门航线：从 ALL_ROUTES 中取前6条（固定热门）
  const hotRoutes = useMemo(() => {
    const shuffled = [...ALL_ROUTES].sort(() => {
      const seed = hotRoutesSeed;
      return ((seed * 9301 + 49297) % 233280) / 233280 - 0.5;
    });
    return shuffled.slice(0, 6);
  }, [ALL_ROUTES, hotRoutesSeed]);

  // 推荐航线：随机取5条
  const recommendedRoutes = useMemo(() => {
    const shuffled = [...ALL_ROUTES].sort(() => {
      const seed = recommendSeed;
      return ((seed * 9301 + 49297) % 233280) / 233280 - 0.5;
    });
    return shuffled.slice(0, 5);
  }, [ALL_ROUTES, recommendSeed]);

  const flightBaggagePrice = flightBaggage === "none" ? 0 : flightBaggage === "20kg" ? 80 : 180;
  const flightTotalPrice = useMemo(() => {
    if (!selectedFlight) return 0;
    const pax = flightAdults + flightChildren;
    return (selectedFlight.price + flightBaggagePrice) * pax;
  }, [selectedFlight, flightBaggagePrice, flightAdults, flightChildren]);
  const filteredFlightCities = useMemo(() => {
    const list = flightCityData?.[flightCityTab] ?? [];
    const kw = flightCityKeyword.trim().toLowerCase();
    if (!kw) return list;
    return list.filter(
      (c) => c.name.includes(kw) || c.pinyin.includes(kw) || c.code.toLowerCase().includes(kw)
    );
  }, [flightCityData, flightCityTab, flightCityKeyword]);
  const groupedFlightCities = useMemo(() => {
    if (flightCityKeyword.trim()) return null;
    const list = flightCityData?.[flightCityTab] ?? [];
    const groups: Record<string, Array<{ code: string; name: string; pinyin: string; region?: string }>> = {};
    list.forEach((c) => {
      const r = c.region || "其他";
      if (!groups[r]) groups[r] = [];
      groups[r].push(c);
    });
    return groups;
  }, [flightCityData, flightCityTab, flightCityKeyword]);
  const sortedFlightResults = useMemo(() => {
    if (!flightResults) return [];
    const arr = [...flightResults];
    if (flightSortBy === "price") arr.sort((a, b) => a.price - b.price);
    else if (flightSortBy === "time") arr.sort((a, b) => a.departTime.localeCompare(b.departTime));
    else arr.sort((a, b) => a.durationMin - b.durationMin);
    return arr;
  }, [flightResults, flightSortBy]);
  const runFlightSearch = async (opts?: { from?: string; to?: string; date?: string; cabin?: "economy" | "business" | "first" }) => {
    const from = opts?.from ?? flightFrom;
    const to = opts?.to ?? flightTo;
    const date = opts?.date ?? flightDate;
    const cabin = opts?.cabin ?? flightCabin;
    if (!date || from === to) return;
    if (opts?.from) setFlightFrom(opts.from);
    if (opts?.to) setFlightTo(opts.to);
    if (opts?.date) setFlightDate(opts.date);
    if (opts?.cabin) setFlightCabin(opts.cabin);
    setFlightSearching(true);
    setFlightResults(null);
    const { searchFlights } = await getFlightsModule();
    setTimeout(() => {
      const results = searchFlights({
        from,
        to,
        date,
        cabin,
        cityTab: flightCityTab,
      });
      setFlightResults(results);
      setFlightSearching(false);
    }, 700);
  };
  // 默认浅色，避免旧主题缓存造成首屏先黑再切白
  const [darkMode, setDarkMode] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "shipping" | "completed" | "aftersale">("all");
  const [selectedCartItems, setSelectedCartItems] = useState<Set<number>>(new Set());
  const [cartTab, setCartTab] = useState<"delivery" | "takeout" | "travel">("delivery");
  const [claimedCouponAmount, setClaimedCouponAmount] = useState(0);
  const [couponTarget, setCouponTarget] = useState(0);
  const [showCouponToast, setShowCouponToast] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string>("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [blindBoxProduct, setBlindBoxProduct] = useState<Product | null>(null);
  const [blindBoxExpireAt, setBlindBoxExpireAt] = useState<number | null>(null);
  const [blindBoxTimeLeft, setBlindBoxTimeLeft] = useState("");
  const [blindBoxOpening, setBlindBoxOpening] = useState(false);
  const [blindBoxOpened, setBlindBoxOpened] = useState(false);
  const [isBlindBoxOrder, setIsBlindBoxOrder] = useState(false);
  const [blindBoxLastOpened, setBlindBoxLastOpened] = useState("");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<"zodiac" | "chinese">("zodiac");
  const [nicknameEditorOpen, setNicknameEditorOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareCardType, setShareCardType] = useState<"normal" | "blindbox">("normal");
  const [shareCardImage, setShareCardImage] = useState<string>("");
  const [selectedShop, setSelectedShop] = useState<string | undefined>();
  const [takeoutSubCategory, setTakeoutSubCategory] = useState<string | undefined>();
  const isDev = process.env.NODE_ENV === "development";
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("blindBoxLastOpened") : null;
    if (stored) setBlindBoxLastOpened(stored);
  }, []);
  const todayKey = new Date().toISOString().slice(0, 10);
  const blindBoxCanOpen = isDev || blindBoxLastOpened !== todayKey;
  const isAdmin = false;
  const {
    cart,
    stats,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    toggleFavorite,
    isFavorite,
    addMessage,
    removeFromCart,
    changeQuantity,
    updateCartItemSpecs,
    clearCart,
    markProductViewed,
    completeOrder,
    updateOrderStatus,
    refreshStreak,
    applyAfterSale,
    completeAfterSale,
    setAvatar,
    setNickname,
  } = useShopStore();

  const earnedBadges = useMemo(() => BADGES.filter((b) => stats.badges.includes(b.id)), [stats.badges]);

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  useEffect(() => {
    if (!stats.nickname) {
      setNickname(generateNickname());
    }
  }, [stats.nickname, setNickname]);

  useEffect(() => {
    const SHIPPING_DURATION = 66000;
    (stats.purchases ?? []).forEach((purchase) => {
      if (purchase.status === "shipping") {
        const createdAt = new Date(purchase.createdAt).getTime();
        const now = Date.now();
        if (now - createdAt >= SHIPPING_DURATION) {
          updateOrderStatus(purchase.id, "completed");
        }
      }
    });
  }, [stats.purchases, updateOrderStatus]);

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    const oldTheme = darkMode ? "light" : "dark";
    document.documentElement.classList.add("no-transitions");
    document.documentElement.classList.add(theme);
    document.documentElement.classList.remove(oldTheme);
    document.documentElement.style.colorScheme = theme;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("no-transitions");
      });
    });
    try {
      localStorage.removeItem("moon-cart-theme");
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (deliveryTimerRef.current)
        window.clearInterval(deliveryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeDeliveries.length || deliveryTimerRef.current) return;
    deliveryTimerRef.current = window.setInterval(() => {
      setActiveDeliveries((orders) => {
        const completed: DeliveryOrder[] = [];
        const moving = orders
          .map((order) => {
            // 旅行订单：实时倒计时，不自动完成，保留在配送中列表
            if (order.channel === "travel" && order.travelStartDate) {
              return order;
            }
            // 非旅行订单：每6秒推进1步
            const steps = getDeliverySteps(order.channel);
            const stepIndex = Math.min(
              steps.length - 1,
              order.stepIndex + 1,
            );
            const nextOrder = { ...order, stepIndex };
            if (stepIndex >= steps.length - 1)
              completed.push(nextOrder);
            return nextOrder;
          })
          .filter((order) => {
            if (order.channel === "travel") {
              return true;
            }
            const steps = getDeliverySteps(order.channel);
            return order.stepIndex < steps.length - 1;
          });

        completed.forEach((order) => {
          completeOrder(order.amount, order.items);
          setLastOrderAmount(order.amount);
          setLastOrderItems(order.items);
          setIsBlindBoxOrder(false);
        });

        const nonTravelCount = moving.filter(o => o.channel !== "travel").length;
        if (!nonTravelCount && moving.length > 0 && deliveryTimerRef.current) {
          window.clearInterval(deliveryTimerRef.current);
          deliveryTimerRef.current = null;
          if (completed.length) setView("done");
        }
        if (!moving.length && deliveryTimerRef.current) {
          window.clearInterval(deliveryTimerRef.current);
          deliveryTimerRef.current = null;
          if (completed.length) setView("done");
        }
        return moving;
      });
    }, activeDeliveries.some((o: DeliveryOrder) => o.channel === "travel") ? 1000 : 6000);
  }, [activeDeliveries.length, completeOrder]);

  const visibleProducts = useMemo(() => {
    const channelCats = channelCategories[listChannel];
    const kw = subKeyword.trim().toLowerCase();
    const matchKeyword = (title: string, keyword: string) => {
      if (!keyword) return true;
      if (keyword.includes("|")) {
        return new RegExp(keyword, "i").test(title);
      }
      return title.toLowerCase().includes(keyword);
    };
    if (selectedSubCategory) {
      const subProducts = pickProducts(undefined, selectedSubCategory);
      if (subProducts.length > 0) {
        return subProducts.filter((p) => matchKeyword(p.title, kw));
      }
      if (selectedCategory && kw) {
        return pickProducts(selectedCategory)
          .filter((p) => channelCats.includes(p.category))
          .filter((p) => matchKeyword(p.title, kw));
      }
    }
    if (selectedCategory) {
      return pickProducts(selectedCategory)
        .filter((p) => channelCats.includes(p.category))
        .filter((p) => matchKeyword(p.title, kw));
    }
    return products
      .filter((p) => p.category !== "盲盒" && channelCats.includes(p.category))
      .filter((p) => matchKeyword(p.title, kw));
  }, [selectedCategory, selectedSubCategory, listChannel, subKeyword]);
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (cart.length > 0 && selectedCartItems.size === 0) {
      setSelectedCartItems(new Set(cart.map((item) => item.id)));
    }
  }, [cart.length]);

  const selectedItems = cart.filter((item) => selectedCartItems.has(item.id));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAllSelected = cart.length > 0 && selectedCartItems.size === cart.length;

  const cartTabItems = cart.filter((item) =>
    cartTab === "takeout"
      ? item.category === "外卖"
      : cartTab === "travel"
      ? item.category === "旅行"
      : item.category !== "外卖" && item.category !== "旅行"
  );
  const cartTabSelectedItems = cartTabItems.filter((item) => selectedCartItems.has(item.id));
  const isTabAllSelected = cartTabItems.length > 0 && cartTabSelectedItems.length === cartTabItems.length;

  const categoriesInCart = new Set(
    cart.map((item) => {
      if (item.category === "外卖") return "takeout";
      if (item.category === "旅行") return "travel";
      return "delivery";
    })
  );
  const showCategoryTabs = cart.length >= 2 && categoriesInCart.size >= 2;
  const displayCartItems = showCategoryTabs ? cartTabItems : cart;
  const displayCartSelectedItems = showCategoryTabs ? cartTabSelectedItems : selectedItems;
  const displayCartSelectedTotal = displayCartSelectedItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );
  const isDisplayAllSelected = displayCartItems.length > 0 && displayCartSelectedItems.length === displayCartItems.length;

  const takeoutItems = selectedItems.filter((item) => item.category === "外卖");
  const travelItems = selectedItems.filter((item) => item.category === "旅行");
  const deliveryItems = selectedItems.filter((item) => item.category !== "外卖" && item.category !== "旅行");
  const takeoutTotal = takeoutItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );
  const travelTotal = travelItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );
  const deliveryTotal = deliveryItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );

  const cartSelectedCategory = cartTab;
  const currentTotal = showCategoryTabs
    ? cartTab === "takeout"
      ? takeoutTotal
      : cartTab === "travel"
      ? travelTotal
      : deliveryTotal
    : selectedTotal;
  const couponAmount = couponTarget > 0 ? couponTarget - currentTotal : 0;
  const canUseCoupon = currentTotal > 0 && claimedCouponAmount > 0;
  const canCheckout = claimedCouponAmount > 0 && couponAmount <= 0;

  useEffect(() => {
    if (currentTotal <= 0 && claimedCouponAmount > 0) {
      setClaimedCouponAmount(0);
      setCouponTarget(0);
    }
  }, [currentTotal, claimedCouponAmount]);

  useEffect(() => {
    setClaimedCouponAmount(0);
    setCouponTarget(0);
  }, [cartTab]);

  const finalSelectedTotal = canUseCoupon ? selectedTotal - claimedCouponAmount : selectedTotal;

  const claimCoupon = () => {
    if (currentTotal <= 0 || claimedCouponAmount > 0) return;
    const target = Math.ceil(currentTotal / 50) * 50;
    const coupon = target * 0.1;
    setCouponTarget(target);
    setClaimedCouponAmount(Math.floor(coupon));
    setShowCouponToast(true);
    setFlashMessage(`领券成功！获得 ${money(Math.floor(coupon))} 优惠券`);
    setTimeout(() => {
      setShowCouponToast(false);
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
  };

  const clearFlashMessage = () => {
    setFlashMessage("");
  };

  const toggleSelectItem = (id: number) => {
    const newSelected = new Set(selectedCartItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCartItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (isTabAllSelected) {
      const newSelected = new Set(selectedCartItems);
      cartTabItems.forEach((item) => newSelected.delete(item.id));
      setSelectedCartItems(newSelected);
    } else {
      const newSelected = new Set(selectedCartItems);
      cartTabItems.forEach((item) => newSelected.add(item.id));
      setSelectedCartItems(newSelected);
    }
  };

  const couponRecommendProducts = useMemo(() => {
    if (couponAmount <= 0) return [];
    const cartIds = new Set(cart.map((item) => item.id));
    let categoryFilter: string[] = [];
    if (cartSelectedCategory === "takeout") {
      categoryFilter = ["外卖"];
    } else if (cartSelectedCategory === "travel") {
      categoryFilter = ["旅行"];
    } else {
      categoryFilter = ["数码", "美妆护肤", "女装", "男装", "箱包", "黄金珠宝", "家电", "家居用品", "食品饮料", "生鲜水果", "母婴用品", "运动户外", "图书音像", "宠物用品", "汽车用品", "医药健康"];
    }
    return products
      .filter((p) => !cartIds.has(p.id) && categoryFilter.includes(p.category) && p.price >= couponAmount)
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);
  }, [couponAmount, cart, products, cartSelectedCategory]);

  const addCouponProduct = (product: Product) => {
    const hasSpecs = product.specs && product.specs.length > 0;
    if (product.category === "旅行" || hasSpecs) {
      setCouponModalOpen(false);
      setCouponAddProduct(product);
      const defaultSpecs: Record<string, string> = {};
      if (product.specs) {
        product.specs.forEach((spec) => {
          if (spec.options.length > 0) {
            defaultSpecs[spec.label] = spec.options[0].name;
          }
        });
      }
      setCouponAddSpecs(defaultSpecs);
      setCouponAddQuantity(1);
      return;
    }
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
  };

  const filteredOrdersByTab = useMemo(() => {
    let purchases = stats.purchases ?? [];
    if (ordersTab !== "all") {
      purchases = purchases.filter((p) => {
        const categories = p.items.map((item) => item.category);
        if (ordersTab === "delivery") {
          return categories.every((c) => c !== "外卖" && c !== "旅行");
        }
        if (ordersTab === "takeout") {
          return categories.some((c) => c === "外卖");
        }
        if (ordersTab === "travel") {
          return categories.some((c) => c === "旅行");
        }
        return true;
      });
    }
    if (ordersTab === "all" && orderFilter !== "all") {
      const now = new Date();
      if (orderFilter === "7d") {
        const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        purchases = purchases.filter((p) => new Date(p.createdAt) >= cutoff);
      } else if (orderFilter === "30d") {
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        purchases = purchases.filter((p) => new Date(p.createdAt) >= cutoff);
      } else if (orderFilter === "year") {
        const year = now.getFullYear();
        purchases = purchases.filter((p) => new Date(p.createdAt).getFullYear() === year);
      }
    }
    if (orderStatusFilter !== "all") {
      purchases = purchases.filter((p) => p.status === orderStatusFilter);
    }
    if (orderSearchQuery.trim()) {
      const query = orderSearchQuery.trim().toLowerCase();
      purchases = purchases.filter((p) =>
        p.orderNo?.toLowerCase().includes(query)
      );
    }
    return purchases;
  }, [stats.purchases, ordersTab, orderFilter, orderStatusFilter, orderSearchQuery]);

  const getTakeoutShops = (subCat?: string): Array<{ name: string; rating: number; sales: string; deliveryTime: string; image: string }> => {
    const takeoutProducts = products.filter((p) => p.category === "外卖" && (!subCat || p.subCategory === subCat));
    const shopMap = new Map<string, { rating: number; sales: number; deliveryTime: string; image: string }>();
    const shopImages: Record<string, string> = {
      "喜茶": "🧋", "奈雪的茶": "🍵", "蜜雪冰城": "🍧", "茶百道": "🥤", "一点点": "🍵",
      "CoCo": "🧋", "书亦烧仙草": "🍮", "古茗": "🧋", "沪上阿姨": "🥤", "瑞幸": "☕",
      "麦当劳": "🍔", "肯德基": "🍗", "汉堡王": "🍔", "华莱士": "🍗", "德克士": "🍗",
      "真功夫": "🍱", "老乡鸡": "🍲", "永和大王": "🥟", "吉野家": "🍚", "食其家": "🍱",
      "海底捞": "🍲", "西贝莜面村": "🍜", "外婆家": "🥘", "绿茶餐厅": "🍲",
      "必胜客": "🍕", "达美乐": "🍕", "棒约翰": "🍕", "萨莉亚": "🍝",
      "疯狂烤翅": "🍗", "叫了个炸鸡": "🍗", "正新鸡排": "🍗", "木屋烧烤": "🍢",
      "好利来": "🍰", "85度C": "🍰", "巴黎贝甜": "🍰", "味多美": "🍰", "满记甜品": "🍮",
      "兰州牛肉面": "🍜", "沙县小吃": "🍜", "云南过桥米线": "🍜", "桂林米粉": "🍜",
      "元气寿司": "🍣", "寿司郎": "🍣", "藏寿司": "🍣", "一兰拉面": "🍜",
    };
    const shopRatings: Record<string, number> = {
      "喜茶": 4.8, "奈雪的茶": 4.7, "蜜雪冰城": 4.6, "茶百道": 4.7, "一点点": 4.6,
      "CoCo": 4.5, "书亦烧仙草": 4.6, "古茗": 4.7, "沪上阿姨": 4.6, "瑞幸": 4.8,
      "麦当劳": 4.9, "肯德基": 4.8, "汉堡王": 4.7, "华莱士": 4.5, "德克士": 4.6,
      "真功夫": 4.6, "老乡鸡": 4.7, "永和大王": 4.5, "吉野家": 4.7, "食其家": 4.6,
      "海底捞": 4.9, "西贝莜面村": 4.7, "外婆家": 4.6, "绿茶餐厅": 4.5,
      "必胜客": 4.7, "达美乐": 4.8, "棒约翰": 4.6, "萨莉亚": 4.5,
      "疯狂烤翅": 4.6, "叫了个炸鸡": 4.5, "正新鸡排": 4.5, "木屋烧烤": 4.7,
      "好利来": 4.8, "85度C": 4.7, "巴黎贝甜": 4.7, "味多美": 4.6, "满记甜品": 4.7,
      "兰州牛肉面": 4.6, "沙县小吃": 4.5, "云南过桥米线": 4.6, "桂林米粉": 4.5,
      "元气寿司": 4.7, "寿司郎": 4.8, "藏寿司": 4.6, "一兰拉面": 4.9,
    };
    takeoutProducts.forEach((p) => {
      if (p.shop) {
        const existing = shopMap.get(p.shop);
        const salesNum = parseFloat(p.sales) || 0;
        if (!existing) {
          shopMap.set(p.shop, {
            rating: shopRatings[p.shop] ?? parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
            sales: salesNum,
            deliveryTime: `${20 + Math.floor(Math.random() * 20)}分钟`,
            image: shopImages[p.shop] || "🍽️",
          });
        } else {
          existing.sales += salesNum;
        }
      }
    });
    return Array.from(shopMap.entries()).map(([name, data]) => ({
      name,
      rating: data.rating,
      sales: `${data.sales.toFixed(1)}万`,
      deliveryTime: data.deliveryTime,
      image: data.image,
    }));
  };

  const getShopProducts = (shopName: string): Product[] => {
    return products.filter((p) => p.shop === shopName && p.category === "外卖");
  };

  const openTakeoutShops = (subCategory?: string) => {
    setTakeoutSubCategory(subCategory);
    setSelectedSubCategory(subCategory);
    setListTitle(subCategory || "全部美食");
    setView("takeoutShops");
  };

  const openTakeoutShop = (shopName: string) => {
    setSelectedShop(shopName);
    setListTitle(shopName);
    setView("takeoutShop");
  };

  const openRecommend = () => {
    setListTitle(homeTab === "takeout" ? "为你推荐" : homeTab === "travel" ? "精选推荐" : "猜你喜欢");
    setView("recommend");
  };

  const openCategory = (
    category?: string,
    channel: "index" | "takeout" | "travel" = "index",
    keyword?: string,
    title?: string,
    subCategory?: string,
  ) => {
    setSelectedCategory(category);
    setListChannel(channel);
    setSubKeyword(keyword ?? "");
    setListTitle(title ?? category ?? "全部商品");
    setSelectedSubCategory(subCategory);
    setView("list");
  };

  const openProduct = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      const defaultSpecs: Record<string, string> = {};
      product.specs?.forEach((spec) => {
        if (spec.options.length > 0) {
          defaultSpecs[spec.label] = spec.options[0].name;
        }
      });
      const isTravel = product.category === "旅行";
      const isHotel = isTravel && isHotelProduct(product.title);
      if (isTravel && isHotel) {
        defaultSpecs["成人"] = "1";
        defaultSpecs["儿童"] = "0";
      }
      setSelectedSpecs(defaultSpecs);
      setProductQuantity(1);
      markProductViewed();
      setPrevView(view);
      setView("detail");
    },
    [view, markProductViewed],
  );

  // 快速加购：弹出规格选择面板（有 specs 时）或直接加入购物车
  // 提取为 useCallback 以保持引用稳定，配合 ProductCard 的 React.memo 生效
  const handleQuickAdd = useCallback((product: Product) => {
    setQuickAddProduct(product);
    const defaultSpecs: Record<string, string> = {};
    product.specs?.forEach((spec) => {
      if (spec.options.length > 0) {
        defaultSpecs[spec.label] = spec.options[0].name;
      }
    });
    setQuickAddSpecs(defaultSpecs);
  }, []);

  const startOrder = (
    amount?: number,
    items?: CartItem[],
  ) => {
    const orderAmount = amount ?? (selectedProduct ? selectedProduct.price : 0);
    const orderItems = items?.length
      ? items.map((item) => ({ ...item }))
      : selectedProduct ? [{ ...selectedProduct, quantity: 1, finalPrice: selectedProduct.price }] : [];
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const channel = getChannelFromItems(orderItems);
    // 旅行订单：从规格中提取出发日期
    const travelStartDate = channel === "travel" && orderItems[0]?.selectedSpecs
      ? (orderItems[0].selectedSpecs["出发日期"] || orderItems[0].selectedSpecs["入住日期"] || orderItems[0].selectedSpecs["取车日期"])
      : undefined;
    setLastOrderAmount(orderAmount);
    setLastOrderItems(orderItems);
    setOrderPanelOpen(true);
    // 结算后清理：购物车多商品单独结算时只移除该商品，全量结算时清空
    if (items?.length && items.length < cart.length) {
      items.forEach((item) => removeFromCart(item.id));
    } else if (items?.length) {
      clearCart();
    }
    setActiveDeliveries((orders) => [
      ...orders,
      {
        id,
        amount: orderAmount,
        items: orderItems,
        stepIndex: 0,
        createdAt: new Date().toISOString(),
        channel,
        travelStartDate,
      },
    ]);
    if (channel === "travel") {
      completeOrder(orderAmount, orderItems);
    }
  };

  const accelerate = (id?: string) => {
    setActiveDeliveries((orders) =>
      orders.map((order) => {
        if (!(!id || order.id === id)) return order;
        const steps = getDeliverySteps(order.channel);
        return {
          ...order,
          stepIndex: Math.min(steps.length - 1, order.stepIndex + 2),
        };
      }),
    );
  };

  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const nicknameAdjectives = [
    "快乐的", "温柔的", "可爱的", "神秘的", "慵懒的",
    "调皮的", "安静的", "热情的", "优雅的", "机智的",
    "勇敢的", "善良的", "聪明的", "呆萌的", "高冷的",
    "元气的", "佛系的", "社恐的", "话痨的", "甜美的"
  ];

  const nicknameNouns = [
    "小月亮", "星星", "云朵", "小猫", "小狗",
    "兔子", "熊猫", "企鹅", "海豚", "独角兽",
    "精灵", "骑士", "公主", "王子", "冒险家",
    "收藏家", "梦想家", "旅行者", "美食家", "艺术家"
  ];

  const generateNickname = () => {
    const adj = nicknameAdjectives[Math.floor(Math.random() * nicknameAdjectives.length)];
    const noun = nicknameNouns[Math.floor(Math.random() * nicknameNouns.length)];
    return adj + noun;
  };

  const buildShareCardPayload = () => {
    const purchases = stats.purchases ?? [];
    const boughtCount = purchases.reduce(
      (sum, record) =>
        sum + record.items.reduce((sum, item) => sum + item.quantity, 0),
      0,
    );
    const seen = new Set<string>();
    const recent: CartItem[] = [];
    purchases
      .flatMap((record) => record.items)
      .forEach((item) => {
        if (seen.has(item.title)) return;
        seen.add(item.title);
        if (recent.length < 5) recent.push(item);
      });
    const items = recent.length ? recent : lastOrderItems;
    return {
      boughtCount,
      virtualSpend: stats.virtualSpend || lastOrderAmount,
      items,
    };
  };

  const formatMoney = (value: number) =>
    `¥${Math.round(value).toLocaleString("zh-CN")}`;

  const formatMoneyShort = (value: number) => {
    const v = Math.round(value);
    if (v >= 100000000) {
      return `¥${(v / 100000000).toFixed(2)}亿`;
    }
    if (v >= 10000) {
      return `¥${(v / 10000).toFixed(1)}万`;
    }
    return `¥${v}`;
  };

  const drawShareCard = async () => {
    const W = 1080;
    const H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const payload = buildShareCardPayload();
    const center = W / 2;
    const cjk = '"PingFang SC","HarmonyOS Sans","Helvetica Neue",sans-serif';
    const PURPLE_DEEP = "#1A0F2E";
    const PURPLE_DARK = "#2D1B4E";
    const PURPLE_MID = "#4A2C7A";
    const PURPLE_LIGHT = "#6B4C9A";
    const GOLD = "#FFD700";
    const WHITE = "#FFFFFF";

    // 紫色渐变背景（集卡风格）
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, PURPLE_DEEP);
    bg.addColorStop(0.4, PURPLE_DARK);
    bg.addColorStop(0.7, PURPLE_MID);
    bg.addColorStop(1, PURPLE_LIGHT);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 星星装饰
    const stars = [
      { x: 80, y: 120, r: 3 }, { x: 250, y: 80, r: 2 },
      { x: 900, y: 100, r: 3 }, { x: 750, y: 60, r: 1.5 },
      { x: 150, y: 280, r: 2 }, { x: 850, y: 250, r: 2.5 },
      { x: 500, y: 150, r: 1.5 }, { x: 650, y: 200, r: 1 },
      { x: 100, y: 180, r: 1 }, { x: 950, y: 180, r: 2 },
    ];
    stars.forEach((s) => {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 顶部品牌区
    ctx.textAlign = "center";
    ctx.font = `bold 52px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.fillText("🌙 睡前逛逛", center, 160);

    ctx.font = `24px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("MOON CART · 我的购物历史", center, 210);

    // 大卡片（集卡风格，带渐变和光晕）
    const cardW = 720;
    const cardH = 1000;
    const cardX = (W - cardW) / 2;
    const cardY = 280;

    // 卡片外发光
    const cardGlow = ctx.createRadialGradient(center, cardY + cardH / 2, 0, center, cardY + cardH / 2, cardW);
    cardGlow.addColorStop(0, "rgba(255,215,0,0.2)");
    cardGlow.addColorStop(1, "rgba(255,215,0,0)");
    ctx.fillStyle = cardGlow;
    ctx.fillRect(cardX - 100, cardY - 100, cardW + 200, cardH + 200);

    // 卡片渐变背景
    const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    cardGradient.addColorStop(0, "rgba(255,143,177,0.3)");
    cardGradient.addColorStop(0.3, "rgba(255,255,255,0.15)");
    cardGradient.addColorStop(0.7, "rgba(107,76,154,0.3)");
    cardGradient.addColorStop(1, "rgba(255,215,0,0.2)");
    ctx.fillStyle = cardGradient;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 48);
    ctx.fill();

    // 卡片边框
    ctx.strokeStyle = "rgba(255,215,0,0.4)";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 48);
    ctx.stroke();

    // 卡片内装饰 - 左上角音符
    ctx.font = `48px sans-serif`;
    ctx.fillStyle = "rgba(255,215,0,0.6)";
    ctx.fillText("🎵", cardX + 50, cardY + 80);

    // 卡片内装饰 - 右上角闪粉
    ctx.fillText("✨", cardX + cardW - 80, cardY + 70);

    // 大 emoji/图标
    ctx.font = `200px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText("🛒", center, cardY + 280);
    ctx.textBaseline = "alphabetic";

    // 卡片标题
    ctx.font = `bold 64px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.textAlign = "center";
    ctx.fillText("购物战绩卡", center, cardY + 430);

    // 分割线
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, cardY + 480);
    ctx.lineTo(cardX + cardW - 60, cardY + 480);
    ctx.stroke();

    // 双数据展示（上下两行）
    const dataY = cardY + 540;

    // 已买商品（第一行）
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `28px ${cjk}`;
    ctx.fillText("已买商品", center, dataY);

    ctx.fillStyle = WHITE;
    ctx.font = `bold 72px ${cjk}`;
    ctx.fillText(`${payload.boughtCount}`, center, dataY + 70);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `26px ${cjk}`;
    ctx.fillText("件", center, dataY + 110);

    // 分割线
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, dataY + 140);
    ctx.lineTo(cardX + cardW - 60, dataY + 140);
    ctx.stroke();

    // 虚拟消费（第二行）
    const dataY2 = dataY + 180;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `28px ${cjk}`;
    ctx.fillText("虚拟消费", center, dataY2);

    ctx.fillStyle = GOLD;
    ctx.font = `bold ${payload.virtualSpend >= 100000000 ? 56 : 72}px ${cjk}`;
    ctx.fillText(formatMoneyShort(payload.virtualSpend), center, dataY2 + 70);

    // 稀有度标签
    const rarityY = cardY + cardH - 80;
    const rarityText = payload.boughtCount >= 50 ? "传说" : payload.boughtCount >= 20 ? "史诗" : payload.boughtCount >= 10 ? "稀有" : "普通";
    const rarityColor = payload.boughtCount >= 50 ? "#FFD700" : payload.boughtCount >= 20 ? "#C77DFF" : payload.boughtCount >= 10 ? "#4CC9F0" : "#90E0EF";

    // 标签背景
    const badgeW = 200;
    const badgeH = 56;
    ctx.fillStyle = rarityColor;
    drawRoundRect(ctx, center - badgeW / 2, rarityY - badgeH / 2, badgeW, badgeH, 28);
    ctx.fill();

    ctx.fillStyle = PURPLE_DEEP;
    ctx.font = `bold 30px ${cjk}`;
    ctx.fillText(`${rarityText}级`, center, rarityY + 10);

    // 情绪价值文案
    const emotionalQuotes = [
      "购物是成年人的过家家，开心就好～",
      "虽然钱包没瘦，但心情变美了 ✨",
      "虚拟消费也是消费，快乐是真的！",
      "深夜购物不是病，是治愈自己的方式",
      "不花钱的快乐，才是真快乐 🌙",
    ];
    const quote = emotionalQuotes[Math.floor(Math.random() * emotionalQuotes.length)];

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `30px ${cjk}`;
    ctx.fillText(quote, center, cardY + cardH + 100);

    // 二维码
    const qrSize = 200;
    const qrX = center - qrSize / 2;
    const qrY = cardY + cardH + 200;

    try {
      const QRCode = await getQRCode();
      const qrDataUrl = await QRCode.toDataURL("https://m.trestrong.com/", {
        width: qrSize,
        margin: 1,
        color: { dark: "#1A0F2E", light: "#FFFFFF" },
      });
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });
      // 白色圆角底
      ctx.fillStyle = WHITE;
      drawRoundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      // 二维码生成失败，画个占位背景
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      drawRoundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `24px ${cjk}`;
    ctx.fillText("扫码也来逛逛", center, qrY + qrSize + 45);

    // 底部品牌
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = `22px ${cjk}`;
    ctx.fillText("睡前逛逛 · Moon Cart", center, H - 40);

    return canvas;
  };

  const drawBlindBoxShareCard = async () => {
    const W = 1080;
    const H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const product = lastOrderItems[0];
    if (!product) return null;

    const cjk = '"PingFang SC","HarmonyOS Sans","Helvetica Neue",sans-serif';
    const PURPLE_DARK = "#1A0F2E";
    const PURPLE_MID = "#2D1B4E";
    const PURPLE_LIGHT = "#4A2C7A";
    const WHITE = "#FFFFFF";
    const GOLD = "#FFD700";

    // 紫色夜空渐变背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, PURPLE_DARK);
    bg.addColorStop(0.5, PURPLE_MID);
    bg.addColorStop(1, PURPLE_LIGHT);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 星星装饰
    const stars = [
      { x: 100, y: 100, r: 2 }, { x: 300, y: 200, r: 1.5 },
      { x: 800, y: 150, r: 2 }, { x: 950, y: 80, r: 1 },
      { x: 150, y: 300, r: 1 }, { x: 900, y: 350, r: 1.5 },
      { x: 500, y: 120, r: 1 }, { x: 700, y: 250, r: 1 },
    ];
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 顶部标题
    ctx.textAlign = "center";
    ctx.font = `bold 56px ${cjk}`;
    ctx.fillStyle = GOLD;
    ctx.fillText("🎁 盲盒惊喜", W / 2, 200);

    ctx.font = `28px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("我开出了一个神秘物品", W / 2, 260);

    // 商品卡片（渐变背景，更清晰）
    const cardY = 340;
    const cardH = 700;
    const cardGradient = ctx.createLinearGradient(80, cardY, W - 80, cardY + cardH);
    cardGradient.addColorStop(0, "rgba(255,215,0,0.15)");
    cardGradient.addColorStop(0.5, "rgba(255,255,255,0.12)");
    cardGradient.addColorStop(1, "rgba(255,215,0,0.1)");
    ctx.fillStyle = cardGradient;
    drawRoundRect(ctx, 80, cardY, W - 160, cardH, 32);
    ctx.fill();

    // 卡片边框
    ctx.strokeStyle = "rgba(255,215,0,0.3)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 80, cardY, W - 160, cardH, 32);
    ctx.stroke();

    // 大 emoji 背景光晕
    const emojiGlow = ctx.createRadialGradient(W / 2, cardY + 280, 0, W / 2, cardY + 280, 200);
    emojiGlow.addColorStop(0, "rgba(255,215,0,0.3)");
    emojiGlow.addColorStop(1, "rgba(255,215,0,0)");
    ctx.fillStyle = emojiGlow;
    ctx.beginPath();
    ctx.arc(W / 2, cardY + 280, 200, 0, Math.PI * 2);
    ctx.fill();

    // 大 emoji
    ctx.font = `280px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(product.emoji, W / 2, cardY + 280);
    ctx.textBaseline = "alphabetic";

    // 商品名
    ctx.font = `bold 56px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.fillText(product.title, W / 2, cardY + 470);

    // 价格
    ctx.font = `bold 80px ${cjk}`;
    ctx.fillStyle = GOLD;
    ctx.fillText(`¥${product.price}`, W / 2, cardY + 570);

    ctx.font = `26px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("虚拟价值 · 实际支付 ¥0", W / 2, cardY + 620);

    // 情绪价值文案
    const phrases = [
      "今晚的运气，都花在这个盲盒上了 🌟",
      "生活需要一点不确定性，比如开个盲盒 🎲",
      "不是真的买，是真的开心 ✨",
      "盲盒开出了快乐，这就够了 💫",
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    ctx.font = `32px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(phrase, W / 2, 1130);

    // 二维码
    const qrSize = 280;
    const qrX = (W - qrSize) / 2;
    const qrY = 1220;
    try {
      const QRCode = await getQRCode();
      const qrDataUrl = await QRCode.toDataURL("https://m.trestrong.com/", {
        width: qrSize,
        margin: 1,
        color: { dark: "#1A0F2E", light: "#FFFFFF" },
      });
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });
      // 白色圆角底
      ctx.fillStyle = WHITE;
      drawRoundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      // 二维码生成失败，跳过
    }

    // 二维码下方文案
    ctx.font = `28px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("扫码也能开出惊喜", W / 2, qrY + qrSize + 60);

    // 底部品牌
    ctx.font = `24px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("睡前逛逛 · Moon Cart", W / 2, H - 80);

    return canvas;
  };

  const shareBlindBoxCard = async () => {
    const canvas = await drawBlindBoxShareCard();
    if (!canvas) return;
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "睡前逛逛-盲盒惊喜.jpg", {
          type: "image/jpeg",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "睡前逛逛 Moon Cart",
              text: "我开出了一个神秘盲盒！",
            });
            return;
          } catch {
            // 用户取消
          }
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "睡前逛逛-盲盒惊喜.jpg";
        link.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.92,
    );
  };

  const downloadShareCard = async () => {
    const canvas = await drawShareCard();
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "睡前逛逛-分享卡.jpg";
        link.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.92,
    );
  };

  const shareCard = async () => {
    const canvas = await drawShareCard();
    if (!canvas) {
      downloadShareCard();
      return;
    }
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "睡前逛逛-分享卡.jpg", {
          type: "image/jpeg",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "睡前逛逛 Moon Cart",
              text: "今天没花钱，但快乐已经到账。",
            });
            return;
          } catch {
            // 用户取消，回退到下载
          }
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "睡前逛逛-分享卡.jpg";
        link.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.92,
    );
  };

  const submitWish = () => {
    const title = wishInput.trim();
    if (!title) return;
    addToWishlist(title);
    setWishInput("");
  };

  const openBlindBox = async () => {
    if (!blindBoxCanOpen) return;
    setBlindBoxOpening(true);
    setBlindBoxOpened(false);
    // 预加载盲盒模块（与开盒动画并行，2秒动画时间内通常已加载完成）
    const modulePromise = getBlindBoxModule();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { getBlindBoxProducts } = await modulePromise;
    const blindBoxProducts = getBlindBoxProducts();
    const randomProduct =
      blindBoxProducts[Math.floor(Math.random() * blindBoxProducts.length)];
    setBlindBoxProduct(randomProduct);
    const expireAt = Date.now() + 30 * 60 * 1000;
    setBlindBoxExpireAt(expireAt);
    updateBlindBoxTimer(expireAt);
    setBlindBoxOpened(true);
    setBlindBoxOpening(false);
    if (!isDev) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem("blindBoxLastOpened", today);
      setBlindBoxLastOpened(today);
    }
  };

  const updateBlindBoxTimer = (expireAt: number) => {
    const update = () => {
      const diff = expireAt - Date.now();
      if (diff <= 0) {
        setBlindBoxProduct(null);
        setBlindBoxExpireAt(null);
        setBlindBoxTimeLeft("");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setBlindBoxTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  };

  const addBlindBoxToCart = () => {
    if (blindBoxProduct) {
      addToCart(blindBoxProduct);
      setBlindBoxProduct(null);
      setBlindBoxExpireAt(null);
      setBlindBoxTimeLeft("");
      setBlindBoxOpened(false);
    }
  };

  const buyBlindBoxNow = () => {
    if (blindBoxProduct) {
      const product = blindBoxProduct;
      addToCart(product);
      completeOrder(product.price, [{ ...product, quantity: 1, finalPrice: product.price }]);
      setBlindBoxProduct(null);
      setBlindBoxExpireAt(null);
      setBlindBoxTimeLeft("");
      setBlindBoxOpened(false);
      setLastOrderAmount(product.price);
      setLastOrderItems([{ ...product, quantity: 1, finalPrice: product.price }]);
      setIsBlindBoxOrder(true);
      setView("done");
    }
  };

  const submitMessage = () => {
    const content = messageInput.trim();
    if (!content) return;
    addMessage(content);
    setMessageInput("");
  };

  return (
    <main className="moon-app mx-auto min-h-screen w-full max-w-[460px] bg-paper px-4 pb-24 pt-4 text-ink shadow-soft md:my-6 md:min-h-[860px] md:rounded-[28px]">
      <DeliveryTicker
        orders={activeDeliveries}
        onOpen={() => setOrderPanelOpen(true)}
      />
      <OrderPanel
        orders={activeDeliveries}
        open={orderPanelOpen}
        onClose={() => setOrderPanelOpen(false)}
        onAccelerate={accelerate}
      />
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
                      {money(getTravelUnitPrice(editingCartItem, editingSpecs))}
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
                                <span className={`text-xs ${isSelected ? "text-white/80" : "text-quiet"}`}>
                                  {option.priceDelta > 0 ? `+${option.priceDelta}` : option.priceDelta}
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
                      const unitPrice = getTravelUnitPrice(editingCartItem, editingSpecs);
                      updateCartItemSpecs(
                        editingCartItem.id,
                        editingSpecs,
                        unitPrice
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
      {quickAddProduct && quickAddProduct.specs && quickAddProduct.specs.length > 0 && (
        <AnimatePresence>
          {quickAddProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setQuickAddProduct(null)}
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
                  <ProductVisual product={quickAddProduct} compact />
                  <div className="flex-1">
                    <div className="font-semibold">{quickAddProduct.title}</div>
                    <div className="mt-1 text-lg font-semibold text-price">
                      {money(getTravelUnitPrice(quickAddProduct, quickAddSpecs))}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-3 font-semibold">选择规格</div>
                  {quickAddProduct.specs.map((spec) => (
                    <div key={spec.label} className="mt-3">
                      <div className="mb-2 text-sm text-quiet">{spec.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {spec.options.map((option) => {
                          const isSelected = quickAddSpecs[spec.label] === option.name;
                          return (
                            <button
                              key={option.name}
                              onClick={() =>
                                setQuickAddSpecs((prev) => ({
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
                                <span className={`text-xs ${isSelected ? "text-white/80" : "text-quiet"}`}>
                                  {option.priceDelta > 0 ? `+${option.priceDelta}` : option.priceDelta}
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
                    if (quickAddProduct.category === "旅行") {
                      const { valid, missingFields } = validateTravelSpecs(quickAddProduct, quickAddSpecs);
                      if (!valid) {
                        setSpecHint(`请选择${missingFields.join("、")}`);
                        setTimeout(() => setSpecHint(""), 2500);
                        return;
                      }
                    }
                    const unitPrice = getTravelUnitPrice(quickAddProduct, quickAddSpecs);
                    addToCart(
                      quickAddProduct,
                      quickAddSpecs,
                      unitPrice
                    );
                    setQuickAddProduct(null);
                  }}
                >
                  {quickAddProduct.category === "旅行" ? "立即预订" : "立即下单"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {couponAddProduct && (
        <AnimatePresence>
          {couponAddProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setCouponAddProduct(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-[460px] max-h-[80vh] rounded-t-[32px] bg-white p-5 pb-8 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10" />
                <div className="flex items-center gap-3">
                  <ProductVisual product={couponAddProduct} compact />
                  <div className="flex-1">
                    <div className="font-semibold">{couponAddProduct.title}</div>
                    <div className="mt-1 text-lg font-semibold text-price">
                      {money(getTravelUnitPrice(couponAddProduct, couponAddSpecs))}
                    </div>
                  </div>
                </div>
                {(couponAddProduct.category === "旅行") && (() => {
                  const title = couponAddProduct.title;
                  const isHotel = isHotelProduct(title);
                  const isRental = isRentalProduct(title);
                  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
                  return (
                    <div className="mt-5">
                      <div className="mb-3 font-semibold">选择规格</div>
                      <div className="mt-3">
                        <div className="mb-2 text-sm text-quiet">
                          {isHotel ? "入住日期" : isRental ? "取车/还车日期" : "出发日期"}
                        </div>
                        <div className={`flex ${isHotel || isRental ? "gap-3" : ""}`}>
                          <input
                            type="date"
                            value={couponAddSpecs[isHotel ? "入住日期" : isRental ? "取车日期" : "出发日期"] ?? ""}
                            min={tomorrow}
                            onChange={(e) =>
                              setCouponAddSpecs((prev) => ({
                                ...prev,
                                [isHotel ? "入住日期" : isRental ? "取车日期" : "出发日期"]: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                          />
                          {(isHotel || isRental) && (
                            <>
                              <span className="self-center text-quiet">—</span>
                              <input
                                type="date"
                                value={couponAddSpecs[isHotel ? "退房日期" : "还车日期"] ?? ""}
                                min={couponAddSpecs[isHotel ? "入住日期" : "取车日期"] ?? tomorrow}
                                onChange={(e) =>
                                  setCouponAddSpecs((prev) => ({
                                    ...prev,
                                    [isHotel ? "退房日期" : "还车日期"]: e.target.value,
                                  }))
                                }
                                className="flex-1 rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                              />
                            </>
                          )}
                        </div>
                      </div>
                      {isRental && (
                        <div className="mt-3">
                          <div className="mb-2 text-sm text-quiet">取车/还车时间</div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <div className="mb-1.5 text-xs text-quiet">取车时间</div>
                              <input
                                type="time"
                                value={couponAddSpecs["取车时间"] ?? "10:00"}
                                onChange={(e) =>
                                  setCouponAddSpecs((prev) => ({
                                    ...prev,
                                    取车时间: e.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="mb-1.5 text-xs text-quiet">还车时间</div>
                              <input
                                type="time"
                                value={couponAddSpecs["还车时间"] ?? "10:00"}
                                onChange={(e) =>
                                  setCouponAddSpecs((prev) => ({
                                    ...prev,
                                    还车时间: e.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {isHotel && (
                        <div className="mt-3">
                          <div className="mb-2 text-sm text-quiet">人数（每间房最多2成人+2儿童）</div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <div className="mb-1.5 text-xs text-quiet">成人</div>
                              <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2">
                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                                  onClick={() => setCouponAddSpecs((prev) => ({ ...prev, 成人: String(Math.max(1, Number(prev.成人 ?? "1") - 1)) }))}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="flex-1 text-center text-sm font-semibold">
                                  {couponAddSpecs.成人 ?? "1"}
                                </span>
                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                                  onClick={() => setCouponAddSpecs((prev) => ({ ...prev, 成人: String(Math.min(2, Number(prev.成人 ?? "1") + 1)) }))}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="mb-1.5 text-xs text-quiet">儿童</div>
                              <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2">
                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                                  onClick={() => setCouponAddSpecs((prev) => ({ ...prev, 儿童: String(Math.max(0, Number(prev.儿童 ?? "0") - 1)) }))}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="flex-1 text-center text-sm font-semibold">
                                  {couponAddSpecs.儿童 ?? "0"}
                                </span>
                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                                  onClick={() => setCouponAddSpecs((prev) => ({ ...prev, 儿童: String(Math.min(2, Number(prev.儿童 ?? "0") + 1)) }))}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {couponAddProduct.specs && couponAddProduct.specs.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 font-semibold">选择规格</div>
                    {couponAddProduct.specs.map((spec) => (
                      <div key={spec.label} className="mt-3">
                        <div className="mb-2 text-sm text-quiet">{spec.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {spec.options.map((option) => {
                            const isSelected = couponAddSpecs[spec.label] === option.name;
                            return (
                              <button
                                key={option.name}
                                onClick={() =>
                                  setCouponAddSpecs((prev) => ({
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
                                  <span className={`text-xs ${isSelected ? "text-white/80" : "text-quiet"}`}>
                                    {option.priceDelta > 0 ? `+${option.priceDelta}` : option.priceDelta}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* 数量选择 */}
                <div className="mt-4">
                  <div className="mb-2 text-sm text-quiet">
                    {(() => {
                      if (couponAddProduct.category !== "旅行") return "数量";
                      const title = couponAddProduct.title;
                      if (isHotelProduct(title)) return "房间数";
                      if (isTicketProduct(title)) return "票数";
                      if (isRentalProduct(title)) return "人数";
                      return "人数";
                    })()}
                  </div>
                  <div className="flex items-center gap-3 w-32">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                      onClick={() => setCouponAddQuantity(Math.max(1, couponAddQuantity - 1))}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={couponAddQuantity}
                      onChange={(e) => setCouponAddQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                      className="w-12 text-center text-sm font-semibold outline-none"
                    />
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                      onClick={() => setCouponAddQuantity(Math.min(99, couponAddQuantity + 1))}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)] active:bg-primary/80"
                  onClick={() => {
                    if (couponAddProduct.category === "旅行") {
                      const { valid, missingFields } = validateTravelSpecs(couponAddProduct, couponAddSpecs);
                      if (!valid) {
                        setSpecHint(`请选择${missingFields.join("、")}`);
                        setTimeout(() => setSpecHint(""), 2500);
                        return;
                      }
                    }
                    const unitPrice = getTravelUnitPrice(couponAddProduct, couponAddSpecs);
                    addToCart(
                      couponAddProduct,
                      couponAddSpecs,
                      unitPrice,
                      couponAddQuantity
                    );
                    const newSelected = new Set(selectedCartItems);
                    newSelected.add(couponAddProduct.id);
                    setSelectedCartItems(newSelected);
                    const newCurrentTotal = currentTotal + unitPrice * couponAddQuantity;
                    const newCouponAmount = couponTarget - newCurrentTotal;
                    if (newCouponAmount <= 0) {
                      setFlashMessage(`已添加 ${couponAddProduct.title}，凑单完成！可以结算啦`);
                    } else {
                      setFlashMessage(`已添加 ${couponAddProduct.title}，还差 ${money(newCouponAmount)} 可享9折`);
                    }
                    setTimeout(() => setFlashMessage(""), 2000);
                    setCouponAddProduct(null);
                  }}
                >
                  加入购物车
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
                再买 <span className="text-primary font-semibold">{money(couponAmount)}</span> 可享9折优惠，已领优惠券 <span className="text-primary font-semibold">{money(claimedCouponAmount)}</span>
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
                    <div className="text-sm font-medium truncate">
                      {product.title}
                    </div>
                    <div className="text-primary font-semibold mt-0.5">
                      {money(product.price)}
                    </div>
                  </div>
                  <button
                    onClick={() => addCouponProduct(product)}
                    className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white"
                  >
                    {(product.category === "旅行" || (product.specs && product.specs.length > 0)) ? "去选规格" : "加购"}
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
      <AnimatePresence mode="wait">
        {view === "home" && (
          <Screen key="home">
            <section className="pb-4">
              <div className="sticky top-0 z-20 -mx-4 bg-paper px-4 pb-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="睡前逛逛"
                      className="h-9 w-9 shrink-0 rounded-full bg-white/90 p-1 object-contain shadow-soft"
                    />
                    <div>
                      <div className="text-sm font-semibold">睡前逛逛</div>
                      <div className="text-[10px] text-quiet">Moon Cart</div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-0.5 rounded-full p-1">
                    <button
                      onClick={() => setHomeTab("index")}
                      className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                        homeTab === "index"
                          ? "bg-coral text-white"
                          : "text-quiet"
                      }`}
                    >
                      首页
                    </button>
                    <button
                      onClick={() => setHomeTab("takeout")}
                      className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                        homeTab === "takeout"
                          ? "bg-coral text-white"
                          : "text-quiet"
                      }`}
                    >
                      外卖
                    </button>
                    <button
                      onClick={() => setHomeTab("travel")}
                      className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                        homeTab === "travel"
                          ? "bg-coral text-white"
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
                        openCategory(undefined, homeTab, searchQuery.trim(), "搜索结果");
                      }
                    }}
                    placeholder={homeTab === "takeout" ? "搜索美食、店铺" : homeTab === "travel" ? "搜索酒店、景点、机票" : "今晚想'买'点什么"}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet text-ink"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        openCategory(undefined, homeTab, "", "全部商品");
                      }}
                      className="text-quiet hover:text-ink transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => openCategory(undefined, homeTab, searchQuery.trim(), "搜索结果")}
                      className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                    >
                      逛逛
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
                      { emoji: "🎊", text: "今日低至5折", bg: "from-emerald-500 to-teal-600" },
                      { emoji: "✨", text: "新人专享", bg: "from-amber-500 to-orange-600" },
                      { emoji: "🎁", text: "每日盲盒", bg: "from-lime-500 to-emerald-600" },
                      { emoji: "🔥", text: "热销榜单", bg: "from-orange-500 to-amber-600" },
                    ]
                ).map((banner, i) => (
                  <div
                    key={i}
                    className={`relative shrink-0 w-[70%] h-28 rounded-2xl p-5 flex items-center justify-between overflow-hidden shadow-soft ${
                      i === 0
                        ? "bg-coral text-white"
                        : "bg-coral-light text-coral-deep"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-xl font-medium">{banner.text}</div>
                      <div className="mt-1 text-xs opacity-80">点击查看详情</div>
                    </div>
                    <div className={`relative z-10 text-5xl ${i === 0 ? "opacity-90" : "opacity-60"}`}>{banner.emoji}</div>
                    {i === 0 && (
                      <div className="absolute -right-2 -top-2 text-8xl opacity-20 pointer-events-none select-none">{banner.emoji}</div>
                    )}
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
                      {HOME_CATEGORIES.map((item, idx) => {
                        const CategoryIcon = item.icon;
                        return (
                        <button
                          key={item.label}
                          className="flex min-h-[68px] flex-col items-center gap-1.5 active:scale-95 transition-transform"
                          onClick={() =>
                            openCategory(item.category, homeTab, undefined, item.label, item.label)
                          }
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft text-coral">
                            <CategoryIcon size={22} strokeWidth={2} />
                          </div>
                          <span className="text-[11px] text-quiet font-medium">{item.label}</span>
                        </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center px-2">
                    <button
                      type="button"
                      className="relative h-1.5 w-1/3 min-w-[120px] rounded-full overflow-hidden"
                      onClick={() => setCategoryExpanded((v) => !v)}
                      aria-label="展开或收起分类"
                    >
                      <span className="absolute inset-0 bg-[#efefef]" />
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
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
                        { icon: "🎫", label: "门票", category: "旅行", keyword: "门票|通票|套票|船票|游船|故宫|迪士尼|影城|长隆|野生动物|冰雪|动物园|乐园" },
                        { icon: "🚌", label: "跟团游", category: "旅行", keyword: "跟团|一日游|朝圣|深度游|周边游|亲子游" },
                        { icon: "🚗", label: "租车", category: "旅行", keyword: "租车|自驾" },
                        { icon: "🏖️", label: "度假", category: "旅行", keyword: "度假|马尔代夫|亚特兰蒂斯|巴厘岛度假" },
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
                          setPrevView(view);
                          setView("flight");
                        } else if (homeTab === "takeout") {
                          openTakeoutShops(i.subCategory);
                        } else {
                          openCategory(i.category, homeTab, i.keyword, i.label, i.subCategory);
                        }
                      }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-soft">
                        {item.icon}
                      </div>
                      <span className="text-[11px] text-quiet">{item.label}</span>
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
                    onClick={() => openBlindBox()}
                    className={`w-full rounded-2xl p-5 text-left transition-all shadow-soft ${
                      blindBoxCanOpen
                        ? "bg-white active:scale-[0.98]"
                        : "bg-white/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 shrink-0 rounded-[20px] flex items-center justify-center text-5xl bg-gold">
                        {blindBoxCanOpen ? "🎁" : "🔒"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-ink">神秘惊喜盲盒</div>
                        <div className="mt-1 text-xs text-quiet">
                          {blindBoxCanOpen ? "点我开启今日惊喜" : "明天再来开启新的惊喜"}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-block rounded-full bg-coral/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-deep">
                            1000+款惊喜
                          </span>
                          <span className="inline-block rounded-full bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted">
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
                      : channelCategories["index"].includes(p.category)
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
                          onClick={() => openTakeoutShop(product.shop!)}
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
                            if (product.specs && product.specs.length > 0) {
                              setQuickAddProduct(product);
                              const defaultSpecs: Record<string, string> = {};
                              product.specs?.forEach((spec) => {
                                if (spec.options.length > 0) {
                                  defaultSpecs[spec.label] = spec.options[0].name;
                                }
                              });
                              setQuickAddSpecs(defaultSpecs);
                            } else {
                              addToCart(product);
                            }
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
                        onClick={() => openProduct(product)}
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
                      {homeTab !== "travel" && (
                        <button
                          className="absolute bottom-2 right-3 z-10 h-8 w-8 rounded-full bg-primary shadow-md flex items-center justify-center active:scale-90 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.specs && product.specs.length > 0) {
                              setQuickAddProduct(product);
                              const defaultSpecs: Record<string, string> = {};
                              product.specs?.forEach((spec) => {
                                if (spec.options.length > 0) {
                                  defaultSpecs[spec.label] = spec.options[0].name;
                                }
                              });
                              setQuickAddSpecs(defaultSpecs);
                            } else {
                              addToCart(product);
                            }
                          }}
                        >
                          <ShoppingCart size={14} className="text-white" />
                        </button>
                      )}
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
                  onClick={() => openRecommend()}
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
                  .map((product, index) => {
                    const isLarge = index % 5 === 0;
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={openProduct}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={isFavorite(product.id)}
                        onAddToCart={addToCart}
                        onQuickAdd={handleQuickAdd}
                      />
                    );
                  })}
              </div>
            </section>
          </Screen>
        )}

        {view === "category" && (
          <Screen key="category">
            <Header title="今晚逛哪里" onBack={() => setView("home")} />
            <div className="mt-2 mb-4">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
                <Search size={18} className="text-quiet" />
                <input
                  type="text"
                  maxLength={50}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品名称"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-quiet"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            {searchQuery.trim() ? (
              <div>
                <div className="mb-3 text-sm text-quiet">
                  搜索结果 ({fuzzySearch(products.filter((p) => channelCategories[categoryChannel].includes(p.category)), searchQuery).length})
                </div>
                {fuzzySearch(products.filter((p) => channelCategories[categoryChannel].includes(p.category)), searchQuery).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {fuzzySearch(products.filter((p) => channelCategories[categoryChannel].includes(p.category)), searchQuery).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={openProduct}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={isFavorite(product.id)}
                        onAddToCart={addToCart}
                        onQuickAdd={handleQuickAdd}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-4">🤔</div>
                    <div className="text-base font-medium text-ink mb-2">没有找到相关商品</div>
                    <div className="text-sm text-quiet mb-6">
                      换个关键词试试吧～
                      <br />
                      或者去心愿清单告诉我们你想要什么
                      <br />
                      我们会尽量满足你的愿望 ✨
                    </div>
                    <div className="flex flex-col gap-2 px-8">
                      <button
                        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)]"
                        onClick={() => {
                          setSearchQuery("");
                          setView("wish");
                        }}
                      >
                        去心愿清单许愿
                      </button>
                      <button
                        className="w-full rounded-full bg-black/[0.04] py-3 text-sm font-medium text-ink"
                        onClick={() => setSearchQuery("")}
                      >
                        清除搜索
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {channelCategories[categoryChannel].map((category, index) => (
                  <button
                    key={category}
                    onClick={() => openCategory(category, categoryChannel, "", category)}
                    className="rounded-[24px] bg-white p-5 text-left shadow-soft active:scale-[0.98]"
                  >
                    <div className="mb-8 text-3xl">
                      {
                        [
                          "🍱",
                          "🍓",
                          "🍫",
                          "🧋",
                          "🎧",
                          "💄",
                          "👟",
                          "☕",
                          "🕯",
                          "✈️",
                        ][categories.indexOf(category) % 10]
                      }
                    </div>
                    <div className="text-lg font-semibold">{category}</div>
                    <div className="mt-1 text-sm text-quiet">
                      约 {pickProducts(category).length} 件快乐
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Screen>
        )}

        {view === "list" && (
          <Screen key="list">
            <Header
              title={listTitle || selectedCategory || "随便逛逛"}
              onBack={() => setView("home")}
              right={
                <CartButton count={cartCount} onClick={() => setView("cart")} />
              }
            />
            <div className="hide-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4" ref={listTabScrollCallback}>
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setSubKeyword("");
                  setListTitle("全部商品");
                  setSelectedSubCategory(undefined);
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${!selectedCategory && !subKeyword && !selectedSubCategory ? "bg-primary text-white" : "bg-white text-ink"}`}
              >
                全部
              </button>
              {!listTitle?.includes("搜索") && subCategoriesByChannel[listChannel].map((sub) => {
                const active =
                  selectedSubCategory === sub.label ||
                  (!selectedSubCategory &&
                    (sub.category ?? undefined) === (selectedCategory ?? undefined) &&
                    (sub.keyword ?? "") === subKeyword);
                return (
                  <button
                    key={sub.label}
                    data-label={sub.label}
                    onClick={() => {
                      setSelectedCategory(sub.category);
                      setSubKeyword(sub.keyword ?? "");
                      setListTitle(sub.label);
                      setSelectedSubCategory(sub.subCategory ?? sub.label);
                    }}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${active ? "bg-primary text-white" : "bg-white text-ink"}`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 pb-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={openProduct}
                  onAddToCart={addToCart}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </Screen>
        )}

        {view === "takeoutShops" && (
          <Screen key="takeoutShops">
            <Header
              title={listTitle || "美食外卖"}
              onBack={() => setView("home")}
              right={
                <CartButton count={cartCount} onClick={() => setView("cart")} />
              }
            />
            <div className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
              <Search size={16} className="text-quiet" />
              <input
                type="text"
                maxLength={50}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setView("list");
                  }
                }}
                placeholder="搜索店铺或商品"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-quiet">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="hide-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
              <button
                onClick={() => openTakeoutShops(undefined)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${!takeoutSubCategory ? "bg-primary text-white" : "bg-white text-ink"}`}
              >
                全部
              </button>
              <button onClick={() => openTakeoutShops("快餐便当")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "快餐便当" ? "bg-primary text-white" : "bg-white text-ink"}`}>快餐便当</button>
              <button onClick={() => openTakeoutShops("奶茶饮品")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "奶茶饮品" ? "bg-primary text-white" : "bg-white text-ink"}`}>奶茶饮品</button>
              <button onClick={() => openTakeoutShops("烧烤炸串")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "烧烤炸串" ? "bg-primary text-white" : "bg-white text-ink"}`}>烧烤炸串</button>
              <button onClick={() => openTakeoutShops("蛋糕甜点")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "蛋糕甜点" ? "bg-primary text-white" : "bg-white text-ink"}`}>蛋糕甜点</button>
              <button onClick={() => openTakeoutShops("面食粥品")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "面食粥品" ? "bg-primary text-white" : "bg-white text-ink"}`}>面食粥品</button>
              <button onClick={() => openTakeoutShops("日料寿司")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "日料寿司" ? "bg-primary text-white" : "bg-white text-ink"}`}>日料寿司</button>
              <button onClick={() => openTakeoutShops("披萨意面")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "披萨意面" ? "bg-primary text-white" : "bg-white text-ink"}`}>披萨意面</button>
              <button onClick={() => openTakeoutShops("中式正餐")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "中式正餐" ? "bg-primary text-white" : "bg-white text-ink"}`}>中式正餐</button>
              <button onClick={() => openTakeoutShops("西式快餐")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${takeoutSubCategory === "西式快餐" ? "bg-primary text-white" : "bg-white text-ink"}`}>西式快餐</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 pb-4">
              {getTakeoutShops(takeoutSubCategory).map((shop) => (
                <button
                  key={shop.name}
                  onClick={() => openTakeoutShop(shop.name)}
                  className="w-full rounded-[20px] bg-white p-3 shadow-soft active:scale-[0.98] transition-transform text-left"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-4xl">
                      {shop.image}
                    </div>
                    <div className="w-full">
                      <div className="font-semibold text-sm text-center truncate">{shop.name}</div>
                      <div className="mt-1 flex items-center justify-center gap-2 text-xs text-quiet">
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const full = shop.rating >= i;
                            const half = !full && shop.rating >= i - 0.5;
                            return (
                              <span key={i} className="relative inline-block w-3 h-3">
                                <Star size={12} className="text-yellow-200" />
                                {(full || half) && (
                                  <span
                                    className="absolute top-0 left-0 overflow-hidden"
                                    style={{ width: full ? "100%" : "50%" }}
                                  >
                                    <Star size={12} fill="#FFD700" className="text-yellow-500" />
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </span>
                        <span className="text-yellow-600 font-medium">{shop.rating}</span>
                      </div>
                      <div className="mt-1 text-center text-xs text-quiet">
                        月售{shop.sales} · {shop.deliveryTime}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Screen>
        )}

        {view === "takeoutShop" && (
          <Screen key="takeoutShop">
            <Header
              title={selectedShop || "店铺详情"}
              onBack={() => setView("takeoutShops")}
              right={
                <CartButton count={cartCount} onClick={() => setView("cart")} />
              }
            />
            <div className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
              <Search size={16} className="text-quiet" />
              <input
                type="text"
                maxLength={50}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="今晚想'买'点什么"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-quiet">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pb-4">
              {getShopProducts(selectedShop || "").map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={openProduct}
                  onAddToCart={addToCart}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </Screen>
        )}

        {view === "recommend" && (
          <Screen key="recommend">
            <Header
              title={listTitle || "猜你喜欢"}
              onBack={() => setView("home")}
              right={
                <CartButton count={cartCount} onClick={() => setView("cart")} />
              }
            />
            <div className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
              <Search size={16} className="text-quiet" />
              <input
                type="text"
                maxLength={50}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    openCategory(undefined, homeTab, searchQuery.trim(), "搜索结果");
                  }
                }}
                placeholder="今晚想'买'点什么"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-quiet">
                  <X size={16} />
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => openCategory(undefined, homeTab, searchQuery.trim(), "搜索结果")}
                  className="rounded-full bg-primary px-3 py-1 text-xs text-white"
                >
                  逛逛
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pb-4">
              {products
                .filter((p) => {
                  if (homeTab === "takeout") return p.category === "外卖";
                  if (homeTab === "travel") return p.category === "旅行";
                  return p.category !== "盲盒";
                })
                .filter((p) => !searchQuery.trim() || fuzzySearch([p], searchQuery.trim()).length > 0)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={openProduct}
                  />
                ))}
            </div>
          </Screen>
        )}

        {view === "detail" && (
          <Screen key="detail">
            <Header
              title="商品详情"
              onBack={() => setView(prevView)}
              right={
                <CartButton count={cartCount} onClick={() => setView("cart")} />
              }
            />
            <ProductVisual product={selectedProduct} large />
            <section className="mt-5 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold leading-tight">
                    {selectedProduct.title}
                  </h2>
                  {selectedProduct.shop && selectedProduct.category === "外卖" && (
                    <button
                      onClick={() => openTakeoutShop(selectedProduct.shop!)}
                      className="mt-2 flex items-center gap-1 text-sm text-primary active:opacity-70"
                    >
                      <Store size={14} />
                      <span>{selectedProduct.shop}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                  <p className="mt-2 text-sm text-quiet">
                    销量 {selectedProduct.sales} ·{" "}
                    {Math.floor(selectedProduct.id * 17 + 98)} 条评价
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-semibold text-price">
                    {money(getTravelUnitPrice(selectedProduct, selectedSpecs))}
                  </div>
                  {(() => {
                    const title = selectedProduct.title;
                    if (isRentalProduct(title)) {
                      const info = calculateRentalInfo(calculateSpecPrice(selectedProduct, selectedSpecs), selectedSpecs);
                      return (
                        <div className="mt-0.5 text-xs text-quiet">
                          {info.totalDays > 0 && <span>共{info.totalDays}天/人</span>}
                          {info.overtimeFee > 0 && <span className="ml-1">· 超时费{money(Math.round(info.overtimeFee))}/人</span>}
                          {info.extraDays > 0 && <span className="ml-1">· 超时加1天</span>}
                        </div>
                      );
                    }
                    if (isHotelProduct(title) && getTravelNights(selectedProduct, selectedSpecs) > 1) {
                      return <div className="mt-0.5 text-xs text-quiet">共{getTravelNights(selectedProduct, selectedSpecs)}晚/间</div>;
                    }
                    return null;
                  })()}
                </div>
              </div>
              <p className="mt-5 leading-7 text-quiet">
                {selectedProduct.intro}
              </p>
              <div className="mt-5 grid gap-3">
                <InfoRow
                  label="优惠券"
                  value={selectedProduct.coupon}
                  tone="coral"
                />
                <InfoRow
                  label={selectedProduct.category === "旅行" ? "出行信息" : "配送信息"}
                  value={selectedProduct.category === "旅行" ? "出行前1天发送确认短信，虚拟预订不会实际出行" : "今晚马上送达，实际不会发货"}
                />
              </div>

              {selectedProduct.category === "旅行" && (() => {
                const title = selectedProduct.title;
                const isHotel = isHotelProduct(title);
                const isRental = isRentalProduct(title);
                const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
                return (
                <div className="mt-5">
                  <div className="mb-3 font-semibold">选择规格</div>
                  {/* 日期选择 */}
                  <div className="mt-3">
                    <div className="mb-2 text-sm text-quiet">
                      {isHotel ? "入住日期" : isRental ? "取车/还车日期" : "出发日期"}
                    </div>
                    <div className={`flex ${isHotel || isRental ? "gap-3" : ""}`}>
                      <input
                        type="date"
                        value={selectedSpecs[isHotel ? "入住日期" : isRental ? "取车日期" : "出发日期"] ?? ""}
                        min={tomorrow}
                        onChange={(e) =>
                          setSelectedSpecs((prev) => ({
                            ...prev,
                            [isHotel ? "入住日期" : isRental ? "取车日期" : "出发日期"]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                      />
                      {(isHotel || isRental) && (
                        <>
                          <span className="self-center text-quiet">—</span>
                          <input
                            type="date"
                            value={selectedSpecs[isHotel ? "退房日期" : "还车日期"] ?? ""}
                            min={selectedSpecs[isHotel ? "入住日期" : "取车日期"] ?? tomorrow}
                            onChange={(e) =>
                              setSelectedSpecs((prev) => ({
                                ...prev,
                                [isHotel ? "退房日期" : "还车日期"]: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  {/* 租车时间选择 */}
                  {isRental && (
                    <div className="mt-3">
                      <div className="mb-2 text-sm text-quiet">取车/还车时间</div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="mb-1.5 text-xs text-quiet">取车时间</div>
                          <input
                            type="time"
                            value={selectedSpecs["取车时间"] ?? "10:00"}
                            onChange={(e) =>
                              setSelectedSpecs((prev) => ({
                                ...prev,
                                取车时间: e.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1.5 text-xs text-quiet">还车时间</div>
                          <input
                            type="time"
                            value={selectedSpecs["还车时间"] ?? "10:00"}
                            onChange={(e) =>
                              setSelectedSpecs((prev) => ({
                                ...prev,
                                还车时间: e.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border-0 bg-black/[0.03] px-4 py-3 text-sm outline-none focus:bg-black/[0.05]"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-quiet">
                        可提前30分钟取车 · 还车超时1小时后收超时费，超4小时按1天计费
                      </div>
                    </div>
                  )}
                  {/* 酒店人数选择 */}
                  {isHotel && (
                    <div className="mt-3">
                      <div className="mb-2 text-sm text-quiet">人数（每间房最多2成人+2儿童）</div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="mb-1.5 text-xs text-quiet">成人</div>
                          <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2">
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                              onClick={() => setSelectedSpecs((prev) => ({ ...prev, 成人: String(Math.max(1, Number(prev.成人 ?? "1") - 1)) }))}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="flex-1 text-center text-sm font-semibold">
                              {selectedSpecs.成人 ?? "1"}
                            </span>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                              onClick={() => setSelectedSpecs((prev) => ({ ...prev, 成人: String(Math.min(2, Number(prev.成人 ?? "1") + 1)) }))}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1.5 text-xs text-quiet">儿童</div>
                          <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2">
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                              onClick={() => setSelectedSpecs((prev) => ({ ...prev, 儿童: String(Math.max(0, Number(prev.儿童 ?? "0") - 1)) }))}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="flex-1 text-center text-sm font-semibold">
                              {selectedSpecs.儿童 ?? "0"}
                            </span>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                              onClick={() => setSelectedSpecs((prev) => ({ ...prev, 儿童: String(Math.min(2, Number(prev.儿童 ?? "0") + 1)) }))}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}

              {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                <div className={selectedProduct.category === "旅行" ? "" : "mt-5"}>
                  {selectedProduct.category !== "旅行" && (
                    <div className="mb-3 font-semibold">选择规格</div>
                  )}
                  {selectedProduct.specs.map((spec) => (
                    <div key={spec.label} className="mt-3">
                      <div className="mb-2 text-sm text-quiet">{spec.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {spec.options.map((option) => {
                          const isSelected = selectedSpecs[spec.label] === option.name;
                          return (
                            <button
                              key={option.name}
                              onClick={() =>
                                setSelectedSpecs((prev) => ({
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
                                <span className={`text-xs ${isSelected ? "text-white/80" : "text-quiet"}`}>
                                  {option.priceDelta > 0 ? `+${option.priceDelta}` : option.priceDelta}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 数量选择 */}
              <div className="mt-4">
                <div className="mb-2 text-sm text-quiet">
                  {(() => {
                    if (selectedProduct.category !== "旅行") return "数量";
                    const title = selectedProduct.title;
                    if (isHotelProduct(title)) return "房间数";
                    if (isTicketProduct(title)) return "票数";
                    if (isRentalProduct(title)) return "人数";
                    return "人数";
                  })()}
                </div>
                <div className="flex items-center gap-3 w-32">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                    onClick={() => setProductQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 w-12 rounded-2xl border-0 bg-black/[0.03] px-2 py-2 text-center text-sm font-semibold outline-none"
                  />
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-soft active:scale-90"
                    onClick={() => setProductQuantity((q) => q + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </section>
            {specHint && (
              <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-5 py-2.5 text-sm text-white shadow-lg" onClick={() => setSpecHint("")}>
                {specHint}
              </div>
            )}
            <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[460px] gap-3 bg-paper/95 p-4 backdrop-blur">
              <button
                className={`relative rounded-full bg-white px-4 py-4 font-semibold shadow-soft transition-transform ${
                  favoriteAnimating ? "scale-125" : "scale-100"
                }`}
                onClick={() => {
                  toggleFavorite(selectedProduct);
                  setFavoriteAnimating(true);
                  setTimeout(() => setFavoriteAnimating(false), 300);
                }}
              >
                <Heart
                  size={18}
                  className={`transition-colors ${
                    isFavorite(selectedProduct.id)
                      ? "fill-coral text-coral"
                      : "text-ink"
                  }`}
                />
                {favoriteAnimating && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-12 w-12 animate-ping rounded-full bg-coral/20" />
                  </span>
                )}
              </button>
              <button
                className="flex-1 rounded-full bg-white px-5 py-4 font-semibold shadow-soft"
                onClick={() => {
                  if (selectedProduct.category === "旅行") {
                    const { valid, missingFields } = validateTravelSpecs(selectedProduct, selectedSpecs);
                    if (!valid) {
                      setSpecHint(`请选择${missingFields.join("、")}`);
                      setTimeout(() => setSpecHint(""), 2500);
                      return;
                    }
                  }
                  const unitPrice = getTravelUnitPrice(selectedProduct, selectedSpecs);
                  addToCart(selectedProduct, selectedSpecs, unitPrice, productQuantity);
                }}
              >
                加入购物车
              </button>
              <button
                className="flex-1 rounded-full bg-primary px-5 py-4 font-semibold text-white shadow-soft"
                onClick={() => {
                  if (selectedProduct.category === "旅行") {
                    const { valid, missingFields } = validateTravelSpecs(selectedProduct, selectedSpecs);
                    if (!valid) {
                      setSpecHint(`请选择${missingFields.join("、")}`);
                      setTimeout(() => setSpecHint(""), 2500);
                      return;
                    }
                  }
                  const unitPrice = getTravelUnitPrice(selectedProduct, selectedSpecs);
                  startOrder(unitPrice * productQuantity, [
                    { ...selectedProduct, quantity: productQuantity, selectedSpecs, price: unitPrice, finalPrice: unitPrice },
                  ]);
                }}
              >
                {selectedProduct.category === "旅行" ? "立即预订" : "立即下单"}
              </button>
            </div>
          </Screen>
        )}

        {view === "cart" && (
          <Screen key="cart">
            <Header title="购物车" onBack={() => setView("home")} />
            {flashMessage && (
              <div
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/80 backdrop-blur-md px-5 py-2.5 text-sm text-white shadow-lg border border-white/10"
                onClick={clearFlashMessage}
              >
                {flashMessage}
              </div>
            )}
            {cart.length === 0 ? (
              <EmptyCart onShop={() => openCategory(undefined)} />
            ) : (
              <>
                {showCategoryTabs && (
                  <div className="flex gap-2 mb-3 sticky top-0 z-10 bg-paper pt-1 pb-2">
                    {[
                      { key: "delivery", label: "快递" },
                      { key: "takeout", label: "外卖" },
                      { key: "travel", label: "旅游" },
                    ].map((tab) => {
                      const count = cart.filter((item) =>
                        tab.key === "takeout"
                          ? item.category === "外卖"
                          : tab.key === "travel"
                          ? item.category === "旅行"
                          : item.category !== "外卖" && item.category !== "旅行"
                      ).length;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setCartTab(tab.key as "delivery" | "takeout" | "travel")}
                          className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                            cartTab === tab.key
                              ? "bg-primary text-white shadow-soft"
                              : "bg-black/[0.04] text-quiet"
                          }`}
                        >
                          {tab.label} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>
                )}
                {displayCartItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="text-4xl mb-3">
                      {cartTab === "takeout" ? "🍔" : cartTab === "travel" ? "✈️" : "📦"}
                    </div>
                    <p className="text-sm text-quiet">
                      {cartTab === "takeout" ? "暂无外卖商品" : cartTab === "travel" ? "暂无旅游商品" : "暂无快递商品"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayCartItems.map((item) => (
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
                              borderColor: selectedCartItems.has(item.id) ? '#FF5000' : '#636366',
                              background: selectedCartItems.has(item.id) ? '#FF5000' : '#ffffff',
                            }}
                          >
                            {selectedCartItems.has(item.id) && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
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
                              <span className="w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
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
                )}
                {displayCartSelectedItems.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🎫</span>
                      <div className="text-sm">
                        <span className="font-bold text-primary">领券凑单更划算</span>
                        {couponAmount > 0 && (
                          <div className="text-xs text-quiet mt-0.5">
                            再买 <span className="text-primary font-semibold">{money(couponAmount)}</span> 可享9折
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
                      <span className="font-medium">
                        {displayCartSelectedItems.reduce((sum, item) => sum + item.quantity, 0)} 件
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-quiet">商品总价</span>
                      <span className="font-medium">
                        {money(
                          displayCartSelectedItems.reduce(
                            (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                    {claimedCouponAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-quiet">优惠券</span>
                        <span className="text-primary font-medium">-{money(claimedCouponAmount)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-end justify-between">
                    <span className="text-quiet text-sm">合计</span>
                    <span className="text-2xl font-bold text-price">
                      {money(
                        canUseCoupon
                          ? displayCartSelectedTotal - claimedCouponAmount
                          : displayCartSelectedTotal
                      )}
                    </span>
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
                        borderColor: isDisplayAllSelected ? '#FF5000' : '#636366',
                        background: isDisplayAllSelected ? '#FF5000' : 'transparent',
                      }}
                    >
                      {isDisplayAllSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-quiet">全选</span>
                  </button>
                  {displayCartSelectedItems.length > 0 && (
                    <button
                      onClick={() => {
                        displayCartSelectedItems.forEach((item) => removeFromCart(item.id));
                        const newSelected = new Set(selectedCartItems);
                        displayCartSelectedItems.forEach((item) => newSelected.delete(item.id));
                        setSelectedCartItems(newSelected);
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
                  {displayCartSelectedItems.length === 0 ? (
                    <button
                      className="rounded-full py-2.5 px-5 font-semibold text-white text-sm opacity-40 bg-primary"
                      disabled
                    >
                      请选择
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
                          startOrder(canUseCoupon ? displayCartSelectedTotal - claimedCouponAmount : displayCartSelectedTotal, displayCartSelectedItems);
                        }}
                      >
                        {canCheckout ? "结算" : "直接结算"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </Screen>
        )}

        {view === "delivery" && (
          <Screen key="delivery">
            <Header title="配送进度" onBack={() => setView("home")} />
            {!activeDeliveries.length ? (
              <Centered>
                <div className="text-6xl">🛵</div>
                <h2 className="mt-6 text-2xl font-semibold">暂无配送订单</h2>
                <p className="mt-3 leading-7 text-quiet">
                  先去选一件今晚想买的快乐，下单后这里会显示实时配送进度。
                </p>
                <button
                  className="mt-8 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-soft"
                  onClick={() => openCategory(undefined)}
                >
                  去逛逛
                </button>
              </Centered>
            ) : (
              <div className="space-y-4 pt-4">
                {activeDeliveries.map((order, index) => (
                  <DeliveryCard
                    key={order.id}
                    order={order}
                    index={index}
                    onAccelerate={() => accelerate(order.id)}
                  />
                ))}
              </div>
            )}
          </Screen>
        )}

        {view === "done" && (
          <Screen key="done">
            <Centered>
              <div className="text-7xl">{isBlindBoxOrder ? "🎁" : "🎉"}</div>
              <h2 className="mt-6 text-3xl font-semibold">
                {isBlindBoxOrder ? "盲盒已开启" : "快乐已送达"}
              </h2>
              <p className="mx-auto mt-5 max-w-xs text-lg leading-8 text-quiet">
                {isBlindBoxOrder
                  ? "运气这东西，今晚用在这里了。"
                  : "今天辛苦了。虽然什么都没有收到。但你已经奖励了努力生活的自己。"}
              </p>

              <section className="mt-8 w-full rounded-[20px] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* 订单信息区 */}
                <div className="px-5 py-4 border-b border-black/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-quiet uppercase tracking-wide">
                      {isBlindBoxOrder ? "盲盒开出" : "订单金额"}
                    </span>
                    <span className="text-xs text-quiet">
                      {new Date().toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-ink">
                      {money(lastOrderAmount)}
                    </span>
                    <span className="text-sm text-quiet">虚拟价值</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-mint font-medium">实际支付 ¥0</span>
                    <span className="text-black/10">|</span>
                    <span className="text-primary">快乐值 +100</span>
                  </div>
                </div>

                {/* 商品列表区 */}
                <div className="px-5 py-4 border-b border-black/5">
                  <div className="text-xs font-medium text-quiet uppercase tracking-wide mb-3">
                    {isBlindBoxOrder ? "开出物品" : "购买清单"}
                  </div>
                  <div className="space-y-3">
                    {lastOrderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-[10px] bg-black/[0.03] flex items-center justify-center text-2xl">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {item.title}
                          </span>
                          <span className="text-xs text-quiet shrink-0">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-price">
                          {money(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 分享区 - 仅盲盒订单显示 */}
                {isBlindBoxOrder && (
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold">
                        分享你的盲盒惊喜
                      </div>
                      <div className="text-xs text-quiet mt-0.5">
                        睡前逛逛 · Moon Cart
                      </div>
                    </div>
                    <div className="text-2xl">🎁</div>
                  </div>
                  <button
                    className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)] active:bg-primary/80"
                    onClick={async () => {
                      setShareCardType("blindbox");
                      const canvas = await drawBlindBoxShareCard();
                      if (canvas) {
                        setShareCardImage(canvas.toDataURL("image/jpeg", 0.9));
                        setSharePanelOpen(true);
                      }
                    }}
                  >
                    分享惊喜卡片
                  </button>
                </div>
                )}
              </section>

              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button
                  className="rounded-full bg-white py-4 font-semibold shadow-soft"
                  onClick={() => openCategory(undefined)}
                >
                  继续逛逛
                </button>
                <button
                  className="rounded-full bg-primary py-4 font-semibold text-white shadow-soft"
                  onClick={() => setView("home")}
                >
                  返回首页
                </button>
              </div>
            </Centered>
          </Screen>
        )}

        {view === "mine" && (
          <Screen key="mine">
            <Header title="我的" onBack={() => setView("home")} right={
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-full bg-black/5 p-2 text-quiet hover:bg-black/10 transition-colors"
                aria-label={darkMode ? "切换到浅色模式" : "切换到深色模式"}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            } />
            <section className="mt-4 rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAvatarPickerOpen(true)}
                  className="h-16 w-16 shrink-0 rounded-full bg-primary flex items-center justify-center text-3xl active:scale-95 transition-transform shadow-[0_4px_12px_rgba(255,80,0,0.3)]"
                >
                  {stats.avatar || "🌙"}
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => {
                      setNicknameInput(stats.nickname || "");
                      setNicknameEditorOpen(true);
                    }}
                    className="flex items-center gap-2 active:opacity-70"
                  >
                    <span className="text-lg font-semibold text-ink truncate">
                      {stats.nickname || "睡前逛逛用户"}
                    </span>
                    <span className="text-quiet text-sm">✏️</span>
                  </button>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => setView("memberLevel")}
                      className="inline-flex items-center gap-1.5 active:opacity-70 rounded-full bg-black/[0.05] px-3 py-1"
                    >
                      <span className="text-sm">{getMemberLevel(stats.virtualSpend).icon}</span>
                      <span className="text-[11px] font-medium text-quiet">{getMemberLevel(stats.virtualSpend).name}</span>
                      <ChevronRight size={10} className="text-quiet" />
                    </button>
                  </div>
                  <div className="mt-1.5 text-xs text-quiet">
                    累计消费 <span className="font-semibold text-ink">{shortMoney(stats.virtualSpend)}</span>
                  </div>
                </div>
              </div>
              {(() => {
                const level = getMemberLevel(stats.virtualSpend);
                const next = getNextLevel(stats.virtualSpend);
                if (!next) return null;
                const progress = ((stats.virtualSpend - level.threshold) / (next.threshold - level.threshold)) * 100;
                return (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-quiet mb-2">
                      <span>距离 {next.name}</span>
                      <span>还需 {shortMoney(next.threshold - stats.virtualSpend)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden bg-black/[0.05]">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </section>

            <section className="mt-4 rounded-2xl bg-white p-5 shadow-soft">
              <div className="grid grid-cols-4 gap-2">
                <button
                  className="text-center"
                  onClick={() => setView("orders")}
                >
                  <div className="text-xl font-semibold text-ink">
                    {stats.happyCount}
                  </div>
                  <div className="mt-1 text-xs text-quiet">快乐次数</div>
                </button>
                <div className="text-center">
                  <div className="text-xl font-semibold text-ink">
                    {stats.streak}
                  </div>
                  <div className="mt-1 text-xs text-quiet">连续打卡</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-ink">
                    {stats.viewedProducts}
                  </div>
                  <div className="mt-1 text-xs text-quiet">浏览商品</div>
                </div>
                <button
                  className="text-center"
                  onClick={() => setView("favorites")}
                >
                  <div className="text-xl font-semibold text-coral">
                    {(stats.favorites ?? []).length}
                  </div>
                  <div className="mt-1 text-xs text-quiet">收藏</div>
                </button>
              </div>
            </section>

            <section className="mt-4 rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">最近逛逛</span>
                  <span className="text-xs text-quiet">{stats.purchases?.length ?? 0} 次快乐</span>
                </div>
                <button
                  className="text-xs text-primary font-medium"
                  onClick={() => {
                    setOrdersTab("all");
                    setView("orders");
                  }}
                >
                  全部 ›
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {(stats.purchases ?? []).slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 w-14 h-14 rounded-[14px] bg-black/[0.03] flex items-center justify-center text-2xl"
                  >
                    {item.items?.[0]?.emoji || "🛒"}
                  </div>
                ))}
                {(stats.purchases?.length ?? 0) === 0 && (
                  <div className="text-sm text-quiet py-3">还没有逛逛记录</div>
                )}
              </div>
            </section>

            <section className="mt-4">
              <button
                className="w-full rounded-[16px] bg-primary py-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.25)] active:opacity-80 transition-opacity"
                onClick={shareCard}
              >
                分享我的快乐
              </button>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">我的徽章</span>
                {earnedBadges.length > 10 && (
                  <button
                    onClick={() => setShowAllBadges(!showAllBadges)}
                    className="text-sm text-primary"
                  >
                    {showAllBadges ? "收起" : "查看更多"}
                  </button>
                )}
              </div>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-5 gap-x-1 gap-y-3">
                  {(showAllBadges ? earnedBadges : earnedBadges.slice(0, 10)).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center"
                      title={badge.description}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                        {badge.icon}
                      </div>
                      <span className="mt-1 w-full text-center text-[10px] text-text">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-quiet">
                  还没有获得徽章，快去逛逛吧～
                </div>
              )}
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">心愿清单</span>
                <button
                  className="rounded-full bg-black/5 px-3 py-2 text-sm font-semibold"
                  onClick={() => setView("wish")}
                >
                  管理
                </button>
              </div>
              {stats.wishlist?.length ? (
                <div className="flex flex-wrap gap-2">
                  {stats.wishlist.slice(0, 6).map((wish) => (
                    <span
                      key={wish.id}
                      className="rounded-full bg-coral/10 px-3 py-2 text-sm font-semibold text-coral"
                    >
                      {wish.title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-quiet">
                  还没有心愿。找不到想买的东西时，可以先写进这里。
                </p>
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
              <button
                className="mt-3 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white"
                onClick={submitMessage}
              >
                提交留言
              </button>
            </section>
          </Screen>
        )}

        {view === "orders" && (
          <Screen key="orders">
            <Header title="我的逛逛" onBack={() => setView("mine")} />
            <section className="mt-4">
              {(() => {
                const unviewedTravelOrders = activeDeliveries.filter(order => 
                  order.channel === "travel" && !viewedTravelOrders.has(order.id)
                );
                const nonTravelOrders = activeDeliveries.filter(order => 
                  order.channel !== "travel"
                );
                const shouldShowBanner = unviewedTravelOrders.length > 0 || nonTravelOrders.length > 0;
                if (!shouldShowBanner) return null;
                return (
                  <div className="mb-4 rounded-[20px] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary">
                        🚀 {unviewedTravelOrders.length > 0 && nonTravelOrders.length === 0 ? "待出行" : "配送中"} ({activeDeliveries.length})
                      </span>
                      <button
                        className="text-xs text-quiet"
                        onClick={() => {
                          activeDeliveries.forEach(order => {
                            if (order.channel === "travel") {
                              setViewedTravelOrders(prev => new Set([...Array.from(prev), order.id]));
                            }
                          });
                          setView("delivery");
                        }}
                      >
                        查看详情 ›
                      </button>
                    </div>
                    <div className="hide-scrollbar flex gap-3 overflow-x-auto">
                      {activeDeliveries.map((order, index) => {
                        const steps = getDeliverySteps(order.channel);
                        const isTravel = order.channel === "travel";
                        const isViewed = isTravel && viewedTravelOrders.has(order.id);
                        let progressPercent = 0;
                        let statusLabel = "";
                        if (isTravel && order.travelStartDate) {
                          const countdown = calculateTravelCountdown(
                            order.travelStartDate,
                            order.createdAt,
                            order.items[0]?.selectedSpecs
                              ? Math.round(
                                  ((parseLocalDate(
                                    order.items[0].selectedSpecs["退房日期"] ||
                                    order.items[0].selectedSpecs["还车日期"] ||
                                    order.travelStartDate
                                  )?.getTime() || 0) -
                                    (parseLocalDate(order.travelStartDate)?.getTime() || 0)) /
                                    86400000
                                )
                              : 1
                          );
                          progressPercent = countdown.progress;
                          statusLabel = countdown.displayText;
                        } else {
                          progressPercent = ((order.stepIndex + 1) / steps.length) * 100;
                          statusLabel = steps[order.stepIndex];
                        }
                        if (isTravel && isViewed) {
                          return null;
                        }
                        return (
                        <button
                          key={order.id}
                          className="min-w-[200px] flex-1 rounded-[14px] bg-black/[0.03] p-3 text-left"
                          onClick={() => {
                            if (isTravel) {
                              setViewedTravelOrders(prev => new Set([...Array.from(prev), order.id]));
                            }
                            setView("delivery");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-quiet">
                              订单 {index + 1}
                            </span>
                            <span className="text-xs font-medium text-primary">
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-medium truncate">
                            {order.items[0]?.emoji} {order.items[0]?.title}
                          </div>
                          <div className="mt-2 h-1 rounded-full bg-black/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-quiet">
                            {statusLabel}
                            {isTravel && !isViewed && (
                              <span className="ml-1 text-primary">· 点击查看详情</span>
                            )}
                          </div>
                        </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft mb-4">
                <Search size={18} className="text-quiet shrink-0" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="搜索订单号"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-quiet"
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery("")}
                    className="text-quiet shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-5 px-5">
                {[
                  { label: "全部逛逛", value: "all" },
                  { label: "快递逛逛", value: "delivery" },
                  { label: "外卖逛逛", value: "takeout" },
                  { label: "旅游逛逛", value: "travel" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setOrdersTab(tab.value as "all" | "delivery" | "takeout" | "travel")}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-all ${
                      ordersTab === tab.value
                        ? "bg-primary text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)]"
                        : "bg-white text-quiet"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5">
                {[
                  { label: "全部状态", value: "all" },
                  { label: "待付款", value: "pending" },
                  { label: "进行中", value: "shipping" },
                  { label: "已完成", value: "completed" },
                  { label: "售后中", value: "aftersale" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setOrderStatusFilter(status.value as "all" | "pending" | "shipping" | "completed" | "aftersale")}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs transition-all ${
                      orderStatusFilter === status.value
                        ? "bg-black/10 text-ink"
                        : "bg-black/[0.03] text-quiet"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
              {ordersTab === "all" && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5">
                  {[
                    { label: "全部时间", value: "all" },
                    { label: "近7天", value: "7d" },
                    { label: "近30天", value: "30d" },
                    { label: "今年", value: "year" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setOrderFilter(filter.value)}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs transition-all ${
                        orderFilter === filter.value
                          ? "bg-black/10 text-ink"
                          : "bg-black/[0.03] text-quiet"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold">
                  {ordersTab === "all" ? "全部逛逛" : ordersTab === "delivery" ? "快递逛逛" : ordersTab === "takeout" ? "外卖逛逛" : "旅游逛逛"}
                </span>
                <span className="text-xs text-quiet">
                  共 {filteredOrdersByTab.length} 次
                </span>
              </div>
              {filteredOrdersByTab.length ? (
                <div className="space-y-3">
                  {filteredOrdersByTab.map((record) => {
                    const isTravelOrder = record.items.some((i) => i.category === "旅行");
                    const travelStart = record.travelStartDate
                      || record.items[0]?.selectedSpecs?.["出发日期"]
                      || record.items[0]?.selectedSpecs?.["入住日期"]
                      || record.items[0]?.selectedSpecs?.["取车日期"];
                    const travelEnd = record.items[0]?.selectedSpecs?.["退房日期"]
                      || record.items[0]?.selectedSpecs?.["还车日期"]
                      || record.items[0]?.selectedSpecs?.["返程日期"];
                    const travelNights = travelStart && travelEnd
                      ? Math.max(1, Math.round(((parseLocalDate(travelEnd)?.getTime() || 0) - (parseLocalDate(travelStart)?.getTime() || 0)) / 86400000))
                      : 1;
                    const countdown = travelStart
                      ? calculateTravelCountdown(travelStart, record.createdAt, travelNights)
                      : null;
                    const isDeparted = countdown && (countdown.status === "traveling" || countdown.status === "completed");
                    return (
                      <div key={record.id} className="space-y-2">
                        {isTravelOrder && travelStart && countdown && (
                          <div className="rounded-2xl bg-white p-4 shadow-soft">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{record.items[0]?.emoji}</span>
                                <div>
                                  <div className="text-sm font-medium text-ink">{record.items[0]?.title}</div>
                                  <div className="text-[11px] text-quiet mt-0.5">
                                    出发日期 · {(() => {
                                      const match = travelStart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
                                      if (!match) return travelStart;
                                      const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
                                      return d.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
                                    })()}
                                  </div>
                                </div>
                              </div>
                              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                isDeparted
                                  ? "bg-mint/10 text-mint"
                                  : "bg-coral/10 text-coral-deep"
                              }`}>
                                {isDeparted ? "已经出发" : "待出发"}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isDeparted ? "bg-mint" : "bg-coral"
                                  }`}
                                  style={{ width: `${countdown.progress}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${isDeparted ? "text-mint" : "text-coral-deep"}`}>
                                {countdown.displayText}
                              </span>
                            </div>
                          </div>
                        )}
                        <OrderCard record={record} onAfterSale={applyAfterSale} onAfterSaleComplete={completeAfterSale} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[20px] bg-white/70 backdrop-blur-md border border-white/50 p-8 text-center">
                  <div className="text-4xl">🛍️</div>
                  <p className="mt-3 text-sm text-quiet">
                    还没有逛逛记录
                  </p>
                </div>
              )}
            </section>
          </Screen>
        )}

        {view === "favorites" && (
          <Screen key="favorites">
            <Header title="我的收藏" onBack={() => setView("mine")} right={
              <span className="text-sm text-quiet">
                {(stats.favorites ?? []).length} 件
              </span>
            } />
            {(stats.favorites ?? []).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mt-4 pb-4">
                {(stats.favorites ?? []).map((fav) => (
                  <ProductCard
                    key={fav.productId}
                    product={fav.product}
                    onClick={openProduct}
                    showFavorite={false}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-20 text-center">
                <div className="text-6xl mb-4">❤️</div>
                <div className="text-lg font-semibold text-ink">还没有收藏</div>
                <div className="mt-2 text-sm text-quiet">喜欢的商品可以点收藏哦</div>
                <button
                  className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white"
                  onClick={() => setView("home")}
                >
                  去逛逛
                </button>
              </div>
            )}
          </Screen>
        )}

        {view === "memberLevel" && (
          <Screen key="memberLevel">
            <Header title="会员等级" onBack={() => setView("mine")} />
            <section className="mt-4 rounded-[28px] bg-white p-6 shadow-soft">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${getMemberLevel(stats.virtualSpend).bgColor}`}>
                  {getMemberLevel(stats.virtualSpend).icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{getMemberLevel(stats.virtualSpend).name}</span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">当前</span>
                  </div>
                  <div className="mt-1 text-sm text-quiet">
                    累计消费 <span className="font-semibold text-ink">{shortMoney(stats.virtualSpend)}</span>
                  </div>
                </div>
              </div>
              {(() => {
                const level = getMemberLevel(stats.virtualSpend);
                const next = getNextLevel(stats.virtualSpend);
                if (!next) return null;
                const progress = ((stats.virtualSpend - level.threshold) / (next.threshold - level.threshold)) * 100;
                return (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-quiet mb-2">
                      <span>距离 {next.name}</span>
                      <span>还需 {shortMoney(next.threshold - stats.virtualSpend)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%`, background: level.gradient }}
                      />
                    </div>
                  </div>
                );
              })()}
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">等级权益</div>
              <div className="space-y-3">
                {MEMBER_LEVELS.map((level) => {
                  const current = getMemberLevel(stats.virtualSpend);
                  const isCurrent = current.name === level.name;
                  const isUnlocked = stats.virtualSpend >= level.threshold;
                  return (
                    <div
                      key={level.name}
                      className={`flex items-center gap-3 rounded-[16px] p-3 ${isCurrent ? "bg-primary/5 border border-primary/20" : isUnlocked ? "bg-black/[0.03]" : "bg-black/[0.02] opacity-50"}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${level.bgColor}`}>
                        {level.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{level.name}</span>
                          {isCurrent && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">当前</span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-quiet">
                          累计消费 ≥ {shortMoney(level.threshold)}
                        </div>
                      </div>
                      {isUnlocked ? (
                        <span className="text-green-500 text-sm">✓ 已达成</span>
                      ) : (
                        <span className="text-quiet text-xs">还差 {shortMoney(level.threshold - stats.virtualSpend)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
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
              <button
                className="mt-3 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white"
                onClick={submitWish}
              >
                加入心愿清单
              </button>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">我的心愿</div>
              {stats.wishlist?.length ? (
                <div className="space-y-3">
                  {stats.wishlist.map((wish) => (
                    <div
                      key={wish.id}
                      className="flex items-center justify-between gap-3 rounded-[22px] bg-black/[0.03] p-3"
                    >
                      <div>
                        <div className="font-semibold">{wish.title}</div>
                        <div className="mt-1 text-xs text-quiet">
                          {formatPurchaseDate(wish.createdAt)}
                        </div>
                      </div>
                      <IconButton
                        label="删除"
                        onClick={() => removeFromWishlist(wish.id)}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-quiet">
                  还没有心愿。看到想买又没有的东西，就把它写下来。
                </p>
              )}
            </section>
          </Screen>
        )}

        {isAdmin && view === "admin" && (
          <Screen key="admin">
            <Header title="本地后台" onBack={() => setView("mine")} />
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">数据概览</span>
                <span className="text-xs text-quiet">LocalStorage</span>
              </div>
              <InfoRow
                label="心愿数量"
                value={`${stats.wishlist?.length ?? 0}`}
              />
              <InfoRow
                label="留言数量"
                value={`${stats.messages?.length ?? 0}`}
              />
              <InfoRow
                label="买过记录"
                value={`${stats.purchases?.length ?? 0}`}
              />
              <InfoRow
                label="累计虚拟消费"
                value={money(stats.virtualSpend)}
                tone="coral"
              />
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">用户心愿</div>
              {stats.wishlist?.length ? (
                <div className="space-y-2">
                  {stats.wishlist.map((wish) => (
                    <div
                      key={wish.id}
                      className="rounded-[20px] bg-black/[0.03] p-3"
                    >
                      <div className="font-semibold">{wish.title}</div>
                      <div className="mt-1 text-xs text-quiet">
                        {formatPurchaseDate(wish.createdAt)}
                      </div>
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
                    <div
                      key={message.id}
                      className="rounded-[20px] bg-black/[0.03] p-3"
                    >
                      <div className="leading-6">{message.content}</div>
                      <div className="mt-2 text-xs text-quiet">
                        {formatPurchaseDate(message.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-quiet">暂无留言。</p>
              )}
            </section>
          </Screen>
        )}

        {view === "flight" && (
          <Screen key="flight">
            <Header title="机票预订" onBack={() => setView(prevView)} />

            <div className="mt-4 mx-2 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="flex rounded-[20px] overflow-hidden bg-black/[0.03] p-1">
                <button
                  onClick={() => setFlightTripType("oneway")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all rounded-[16px] ${
                    flightTripType === "oneway" ? "bg-white text-primary shadow-sm" : "text-quiet"
                  }`}
                >
                  单程
                </button>
                <button
                  onClick={() => setFlightTripType("roundtrip")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all rounded-[16px] ${
                    flightTripType === "roundtrip" ? "bg-white text-primary shadow-sm" : "text-quiet"
                  }`}
                >
                  往返
                </button>
              </div>

              <div className="mt-5">
                <div className="flex gap-3 mb-1">
                  <div className="flex-1 text-xs text-quiet">出发地</div>
                  <div className="w-7"></div>
                  <div className="flex-1 text-xs text-quiet">目的地</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => { setFlightCityPicker("from"); setFlightCityKeyword(""); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2 rounded-[16px] bg-black/[0.03] px-4 py-3 active:scale-[0.98] transition-transform">
                        <span className="text-lg">📍</span>
                        <span className="font-semibold">{flightFrom}</span>
                        <svg className="ml-auto h-5 w-5 text-quiet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const temp = flightFrom;
                      setFlightFrom(flightTo);
                      setFlightTo(temp);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-soft active:scale-90 transition-transform"
                  >
                    {flightTripType === "oneway" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l6 6-6 6" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l-4 4 4 4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 14h14" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l4-4-4-4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => { setFlightCityPicker("to"); setFlightCityKeyword(""); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2 rounded-[16px] bg-black/[0.03] px-4 py-3 active:scale-[0.98] transition-transform">
                        <span className="text-lg">📍</span>
                        <span className="font-semibold">{flightTo}</span>
                        <svg className="ml-auto h-5 w-5 text-quiet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-xs text-quiet">出发日期</div>
                  <div className="relative flex h-12 items-center justify-center rounded-[16px] bg-black/[0.03] px-3">
                    <div className="text-[14px] font-semibold text-[#1c1c1e] text-center truncate">
                      {flightDate ? `${parseInt(flightDate.slice(5, 7))}月${parseInt(flightDate.slice(8, 10))}日` : "请选择"}
                    </div>
                    <input
                      type="date"
                      value={flightDate}
                      min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setFlightDate(newDate);
                        if (flightTripType === "roundtrip" && flightReturnDate && flightReturnDate < newDate) {
                          setFlightReturnDate(newDate);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                {flightTripType === "roundtrip" && (
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 text-xs text-quiet">返程日期</div>
                    <div className="relative flex h-12 items-center justify-center rounded-[16px] bg-black/[0.03] px-3">
                      <div className="text-[14px] font-semibold text-[#1c1c1e] text-center truncate">
                        {flightReturnDate ? `${parseInt(flightReturnDate.slice(5, 7))}月${parseInt(flightReturnDate.slice(8, 10))}日` : "请选择"}
                      </div>
                      <input
                        type="date"
                        value={flightReturnDate}
                        min={flightDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                        onChange={(e) => setFlightReturnDate(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-black/[0.03] px-4 py-2">
                    <button
                      onClick={() => setFlightAdults(Math.max(1, flightAdults - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold whitespace-nowrap">{flightAdults}成人</span>
                    <button
                      onClick={() => setFlightAdults(Math.min(9, flightAdults + 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  {flightChildren > 0 && (
                    <div className="flex items-center gap-2 rounded-full bg-black/[0.03] px-4 py-2">
                      <button
                        onClick={() => setFlightChildren(Math.max(0, flightChildren - 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold whitespace-nowrap">{flightChildren}儿童</span>
                      <button
                        onClick={() => setFlightChildren(Math.min(5, flightChildren + 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setFlightChildren(Math.min(5, flightChildren + 1))}
                    className="text-xs text-primary whitespace-nowrap"
                  >
                    +儿童
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {([
                    { key: "economy", label: "经济舱" },
                    { key: "business", label: "公务舱" },
                    { key: "first", label: "头等舱" },
                  ] as const).map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setFlightCabin(c.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                        flightCabin === c.key ? "bg-primary/10 text-primary" : "bg-black/[0.03] text-quiet"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={!flightDate || flightFrom === flightTo || flightSearching}
                className="mt-6 w-full rounded-full py-4 text-base font-semibold text-white shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
                style={{ background: "linear-gradient(90deg, #FF5000 0%, #FF8A00 100%)", boxShadow: "0 8px 20px rgba(255,80,0,0.35)" }}
                onClick={() => runFlightSearch()}
              >
                {flightSearching ? "搜索中..." : !flightDate ? "请选择日期" : "搜索机票"}
              </button>
              {flightDate && flightFrom === flightTo && (
                <p className="mt-2 text-center text-xs text-red-500">出发地与目的地不能相同</p>
              )}
            </div>

            {flightSearching && (
              <div className="mt-4 mx-4 rounded-[20px] bg-white p-8 text-center shadow-soft">
                <div className="text-4xl animate-bounce">🛫</div>
                <p className="mt-3 text-sm text-quiet">正在查询 {flightFrom} → {flightTo} 航班...</p>
              </div>
            )}

            {flightResults && flightResults.length > 0 && (
              <div className="mt-4 mx-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold">{flightFrom} → {flightTo}</span>
                    <span className="ml-2 text-xs text-quiet">{flightDate} · 共 {flightResults.length} 个航班</span>
                  </div>
                  <button
                    onClick={() => { setFlightResults(null); }}
                    className="text-xs text-primary"
                  >
                    重新搜索
                  </button>
                </div>
                <div className="flex gap-2 mb-3">
                  {([
                    { key: "price", label: "价格低→高" },
                    { key: "time", label: "时间早→晚" },
                    { key: "duration", label: "时长短→长" },
                  ] as const).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setFlightSortBy(s.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        flightSortBy === s.key ? "bg-primary text-white" : "bg-white text-quiet shadow-soft"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {sortedFlightResults.map((flight) => {
                    const durH = Math.floor(flight.durationMin / 60);
                    const durM = flight.durationMin % 60;
                    const cabinLabel = flight.cabin === "economy" ? "经济舱" : flight.cabin === "business" ? "公务舱" : "头等舱";
                    return (
                      <button
                        key={flight.id}
                        onClick={() => {
                          setSelectedFlight(flight);
                          setFlightBaggage("none");
                          setView("flightBooking");
                        }}
                        className="w-full rounded-[20px] bg-white p-4 shadow-soft active:scale-[0.98] transition-transform text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-full text-base"
                              style={{ backgroundColor: `${flight.color}15` }}
                            >
                              {flight.logo}
                            </span>
                            <div>
                              <div className="text-[13px] font-semibold text-[#1c1c1e]">{flight.airline}</div>
                              <div className="text-[11px] text-quiet">
                                {flight.flightNo} · {flight.aircraft} · {flight.stops === 0 ? "直飞" : `${flight.transferCity}转机`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: "#FF5000" }}>¥{flight.price}</div>
                            <div className="text-[11px] text-quiet">{cabinLabel} · {flight.onTimeRate}%准点</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-base font-semibold text-[#1c1c1e]">{flight.departTime}</div>
                            <div className="text-[11px] text-quiet">{flight.departAirport}</div>
                          </div>
                          <div className="flex-1 mx-3 relative">
                            <div className="h-[1px] bg-black/10 w-full"></div>
                            <div className="absolute left-1/2 -translate-x-1/2 -top-[7px] bg-white px-1.5 text-[10px] text-quiet whitespace-nowrap">
                              {flight.stops === 0 ? "直飞" : `${flight.transferCity}转`} · {durH}h{durM}m
                            </div>
                            <div className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-black/20"></div>
                            <div className="absolute -right-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-black/20"></div>
                            <div className="mt-2 text-center text-[10px]">✈️</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-semibold text-[#1c1c1e]">{flight.arriveTime}</div>
                            <div className="text-[11px] text-quiet">{flight.arriveAirport}</div>
                          </div>
                        </div>
                        {flight.seatsLeft > 0 && flight.seatsLeft <= 5 && (
                          <div className="mt-2 text-[11px] text-[#FF5000]">仅剩 {flight.seatsLeft} 座 · 涨价中</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!flightResults && !flightSearching && (
              <div className="mt-4 mx-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">热门航线</span>
                  <button
                    onClick={() => setHotRoutesSeed(Date.now())}
                    className="text-xs text-primary"
                  >
                    换一批
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {hotRoutes.map((route) => (
                    <button
                      key={`${route.from}-${route.to}`}
                      onClick={() => {
                        runFlightSearch({ from: route.from, to: route.to });
                      }}
                      className="flex items-center justify-between rounded-[20px] bg-white p-4 shadow-soft active:scale-95 transition-transform"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{route.from}</span>
                          <span className="text-quiet">→</span>
                          <span className="font-semibold">{route.to}</span>
                        </div>
                        <div className="mt-1 text-xs text-quiet">今日最低</div>
                      </div>
                      <span className="text-primary font-semibold">¥{route.price}</span>
                    </button>
                  ))}
                </div>

                {/* 随机推荐航线 */}
                <div className="flex items-center justify-between mb-3 mt-6">
                  <span className="font-semibold">猜你喜欢</span>
                  <button
                    onClick={() => setRecommendSeed(Date.now())}
                    className="text-xs text-primary"
                  >
                    换一批
                  </button>
                </div>
                <div className="space-y-3">
                  {recommendedRoutes.map((route) => (
                    <button
                      key={`rec-${route.from}-${route.to}`}
                      onClick={() => {
                        runFlightSearch({ from: route.from, to: route.to });
                      }}
                      className="w-full flex items-center justify-between rounded-[20px] bg-white p-4 shadow-soft active:scale-95 transition-transform"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                          ✈️
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{route.from}</span>
                            <span className="text-quiet">→</span>
                            <span className="font-semibold">{route.to}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-quiet">
                            {route.tag} · {route.duration}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-semibold">¥{route.price}</div>
                        <div className="text-xs text-quiet">起</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Screen>
        )}

        {view === "flightBooking" && selectedFlight && (() => {
          const flight = selectedFlight;
          const durH = Math.floor(flight.durationMin / 60);
          const durM = flight.durationMin % 60;
          const cabinLabel = flight.cabin === "economy" ? "经济舱" : flight.cabin === "business" ? "公务舱" : "头等舱";
          const transferLabel = flight.stops === 0 ? "直飞" : `${flight.transferCity}转机`;
          const pax = flightAdults + flightChildren;
          const baggageOptions = [
            { key: "none" as const, label: "无免费行李", desc: "仅随身小包 7kg", price: 0 },
            { key: "20kg" as const, label: "20kg 托运", desc: "标准托运行李", price: 80 },
            { key: "40kg" as const, label: "40kg 托运", desc: "超大托运行李", price: 180 },
          ];
          const flightCartItem: CartItem = {
            id: Number(flight.id.replace(/\D/g, "")) || Date.now(),
            title: `${flightFrom}→${flightTo} ${flight.airline} ${flight.flightNo}`,
            price: flight.price,
            finalPrice: flightTotalPrice,
            quantity: pax,
            image: flight.logo,
            emoji: flight.logo,
            palette: flight.color,
            category: "旅行",
            sales: `${flight.onTimeRate}%准点`,
            coupon: `${flightDate} ${flight.departTime} 起飞`,
            tags: [cabinLabel, transferLabel, `${durH}h${durM}m`],
            intro: `${flight.departAirport} → ${flight.arriveAirport}`,
            selectedSpecs: {
              航班: flight.flightNo,
              舱型: cabinLabel,
              航程: transferLabel,
              日期: flightDate,
              行李: flightBaggage === "none" ? "无托运" : `${flightBaggage} +¥${flightBaggagePrice}`,
              人数: `${flightAdults}成人${flightChildren > 0 ? `+${flightChildren}儿童` : ""}`,
            },
          };
          return (
            <Screen key="flightBooking">
              <Header title="航班预订" onBack={() => setView("flight")} />

              {/* 航班信息卡 */}
              <div className="mt-4 mx-3 rounded-[24px] bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: `${flight.color}15` }}
                    >
                      {flight.logo}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#1c1c1e]">{flight.airline}</div>
                      <div className="text-xs text-quiet">{flight.flightNo} · {flight.aircraft} · {transferLabel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-quiet">{flightDate}</div>
                    <div className="text-xs text-quiet">{cabinLabel}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#1c1c1e]">{flight.departTime}</div>
                    <div className="text-xs text-quiet mt-0.5">{flightFrom}</div>
                    <div className="text-[10px] text-quiet">{flight.departAirport}</div>
                  </div>
                  <div className="flex-1 mx-3 relative">
                    <div className="h-[1px] bg-black/10 w-full"></div>
                    <div className="absolute left-1/2 -translate-x-1/2 -top-[7px] bg-white px-1.5 text-[10px] text-quiet whitespace-nowrap">
                      {transferLabel} · {durH}h{durM}m
                    </div>
                    <div className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-black/20"></div>
                    <div className="absolute -right-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-black/20"></div>
                    <div className="mt-2 text-center text-xs">✈️</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#1c1c1e]">{flight.arriveTime}</div>
                    <div className="text-xs text-quiet mt-0.5">{flightTo}</div>
                    <div className="text-[10px] text-quiet">{flight.arriveAirport}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs text-quiet">
                  <span>准点率 {flight.onTimeRate}%</span>
                  {flight.seatsLeft > 0 && flight.seatsLeft <= 5 ? (
                    <span className="text-[#FF5000]">仅剩 {flight.seatsLeft} 座</span>
                  ) : (
                    <span>余票充足</span>
                  )}
                </div>
              </div>

              {/* 行李额选择 */}
              <div className="mt-4 mx-3">
                <div className="text-sm font-semibold mb-3 text-[#1c1c1e]">行李额</div>
                <div className="space-y-2">
                  {baggageOptions.map((opt) => {
                    const selected = flightBaggage === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setFlightBaggage(opt.key)}
                        className={`w-full flex items-center justify-between p-4 rounded-[16px] transition-all active:scale-[0.98] ${
                          selected ? "bg-white shadow-soft ring-2 ring-[#FF5000]" : "bg-white shadow-soft"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selected ? "border-[#FF5000] bg-[#FF5000]" : "border-black/20"
                          }`}>
                            {selected && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-[#1c1c1e]">{opt.label}</div>
                            <div className="text-xs text-quiet mt-0.5">{opt.desc}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${opt.price === 0 ? "text-quiet" : "text-[#FF5000]"}`}>
                          {opt.price === 0 ? "免费" : `+¥${opt.price}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 乘机人 */}
              <div className="mt-4 mx-3">
                <div className="text-sm font-semibold mb-3 text-[#1c1c1e]">乘机人</div>
                <div className="rounded-[20px] bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between py-2 border-b border-black/[0.06]">
                    <span className="text-sm text-quiet">成人</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setFlightAdults(Math.max(1, flightAdults - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{flightAdults}</span>
                      <button
                        onClick={() => setFlightAdults(Math.min(9, flightAdults + 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-quiet">儿童</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setFlightChildren(Math.max(0, flightChildren - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{flightChildren}</span>
                      <button
                        onClick={() => setFlightChildren(Math.min(5, flightChildren + 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 价格明细 */}
              <div className="mt-4 mx-3 rounded-[20px] bg-white p-5 shadow-soft">
                <div className="text-sm font-semibold mb-3 text-[#1c1c1e]">价格明细</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-quiet">机票单价</span>
                    <span>¥{flight.price} × {pax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quiet">机票小计</span>
                    <span>¥{flight.price * pax}</span>
                  </div>
                  {flightBaggagePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-quiet">行李额</span>
                      <span>¥{flightBaggagePrice} × {pax}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-quiet">机建燃油</span>
                    <span className="text-quiet">已含</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-black/[0.06] flex items-baseline justify-between">
                    <span className="text-sm text-quiet">合计</span>
                    <span className="text-2xl font-bold" style={{ color: "#FF5000" }}>¥{flightTotalPrice}</span>
                  </div>
                </div>
              </div>

              {/* 底部下单栏 */}
              <div className="h-24"></div>
              <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-black/[0.06]">
                <div className="mx-auto max-w-[460px] px-4 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-quiet">应付</div>
                    <div className="text-xl font-bold" style={{ color: "#FF5000" }}>¥{flightTotalPrice}</div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(flightCartItem as any);
                      setFlashMessage("已加入购物车");
                      setTimeout(() => setFlashMessage(""), 2000);
                    }}
                    className="flex-1 rounded-full py-3.5 text-base font-semibold text-primary border-2 border-primary active:scale-[0.98] transition-transform bg-white"
                  >
                    加入购物车
                  </button>
                  <button
                    onClick={() => {
                      startOrder(flightTotalPrice, [flightCartItem]);
                      setView("delivery");
                    }}
                    className="flex-1 rounded-full py-3.5 text-base font-semibold text-white active:scale-[0.98] transition-transform"
                    style={{ background: "linear-gradient(90deg, #FF5000 0%, #FF8A00 100%)" }}
                  >
                    立即下单
                  </button>
                </div>
              </div>
            </Screen>
          );
        })()}
      </AnimatePresence>

      {(blindBoxOpening || blindBoxProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-[360px] rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            {blindBoxOpening ? (
              <div className="py-12 text-center">
                <div className="text-7xl animate-bounce">🎁</div>
                <div className="mt-6 text-sm text-primary font-medium">
                  正在开启盲盒...
                </div>
                <div className="mt-2 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`transition-all duration-500 ${blindBoxOpened ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                <div className="text-center">
                  <div className="text-xs font-medium text-quiet uppercase tracking-wider">
                    恭喜你开出了
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    {blindBoxProduct?.title}
                  </div>
                  <div className="mt-6 mx-auto w-32 h-32 rounded-[24px] bg-primary/5 flex items-center justify-center text-7xl">
                    {blindBoxProduct?.emoji}
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-price">
                    {blindBoxProduct ? money(blindBoxProduct.price) : ""}
                  </div>
                  <div className="mt-2 text-xs text-quiet">
                    限时 30 分钟内可购买 · 还剩{" "}
                    <span className="font-mono font-medium text-primary">
                      {blindBoxTimeLeft}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={buyBlindBoxNow}
                    className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(255,80,0,0.25)]"
                  >
                    立即购买
                  </button>
                  <button
                    onClick={addBlindBoxToCart}
                    className="w-full rounded-full bg-black/[0.06] py-3.5 text-sm font-semibold"
                  >
                    已下单
                  </button>
                  <button
                    onClick={() => {
                      setBlindBoxProduct(null);
                      setBlindBoxExpireAt(null);
                      setBlindBoxTimeLeft("");
                      setBlindBoxOpened(false);
                    }}
                    className="w-full rounded-full py-3.5 text-sm text-quiet"
                  >
                    不想要了
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {["home", "list", "cart", "mine"].includes(view) && (
        <TabBar view={view} setView={setView} cartCount={cartCount} />
      )}

      {sharePanelOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSharePanelOpen(false)}
          style={{ overscrollBehavior: "contain", touchAction: "none" }}
        >
          <div
            className="w-full max-w-[460px] rounded-t-[20px] bg-[#f2f2f7] pb-6 pt-2"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" />
            <div className="px-4 py-2 text-center text-[13px] text-[#8e8e93]">
              分享到
            </div>
            <div className="mx-3 mt-2 rounded-[12px] bg-white p-4 overflow-hidden">
              <div className="flex justify-center gap-6 mb-4">
                <img
                  src={shareCardImage}
                  alt="分享卡片"
                  className="h-64 rounded-[12px] shadow-lg object-contain"
                />
              </div>
              <div className="text-center text-xs text-quiet mb-4">
                长按图片保存到相册
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: "微信", icon: "💬", color: "bg-green-500" },
                  { name: "朋友圈", icon: "🌐", color: "bg-green-600" },
                  { name: "小红书", icon: "📕", color: "bg-red-500" },
                  { name: "微博", icon: "🔴", color: "bg-orange-500" },
                ].map((platform) => (
                  <button
                    key={platform.name}
                    className="flex flex-col items-center gap-2 p-2 active:scale-95 transition-transform"
                    onClick={() => {
                      alert(`即将分享到${platform.name}`);
                    }}
                  >
                    <div className={`h-12 w-12 rounded-full ${platform.color} flex items-center justify-center text-2xl text-white`}>
                      {platform.icon}
                    </div>
                    <span className="text-xs text-[#1c1c1e]">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mx-3 mt-3 rounded-[12px] bg-white overflow-hidden">
              <button
                className="w-full py-3.5 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5"
                onClick={async () => {
                  const link = document.createElement("a");
                  link.download = `睡前逛逛-${shareCardType === "blindbox" ? "盲盒" : "分享"}卡.jpg`;
                  link.href = shareCardImage;
                  link.click();
                }}
              >
                保存到本地
              </button>
            </div>
            <button
              onClick={() => setSharePanelOpen(false)}
              className="mx-3 mt-3 w-[calc(100%-24px)] rounded-[12px] bg-white py-3.5 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5"
            >
              取消
            </button>
          </div>
        </div>,
        document.body
      )}

      {avatarPickerOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setAvatarPickerOpen(false)}
          style={{ overscrollBehavior: "contain", touchAction: "none" }}
        >
          <div
            className="w-full max-w-[460px] rounded-t-[20px] bg-[#f2f2f7] px-3 pb-6 pt-2"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" />
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setAvatarTab("zodiac")}
                className={`text-[15px] font-medium transition-colors ${
                  avatarTab === "zodiac" ? "text-primary" : "text-[#8e8e93]"
                }`}
              >
                星座
              </button>
              <button
                onClick={() => setAvatarTab("chinese")}
                className={`text-[15px] font-medium transition-colors ${
                  avatarTab === "chinese" ? "text-primary" : "text-[#8e8e93]"
                }`}
              >
                生肖
              </button>
            </div>
            <div className="rounded-[12px] bg-white p-4">
              <div className="grid grid-cols-4 gap-3">
                {(avatarTab === "zodiac" ? zodiacSigns : chineseZodiac).map((item) => {
                  const selected = stats.avatar === item.emoji;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setAvatar(item.emoji);
                        setAvatarPickerOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-full transition-all active:scale-95 ${
                        selected
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-black/[0.03] active:bg-black/5"
                      }`}
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <span className="mt-1 text-xs text-quiet">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setAvatarPickerOpen(false)}
              className="mt-2 w-full rounded-[12px] bg-white py-3 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5 active:opacity-70"
            >
              取消
            </button>
          </div>
        </div>,
        document.body
      )}

      {nicknameEditorOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setNicknameEditorOpen(false)}
          style={{ overscrollBehavior: "contain", touchAction: "none" }}
        >
          <div
            className="w-full max-w-[460px] rounded-t-[20px] bg-[#f2f2f7] px-3 pb-6 pt-2"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" />
            <div className="text-center text-[17px] font-semibold text-[#1c1c1e] mb-4">
              修改昵称
            </div>
            <div className="rounded-[12px] bg-white p-4">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value.slice(0, 10))}
                placeholder="请输入昵称（10字以内）"
                className="w-full px-4 py-3 rounded-[10px] bg-black/[0.03] text-[15px] text-[#1c1c1e] outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                maxLength={10}
              />
              <div className="mt-2 text-right text-xs text-quiet">
                {nicknameInput.length}/10
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  if (nicknameInput.trim()) {
                    setNickname(nicknameInput.trim());
                    setNicknameEditorOpen(false);
                  }
                }}
                disabled={!nicknameInput.trim()}
                className="w-full rounded-[12px] bg-primary py-3.5 text-[15px] font-medium text-white active:opacity-80 disabled:opacity-50 disabled:active:opacity-50"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setNicknameInput(generateNickname());
                }}
                className="w-full rounded-[12px] bg-white py-3.5 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5"
              >
                随机换一个
              </button>
              <button
                onClick={() => setNicknameEditorOpen(false)}
                className="w-full rounded-[12px] bg-white py-3.5 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5"
              >
                取消
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {flightCityPicker && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setFlightCityPicker(null)}
          style={{ overscrollBehavior: "contain", touchAction: "none" }}
        >
          <div
            className="w-full max-w-[460px] rounded-t-[20px] bg-[#f2f2f7] px-3 pb-6 pt-2 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-black/15" />
            <div className="text-center text-[17px] font-semibold text-[#1c1c1e] mb-3">
              选择{flightCityPicker === "from" ? "出发地" : "目的地"}
            </div>
            <div className="flex rounded-[10px] bg-black/[0.06] p-0.5 mb-3">
              <button
                onClick={() => setFlightCityTab("domestic")}
                className={`flex-1 py-2 text-[14px] font-medium rounded-[8px] transition-all ${
                  flightCityTab === "domestic" ? "bg-white text-primary shadow-sm" : "text-quiet"
                }`}
              >
                国内
              </button>
              <button
                onClick={() => setFlightCityTab("international")}
                className={`flex-1 py-2 text-[14px] font-medium rounded-[8px] transition-all ${
                  flightCityTab === "international" ? "bg-white text-primary shadow-sm" : "text-quiet"
                }`}
              >
                国际/港澳台
              </button>
            </div>
            <input
              type="text"
              value={flightCityKeyword}
              onChange={(e) => setFlightCityKeyword(e.target.value)}
              placeholder="中文/拼音/三字码搜索"
              className="w-full rounded-[10px] bg-white px-3 py-2.5 text-[14px] mb-3 outline-none"
            />
            <div className="rounded-[12px] bg-white overflow-y-auto flex-1">
              {filteredFlightCities.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-quiet">未找到相关城市</div>
              ) : groupedFlightCities ? (
                Object.entries(groupedFlightCities).map(([region, cities]) => (
                  <div key={region}>
                    <div className="sticky top-0 bg-[#f2f2f7] px-4 py-1.5 text-xs font-semibold text-quiet border-b border-black/[0.04]">
                      {region}（{cities.length}）
                    </div>
                    {cities.map((c) => {
                      const current = flightCityPicker === "from" ? flightFrom : flightTo;
                      const selected = current === c.name;
                      return (
                        <button
                          key={`${c.code}-${c.name}`}
                          onClick={() => {
                            if (flightCityPicker === "from") {
                              setFlightFrom(c.name);
                              if (c.name === flightTo) setFlightTo(current);
                            } else {
                              setFlightTo(c.name);
                              if (c.name === flightFrom) setFlightFrom(current);
                            }
                            setFlightCityPicker(null);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 text-[15px] active:bg-black/5 border-b border-black/[0.04] last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[#1c1c1e] font-medium">{c.name}</span>
                            <span className="text-xs text-quiet">{c.code}</span>
                          </div>
                          {selected && (
                            <svg className="h-5 w-5" style={{ color: "#FF5000" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                filteredFlightCities.map((c) => {
                  const current = flightCityPicker === "from" ? flightFrom : flightTo;
                  const selected = current === c.name;
                  return (
                    <button
                      key={`${c.code}-${c.name}`}
                      onClick={() => {
                        if (flightCityPicker === "from") {
                          setFlightFrom(c.name);
                          if (c.name === flightTo) setFlightTo(current);
                        } else {
                          setFlightTo(c.name);
                          if (c.name === flightFrom) setFlightFrom(current);
                        }
                        setFlightCityPicker(null);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-[15px] active:bg-black/5 border-b border-black/[0.04] last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#1c1c1e] font-medium">{c.name}</span>
                        <span className="text-xs text-quiet">{c.code}</span>
                      </div>
                      {selected && (
                        <svg className="h-5 w-5" style={{ color: "#FF5000" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <button
              onClick={() => setFlightCityPicker(null)}
              className="mt-2 w-full rounded-[12px] bg-white py-3 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5"
            >
              取消
            </button>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
