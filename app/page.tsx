"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Home,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  categories,
  pickProducts,
  products,
  type Product,
} from "@/data/products";
import { type CartItem, type PurchaseRecord, useShopStore } from "@/store/useShopStore";
import QRCode from "qrcode";

type View =
  | "home"
  | "category"
  | "list"
  | "detail"
  | "cart"
  | "delivery"
  | "done"
  | "mine"
  | "wish"
  | "orders"
  | "favorites"
  | "admin";

const categoryShortcuts = [
  { label: "想吃点好的", icon: "🍔", category: "外卖" },
  { label: "数码科技", icon: "📱", category: "数码" },
  { label: "潮流鞋服", icon: "👟", category: "鞋服" },
  { label: "美妆护肤", icon: "💄", category: "美妆" },
  { label: "随便逛逛", icon: "🛍", category: undefined },
  { label: "我的购物车", icon: "❤️", category: "cart" },
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
  "已送达",
];

const money = (value: number) => `¥${Math.round(value)}`;

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

const shortMoney = (value: number) => {
  const v = Math.round(value);
  if (v >= 100000000) {
    return `¥${(v / 100000000).toFixed(2)}亿`;
  }
  if (v >= 10000) {
    return `¥${(v / 10000).toFixed(1)}万`;
  }
  return `¥${v}`;
};

const pinyinMap: Record<string, string[]> = {
  "牛": ["niu"], "奶": ["nai"], "茶": ["cha"],
  "鸡": ["ji"], "肉": ["rou"], "饭": ["fan"], "面": ["mian"],
  "包": ["bao"], "子": ["zi"], "饺": ["jiao"], "披": ["pi"], "萨": ["sa"],
  "汉": ["han"], "堡": ["bao"], "薯": ["shu"], "条": ["tiao"], "可": ["ke"], "乐": ["le"],
  "电": ["dian"], "脑": ["nao"], "手": ["shou"], "机": ["ji"],
  "耳": ["er"], "键": ["jian"], "盘": ["pan"], "鼠": ["shu"], "标": ["biao"],
  "表": ["biao"], "眼": ["yan"], "镜": ["jing"],
  "衣": ["yi"], "服": ["fu"], "鞋": ["xie"], "帽": ["mao"],
  "裤": ["ku"], "裙": ["qun"], "袜": ["wa"],
  "口": ["kou"], "红": ["hong"], "唇": ["chun"], "膏": ["gao"],
  "膜": ["mo"], "洗": ["xi"],
  "水": ["shui"], "果": ["guo"], "蔬": ["shu"], "菜": ["cai"],
  "海": ["hai"], "鲜": ["xian"], "蛋": ["dan"],
  "零": ["ling"], "食": ["shi"], "糖": ["tang"],
  "巧": ["qiao"], "克": ["ke"], "力": ["li"], "饼": ["bing"], "干": ["gan"],
  "旅": ["lv"], "行": ["xing"], "酒": ["jiu"], "店": ["dian"],
  "票": ["piao"], "门": ["men"],
  "家": ["jia"], "具": ["ju"], "居": ["ju"],
  "枕": ["zhen"], "头": ["tou"], "被": ["bei"],
  "书": ["shu"], "本": ["ben"], "笔": ["bi"], "记": ["ji"],
  "盲": ["mang"], "盒": ["he"], "幸": ["xing"], "运": ["yun"],
  "动": ["dong"], "健": ["jian"], "身": ["shen"],
  "器": ["qi"], "材": ["cai"],
};

const fuzzySearch = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;
  const q = query.trim().toLowerCase();

  return products.filter((product) => {
    const title = product.title.toLowerCase();
    const category = product.category.toLowerCase();

    if (title.includes(q) || category.includes(q)) return true;

    for (let i = 0; i < q.length; i++) {
      const char = q[i];
      if (title.includes(char)) return true;
    }

    const chars = product.title.split("");
    for (const char of chars) {
      const pinyins = pinyinMap[char];
      if (pinyins) {
        for (const py of pinyins) {
          if (py.includes(q) || q.includes(py[0])) return true;
        }
      }
    }

    return false;
  });
};

type DeliveryOrder = {
  id: string;
  amount: number;
  items: CartItem[];
  stepIndex: number;
  createdAt: string;
};

export default function MoonCartApp() {
  const [view, setView] = useState<View>("home");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [lastOrderAmount, setLastOrderAmount] = useState(428);
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([]);
  const deliveryTimerRef = useRef<number | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryOrder[]>([]);
  const [wishInput, setWishInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
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
    markProductViewed,
    completeOrder,
    refreshStreak,
    applyAfterSale,
    completeAfterSale,
    setAvatar,
    setNickname,
  } = useShopStore();

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  useEffect(() => {
    if (!stats.nickname) {
      setNickname(generateNickname());
    }
  }, [stats.nickname, setNickname]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
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
            const stepIndex = Math.min(
              deliverySteps.length - 1,
              order.stepIndex + 1,
            );
            const nextOrder = { ...order, stepIndex };
            if (stepIndex >= deliverySteps.length - 1)
              completed.push(nextOrder);
            return nextOrder;
          })
          .filter((order) => order.stepIndex < deliverySteps.length - 1);

        completed.forEach((order) => {
          completeOrder(order.amount, order.items);
          setLastOrderAmount(order.amount);
          setLastOrderItems(order.items);
          setIsBlindBoxOrder(false);
        });

        if (!moving.length && deliveryTimerRef.current) {
          window.clearInterval(deliveryTimerRef.current);
          deliveryTimerRef.current = null;
          if (completed.length) setView("done");
        }
        return moving;
      });
    }, 6000);
  }, [activeDeliveries.length, completeOrder]);

  const visibleProducts = useMemo(
    () => pickProducts(selectedCategory),
    [selectedCategory],
  );
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount =
    cartTotal > 300 ? 60 : cartTotal > 160 ? 30 : cartTotal > 80 ? 12 : 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const filteredPurchases = useMemo(() => {
    const purchases = stats.purchases ?? [];
    if (orderFilter === "all") return purchases;
    const now = new Date();
    if (orderFilter === "7d") {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return purchases.filter((p) => new Date(p.createdAt) >= cutoff);
    }
    if (orderFilter === "30d") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return purchases.filter((p) => new Date(p.createdAt) >= cutoff);
    }
    if (orderFilter === "year") {
      const year = now.getFullYear();
      return purchases.filter(
        (p) => new Date(p.createdAt).getFullYear() === year
      );
    }
    return purchases;
  }, [stats.purchases, orderFilter]);

  const openCategory = (category?: string) => {
    setSelectedCategory(category);
    setView(category ? "list" : "category");
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSpecs({});
    markProductViewed();
    setView("detail");
  };

  const startOrder = (
    amount = finalTotal || selectedProduct.price,
    items?: CartItem[],
  ) => {
    const orderItems = items?.length
      ? items.map((item) => ({ ...item }))
      : [{ ...selectedProduct, quantity: 1, finalPrice: selectedProduct.price }];
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setLastOrderAmount(amount);
    setLastOrderItems(orderItems);
    setOrderPanelOpen(true);
    setActiveDeliveries((orders) => [
      ...orders,
      {
        id,
        amount,
        items: orderItems,
        stepIndex: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const accelerate = (id?: string) => {
    setActiveDeliveries((orders) =>
      orders.map((order) =>
        !id || order.id === id
          ? {
              ...order,
              stepIndex: Math.min(
                deliverySteps.length - 1,
                order.stepIndex + 2,
              ),
            }
          : order,
      ),
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

  const openBlindBox = () => {
    if (!blindBoxCanOpen) return;
    setBlindBoxOpening(true);
    setBlindBoxOpened(false);
    setTimeout(() => {
      const blindBoxProducts = products.filter((p) => p.category === "盲盒");
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
    }, 2000);
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
      <CriticalStyles />
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
      <AnimatePresence mode="wait">
        {view === "home" && (
          <Screen key="home">
            <section className="pb-4">
              <div className="sticky top-0 z-20 -mx-4 bg-paper/95 px-4 pb-3 pt-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌙</span>
                    <div>
                      <div className="text-sm font-semibold">睡前逛逛</div>
                      <div className="text-[10px] text-quiet">Moon Cart</div>
                    </div>
                  </div>
                  <button
                    className="flex-1 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft active:scale-[0.98] transition-transform"
                    onClick={() => setView("category")}
                  >
                    <Search size={16} className="text-quiet" />
                    <span className="text-sm text-quiet">搜索你想买的</span>
                  </button>
                  <button
                    className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-xl active:scale-95 transition-transform shadow-[0_2px_8px_rgba(255,80,0,0.3)]"
                    onClick={() => setView("mine")}
                    aria-label="我的"
                  >
                    {stats.avatar || "🌙"}
                  </button>
                </div>
              </div>

              <div className="mt-3 hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
                {[
                  { emoji: "🎊", text: "限时特价", bg: "from-coral to-gold" },
                  { emoji: "✨", text: "新人专享", bg: "from-pink-400 to-rose-400" },
                  { emoji: "🎁", text: "每日盲盒", bg: "from-violet-400 to-purple-500" },
                  { emoji: "🔥", text: "热销榜单", bg: "from-orange-500 to-red-500" },
                ].map((banner, i) => (
                  <div
                    key={i}
                    className={`shrink-0 w-[70%] h-28 rounded-[24px] bg-gradient-to-r ${banner.bg} p-5 flex items-center justify-between text-white shadow-lg`}
                  >
                    <div>
                      <div className="text-xl font-bold">{banner.text}</div>
                      <div className="mt-1 text-xs opacity-80">点击查看详情</div>
                    </div>
                    <div className="text-5xl">{banner.emoji}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {[
                  { icon: "🍔", label: "外卖美食" },
                  { icon: "🍎", label: "生鲜水果" },
                  { icon: "👗", label: "服饰鞋包" },
                  { icon: "📱", label: "数码家电" },
                  { icon: "💄", label: "美妆个护" },
                  { icon: "🏠", label: "家居日用" },
                  { icon: "📚", label: "图书文具" },
                  { icon: "🎮", label: "玩具游戏" },
                  { icon: "✈️", label: "旅行出游" },
                  { icon: "🛍", label: "全部" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 p-2 active:scale-95 transition-transform"
                    onClick={() => setView("category")}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-soft">
                      {item.icon}
                    </div>
                    <span className="text-[11px] text-ink">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">🔥 猜你喜欢</h2>
                <button
                  className="text-xs text-quiet"
                  onClick={() => setView("category")}
                >
                  更多 ›
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products
                  .filter((p) => p.category !== "盲盒")
                  .slice(0, 10)
                  .map((product, index) => {
                    const isLarge = index % 5 === 0;
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => openProduct(product)}
                        onToggleFavorite={() => toggleFavorite(product)}
                        isFavorite={isFavorite(product.id)}
                      />
                    );
                  })}
              </div>

              <div className="mt-6 mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">💰 今日特惠</h2>
                <span className="text-xs text-quiet">低至5折</span>
              </div>
              <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
                {products
                  .filter((p) => p.category !== "盲盒")
                  .slice(10, 20)
                  .map((product) => (
                    <button
                      key={product.id}
                      className="shrink-0 w-36 rounded-[20px] bg-white p-2 text-left shadow-soft active:scale-[0.98] transition-transform"
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
                      </div>
                    </button>
                  ))}
              </div>

              <div className="mt-6 mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">🎁 今晚盲盒</h2>
                <span className="text-xs text-quiet">
                  {blindBoxCanOpen ? "每天一次" : "明天再来"}
                </span>
              </div>
              <button
                disabled={!blindBoxCanOpen || blindBoxOpening}
                onClick={() => openBlindBox()}
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
                  搜索结果 ({fuzzySearch(products.filter((p) => p.category !== "盲盒"), searchQuery).length})
                </div>
                {fuzzySearch(products.filter((p) => p.category !== "盲盒"), searchQuery).length > 0 ? (
                  <div className="masonry pb-4">
                    {fuzzySearch(products.filter((p) => p.category !== "盲盒"), searchQuery).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => openProduct(product)}
                        onToggleFavorite={() => toggleFavorite(product)}
                        isFavorite={isFavorite(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-quiet">
                    <div className="text-4xl mb-3">🔍</div>
                    <div>没有找到相关商品</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[...categories.filter((c) => c !== "盲盒"), "其他"].map((category, index) => (
                  <button
                    key={category}
                    onClick={() =>
                      category === "其他"
                        ? setView("list")
                        : openCategory(category)
                    }
                    className="rounded-[24px] bg-white p-5 text-left shadow-soft active:scale-[0.98]"
                  >
                    <div className="mb-8 text-3xl">
                      {
                        category === "其他"
                          ? "🎁"
                          : [
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
                            ][index]
                      }
                    </div>
                    <div className="text-lg font-semibold">{category}</div>
                    <div className="mt-1 text-sm text-quiet">
                      {category === "其他"
                        ? "随便逛逛"
                        : `约 ${pickProducts(category).length} 件快乐`}
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
              title={selectedCategory ?? "随便逛逛"}
              onBack={() =>
                selectedCategory ? setView("category") : setView("home")
              }
              right={
                <CartButton count={cartCount} onClick={() => setView("cart")} />
              }
            />
            <div className="hide-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${!selectedCategory ? "bg-primary text-white" : "bg-white text-ink"}`}
              >
                全部
              </button>
              {categories
                .filter((c) => c !== "盲盒")
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${selectedCategory === category ? "bg-primary text-white" : "bg-white text-ink"}`}
                  >
                    {category}
                  </button>
                ))}
            </div>
            <div className="masonry pb-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => openProduct(product)}
                />
              ))}
            </div>
          </Screen>
        )}

        {view === "detail" && (
          <Screen key="detail">
            <Header
              title="商品详情"
              onBack={() => setView("list")}
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
                  <p className="mt-2 text-sm text-quiet">
                    销量 {selectedProduct.sales} ·{" "}
                    {Math.floor(selectedProduct.id * 17 + 98)} 条评价
                  </p>
                </div>
                <div className="shrink-0 text-2xl font-semibold text-price">
                  {money(calculateSpecPrice(selectedProduct, selectedSpecs))}
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
                <InfoRow label="配送信息" value="今晚马上送达，实际不会发货" />
              </div>

              {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 font-semibold">选择规格</div>
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
            </section>
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
                onClick={() => addToCart(selectedProduct, selectedSpecs, calculateSpecPrice(selectedProduct, selectedSpecs))}
              >
                加入购物车
              </button>
              <button
                className="flex-1 rounded-full bg-primary px-5 py-4 font-semibold text-white shadow-soft"
                onClick={() =>
                  startOrder(calculateSpecPrice(selectedProduct, selectedSpecs), [
                    { ...selectedProduct, quantity: 1, selectedSpecs, price: calculateSpecPrice(selectedProduct, selectedSpecs), finalPrice: calculateSpecPrice(selectedProduct, selectedSpecs) },
                  ])
                }
              >
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
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-[24px] bg-white p-3 shadow-soft"
                    >
                      <ProductVisual product={item} compact />
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 font-semibold">
                          {item.title}
                        </div>
                        {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.selectedSpecs).map(([label, value]) => (
                              <span key={label} className="text-xs text-quiet bg-black/[0.03] px-2 py-0.5 rounded-full">
                                {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-1 text-sm text-coral">
                          {item.coupon}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-semibold">
                            {money(item.finalPrice ?? item.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <IconButton
                              label="减少"
                              onClick={() => changeQuantity(item.id, -1)}
                            >
                              <Minus size={15} />
                            </IconButton>
                            <span className="w-5 text-center text-sm">
                              {item.quantity}
                            </span>
                            <IconButton
                              label="增加"
                              onClick={() => changeQuantity(item.id, 1)}
                            >
                              <Plus size={15} />
                            </IconButton>
                            <IconButton
                              label="删除"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={15} />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <section className="mt-5 rounded-[28px] bg-white p-5 shadow-soft">
                  <InfoRow label="商品总价" value={money(cartTotal)} />
                  <InfoRow
                    label="优惠金额"
                    value={`-${money(discount)}`}
                    tone="coral"
                  />
                  <InfoRow
                    label="凑单提示"
                    value={
                      cartTotal < 89
                        ? `再买 ${money(89 - cartTotal)} 即可包邮`
                        : cartTotal < 300
                          ? `再买 ${money(300 - cartTotal)} 可减 60 元`
                          : "今晚已经很会买了"
                    }
                  />
                  <div className="mt-5 flex items-end justify-between border-t border-black/5 pt-5">
                    <span className="text-quiet">合计</span>
                    <span className="text-3xl font-semibold">
                      {money(finalTotal)}
                    </span>
                  </div>
                </section>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    className="rounded-full bg-white py-4 font-semibold shadow-soft"
                    onClick={() => openCategory(undefined)}
                  >
                    继续逛逛
                  </button>
                  <button
                    className="rounded-full bg-primary py-4 font-semibold text-white shadow-soft"
                    onClick={() => startOrder(finalTotal, cart)}
                  >
                    立即下单
                  </button>
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
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-quiet">
                            x{item.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-price">
                          {money(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 分享区 */}
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {isBlindBoxOrder ? "分享你的盲盒惊喜" : "分享你的购物快乐"}
                      </div>
                      <div className="text-xs text-quiet mt-0.5">
                        睡前逛逛 · Moon Cart
                      </div>
                    </div>
                    <div className="text-2xl">{isBlindBoxOrder ? "🎁" : "🌙"}</div>
                  </div>
                  <button
                    className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)] active:bg-primary/80"
                    onClick={async () => {
                      setShareCardType(isBlindBoxOrder ? "blindbox" : "normal");
                      const canvas = isBlindBoxOrder ? await drawBlindBoxShareCard() : await drawShareCard();
                      if (canvas) {
                        setShareCardImage(canvas.toDataURL("image/jpeg", 0.9));
                        setSharePanelOpen(true);
                      }
                    }}
                  >
                    {isBlindBoxOrder ? "分享惊喜卡片" : "分享卡片"}
                  </button>
                </div>
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
                  <div className="mt-1 text-xs font-medium text-quiet uppercase tracking-wide">
                    我的购物历史
                  </div>
                  <div className="mt-1 text-2xl font-bold text-ink">
                    {shortMoney(stats.virtualSpend)}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
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
              <div className="mt-5 pt-5 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">买过商品</span>
                    <span className="text-xs text-quiet">{stats.purchases?.length ?? 0} 件</span>
                  </div>
                  <button
                    className="text-xs text-primary font-medium"
                    onClick={() => setView("orders")}
                  >
                    查看全部 ›
                  </button>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                  {(stats.purchases ?? []).slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="shrink-0 w-14 h-14 rounded-[14px] bg-black/[0.03] flex items-center justify-center text-2xl"
                    >
                      {item.items?.[0]?.emoji || "🛒"}
                    </div>
                  ))}
                  {(stats.purchases?.length ?? 0) === 0 && (
                    <div className="text-sm text-quiet py-3">还没有购买记录</div>
                  )}
                </div>
              </div>
              <div className="mt-5">
                <button
                  className="w-full rounded-[16px] bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,80,0,0.25)] active:opacity-80 transition-opacity"
                  onClick={shareCard}
                >
                  分享卡片
                </button>
              </div>
            </section>
            <section className="mt-4 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-3 font-semibold">徽章</div>
              <div className="flex flex-wrap gap-2">
                {(stats.badges.length
                  ? stats.badges
                  : ["今晚第一单", "深夜常客", "虚拟大买家"]
                ).map((badge, index) => (
                  <span
                    key={badge}
                    className={`rounded-full px-3 py-2 text-sm ${stats.badges.includes(badge) ? "bg-coral/10 text-coral" : "bg-black/5 text-quiet"}`}
                  >
                    {index === 0 ? "🏅" : index === 1 ? "🌙" : "🛒"} {badge}
                  </span>
                ))}
              </div>
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
            <Header title="我的订单" onBack={() => setView("mine")} />
            <section className="mt-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-semibold">全部订单</span>
                <span className="text-xs text-quiet">
                  共 {stats.purchases?.length ?? 0} 单
                </span>
              </div>
              {activeDeliveries.length > 0 && (
                <div className="mb-4 rounded-[20px] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-primary">
                      配送中
                    </span>
                    <button
                      className="text-xs text-quiet"
                      onClick={() => setView("delivery")}
                    >
                      查看详情 ›
                    </button>
                  </div>
                  <div className="hide-scrollbar flex gap-3 overflow-x-auto">
                    {activeDeliveries.map((order, index) => (
                      <button
                        key={order.id}
                        className="min-w-[200px] flex-1 rounded-[14px] bg-black/[0.03] p-3 text-left"
                        onClick={() => setView("delivery")}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-quiet">
                            订单 {index + 1}
                          </span>
                          <span className="text-xs font-medium text-primary">
                            {Math.round((order.stepIndex + 1) / deliverySteps.length * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-medium truncate">
                          {order.items[0]?.emoji} {order.items[0]?.title}
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-black/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${((order.stepIndex + 1) / deliverySteps.length) * 100}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-quiet">
                          {deliverySteps[order.stepIndex]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5">
                {[
                  { label: "全部", value: "all" },
                  { label: "近7天", value: "7d" },
                  { label: "近30天", value: "30d" },
                  { label: "今年", value: "year" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setOrderFilter(filter.value)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-all ${
                      orderFilter === filter.value
                        ? "bg-primary text-white shadow-[0_4px_12px_rgba(255,80,0,0.2)]"
                        : "bg-white text-quiet"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {filteredPurchases.length ? (
                <div className="space-y-3">
                  {filteredPurchases.map((record) => (
                    <OrderCard key={record.id} record={record} onAfterSale={applyAfterSale} onAfterSaleComplete={completeAfterSale} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] bg-white/70 backdrop-blur-md border border-white/50 p-8 text-center">
                  <div className="text-4xl">📦</div>
                  <p className="mt-3 text-sm text-quiet">
                    暂无订单记录
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
              <div className="masonry mt-4 pb-4">
                {(stats.favorites ?? []).map((fav) => (
                  <ProductCard
                    key={fav.productId}
                    product={fav.product}
                    onClick={() => openProduct(fav.product)}
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
                    加入购物车
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
    </main>
  );
}

function CriticalStyles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <style>{`
      .moon-app{box-sizing:border-box;min-height:100vh;width:100%;max-width:460px;margin:0 auto;padding:16px 16px 96px;background:var(--bg-primary);color:var(--text-primary);box-shadow:0 18px 45px rgba(17,17,17,.08);font-family:HarmonyOS Sans,Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transition:background 0.3s ease,color 0.3s ease}
      .dark .moon-app{box-shadow:0 18px 45px rgba(0,0,0,.5)}
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
      .moon-app .bg-white{background:#fff}.dark .moon-app .bg-white{background:#1c1c1e}
      .moon-app .bg-ink{background:linear-gradient(135deg,#1a1a1a 0%,#2a1a10 100%)}
      .moon-app .bg-paper{background:#fff8f5}.dark .moon-app .bg-paper{background:#0a0a0a}
      .moon-app .bg-paper\\/90{background:rgba(255,248,245,.9)}.dark .moon-app .bg-paper\\/90{background:rgba(10,10,10,.9)}
      .moon-app .bg-paper\\/95{background:rgba(255,248,245,.95)}.dark .moon-app .bg-paper\\/95{background:rgba(10,10,10,.95)}
      .moon-app .bg-white\\/95{background:rgba(255,255,255,.95)}.dark .moon-app .bg-white\\/95{background:rgba(28,28,30,.95)}
      .moon-app .bg-white\\/45{background:rgba(255,255,255,.45)}.dark .moon-app .bg-white\\/45{background:rgba(255,255,255,.1)}
      .moon-app .bg-white\\/15{background:rgba(255,255,255,.15)}.dark .moon-app .bg-white\\/15{background:rgba(255,255,255,.08)}
      .moon-app .bg-white\\/10{background:rgba(255,255,255,.1)}
      .moon-app .bg-black\\/5{background:rgba(0,0,0,.05)}.dark .moon-app .bg-black\\/5{background:rgba(255,255,255,.05)}
      .moon-app .bg-black\\/\\[0\\.03\\]{background:rgba(0,0,0,.03)}.dark .moon-app .bg-black\\/\\[0\\.03\\]{background:rgba(255,255,255,.03)}
      .moon-app .bg-black\\/\\[0\\.04\\]{background:rgba(0,0,0,.04)}.dark .moon-app .bg-black\\/\\[0\\.04\\]{background:rgba(255,255,255,.04)}
      .moon-app .bg-primary{background:#ff5000}.moon-app .bg-price{background:#ff2d2d}.moon-app .bg-gold{background:#ffb800}.moon-app .bg-coral{background:#ff6b6b}.moon-app .bg-coral\\/10{background:rgba(255,80,0,.08)}.moon-app .bg-mint\\/10{background:rgba(52,199,89,.1)}
      .moon-app .p-2{padding:8px}.moon-app .p-3{padding:12px}.moon-app .p-4{padding:16px}.moon-app .p-5{padding:20px}.moon-app .p-6{padding:24px}.moon-app .px-1{padding-left:4px;padding-right:4px}.moon-app .px-2{padding-left:8px;padding-right:8px}.moon-app .px-3{padding-left:12px;padding-right:12px}.moon-app .px-4{padding-left:16px;padding-right:16px}.moon-app .px-5{padding-left:20px;padding-right:20px}.moon-app .px-8{padding-left:32px;padding-right:32px}.moon-app .py-1{padding-top:4px;padding-bottom:4px}.moon-app .py-2{padding-top:8px;padding-bottom:8px}.moon-app .py-3{padding-top:12px;padding-bottom:12px}.moon-app .py-4{padding-top:16px;padding-bottom:16px}.moon-app .py-6{padding-top:24px;padding-bottom:24px}.moon-app .pb-2{padding-bottom:8px}.moon-app .pb-4{padding-bottom:16px}.moon-app .pb-24{padding-bottom:96px}.moon-app .pt-1{padding-top:4px}.moon-app .pt-4{padding-top:16px}.moon-app .pt-5{padding-top:20px}
      .moon-app .text-left{text-align:left}.moon-app .text-center{text-align:center}.moon-app .text-right{text-align:right}.moon-app .text-xs{font-size:12px;line-height:16px}.moon-app .text-sm{font-size:14px;line-height:20px}.moon-app .text-base{font-size:16px;line-height:24px}.moon-app .text-lg{font-size:18px;line-height:28px}.moon-app .text-xl{font-size:20px;line-height:28px}.moon-app .text-2xl{font-size:24px;line-height:32px}.moon-app .text-3xl{font-size:30px;line-height:36px}.moon-app .text-4xl{font-size:36px;line-height:40px}.moon-app .text-5xl{font-size:48px;line-height:1}.moon-app .text-6xl{font-size:60px;line-height:1}.moon-app .text-7xl{font-size:72px;line-height:1}.moon-app .text-8xl{font-size:96px;line-height:1}.moon-app .text-\\[44px\\]{font-size:44px}.moon-app .text-\\[10px\\]{font-size:10px}.moon-app .text-\\[11px\\]{font-size:11px}
      .moon-app .font-medium{font-weight:500}.moon-app .font-semibold{font-weight:600}.moon-app .leading-tight{line-height:1.25}.moon-app .leading-snug{line-height:1.375}.moon-app .leading-6{line-height:24px}.moon-app .leading-7{line-height:28px}.moon-app .leading-8{line-height:32px}.moon-app .leading-\\[1\\.08\\]{line-height:1.08}.moon-app .leading-none{line-height:1}.moon-app .tracking-normal{letter-spacing:0}
      .moon-app .text-ink{color:#1a1a1a}.dark .moon-app .text-ink{color:#fff}
      .moon-app .text-quiet{color:#8e8e93}
      .moon-app .text-primary{color:#ff5000}.moon-app .text-price{color:#ff2d2d}.moon-app .text-gold{color:#ff8a00}.moon-app .text-coral{color:#ff2d2d}.moon-app .text-mint{color:#34c759}.moon-app .text-white{color:#fff}.moon-app .text-white\\/50{color:rgba(255,255,255,.5)}.moon-app .text-white\\/60{color:rgba(255,255,255,.6)}
      .moon-app .shadow-soft{box-shadow:0 8px 24px rgba(255,80,0,.08),0 2px 6px rgba(17,17,17,.04)}.dark .moon-app .shadow-soft{box-shadow:0 8px 24px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.2)}
      .moon-app .backdrop-blur{backdrop-filter:blur(8px)}.moon-app .outline-none{outline:0}.moon-app .border-t{border-top:1px solid}.moon-app .border-black\\/5{border-color:rgba(0,0,0,.05)}.dark .moon-app .border-black\\/5{border-color:rgba(255,255,255,.08)}
      .moon-app .masonry{column-count:2;column-gap:12px}.moon-app .masonry-item{break-inside:avoid;margin-bottom:12px}.moon-app .hide-scrollbar{scrollbar-width:none}.moon-app .hide-scrollbar::-webkit-scrollbar{display:none}
      .moon-app .bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-from,#ffe4d6),#fff,var(--tw-gradient-to,#ffedd5))}.moon-app .from-rose-100,.moon-app .from-amber-100,.moon-app .from-sky-100,.moon-app .from-violet-100,.moon-app .from-emerald-100,.moon-app .from-stone-100{--tw-gradient-from:#ffeed6}.moon-app .to-orange-100,.moon-app .to-lime-100,.moon-app .to-cyan-100,.moon-app .to-pink-100,.moon-app .to-teal-100,.moon-app .to-red-100{--tw-gradient-to:#fff5e6}
      @media (min-width:768px){.moon-app{margin-top:24px;margin-bottom:24px;min-height:860px;border-radius:28px}.moon-app .masonry{column-count:3}}
    `}</style>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  );
}

function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between bg-paper/90 px-4 py-3 backdrop-blur">
      <button
        className="rounded-full bg-white p-3 shadow-soft"
        onClick={onBack}
        aria-label="返回"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-11">{right}</div>
    </header>
  );
}

function OrderPanel({
  orders,
  open,
  onClose,
  onAccelerate,
}: {
  orders: DeliveryOrder[];
  open: boolean;
  onClose: () => void;
  onAccelerate: (id?: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 新订单加入时跳到最新一单
  useEffect(() => {
    if (orders.length) setActiveIndex(orders.length - 1);
  }, [orders.length]);

  // 多订单自动轮播
  useEffect(() => {
    if (!open || orders.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % orders.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [open, orders.length]);

  if (!open || !orders.length) return null;
  const safeIndex = Math.min(activeIndex, orders.length - 1);
  const selected = orders[safeIndex];
  const progress = Math.round(
    ((selected.stepIndex + 1) / deliverySteps.length) * 100,
  );

  return (
    <div className="fixed inset-x-0 top-0 z-40 mx-auto max-w-[460px] px-3 pt-3">
      <motion.section
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -28, opacity: 0 }}
        className="w-full overflow-hidden rounded-[28px] bg-white shadow-soft"
      >
        <div className="bg-gradient-to-r from-[#FF6A1A] to-[#FF5000] p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-white/50">
                {orders.length > 1 ? `配送中 · 共 ${orders.length} 单` : "订单生成成功"}
              </div>
              <div className="mt-1 text-xl font-semibold">
                {deliverySteps[selected.stepIndex]}
              </div>
            </div>
            <button
              className="rounded-full bg-white/10 px-3 py-2 text-sm"
              onClick={onClose}
            >
              收起
            </button>
          </div>
          {orders.length > 1 && (
            <div className="mt-4 flex items-center gap-2">
              {orders.map((order, index) => (
                <button
                  key={order.id}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`切换到订单 ${index + 1}`}
                  className={`h-1.5 flex-1 overflow-hidden rounded-full transition-all ${index === safeIndex ? "bg-white/30" : "bg-white/10"}`}
                >
                  <span
                    className="block h-full rounded-full bg-white transition-all"
                    style={{
                      width: index === safeIndex ? `${progress}%` : "0%",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-quiet">
              订单 {safeIndex + 1} · 虚拟配送进度
            </span>
            <span className="font-semibold text-price">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/5">
            <motion.div
              className="h-2 rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 rounded-[22px] bg-black/[0.03] p-3">
            <BoughtItems items={selected.items} compact />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-quiet">本单虚拟消费</div>
              <div className="mt-1 text-2xl font-semibold">
                {money(selected.amount)}
              </div>
            </div>
            <button
              className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white"
              onClick={() => onAccelerate(selected.id)}
            >
              加速配送
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function DeliveryTicker({
  orders,
  onOpen,
}: {
  orders: DeliveryOrder[];
  onOpen: () => void;
}) {
  if (!orders.length) return null;
  const latest = orders[orders.length - 1];
  const progress = Math.round(
    ((latest.stepIndex + 1) / deliverySteps.length) * 100,
  );
  const progressPercent = Math.min(92, 8 + latest.stepIndex * 7.2);
  const firstItem = latest.items[0];
  const extraCount = latest.items.length;

  return (
    <div className="sticky top-0 z-40 -mx-4 mb-3 bg-paper/95 px-4 pb-2 pt-1 backdrop-blur">
      <button
        className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2 text-left shadow-soft"
        onClick={onOpen}
      >
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 text-2xl">
          {firstItem?.emoji ?? "🛍"}
          {extraCount > 1 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-price px-1 text-[10px] font-semibold text-white">
              {extraCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">
              {firstItem?.title ?? "商品配送中"}
              {extraCount > 1 && ` 等${extraCount}件`}
            </span>
            <span className="shrink-0 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-price">
              {progress}%
            </span>
          </div>
          <div className="relative mt-1.5 h-5">
            <div className="absolute inset-x-0 top-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-primary to-gold"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <motion.span
              className="absolute top-0 text-base"
              animate={{ left: `calc(${progressPercent}% - 10px)` }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
            >
              🏍️
            </motion.span>
          </div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] text-quiet">
            <span>商家</span>
            <span className="truncate">
              {orders.length > 1
                ? `${orders.length} 单配送中 · ${deliverySteps[latest.stepIndex]}`
                : deliverySteps[latest.stepIndex]}
            </span>
            <span>🏠</span>
          </div>
        </div>
      </button>
    </div>
  );
}

function DeliveryCard({
  order,
  index,
  onAccelerate,
}: {
  order: DeliveryOrder;
  index: number;
  onAccelerate: () => void;
}) {
  const progress = Math.round(((order.stepIndex + 1) / deliverySteps.length) * 100);
  const firstItem = order.items[0];
  const extraCount = order.items.length;
  const progressPercent = Math.min(92, 8 + order.stepIndex * 7.2);

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-soft">
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,184,0,0.15),transparent_50%]" />
        <div className="absolute left-4 top-4 flex items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-lg">
            {firstItem?.emoji ?? "🛍"}
          </div>
          <div>
            <div className="text-xs text-quiet">订单 {index + 1}</div>
            <div className="text-base font-semibold">
              {firstItem?.title ?? "商品配送中"}
              {extraCount > 1 && ` 等${extraCount}件`}
            </div>
          </div>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary">
          {progress}%
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="relative h-20 rounded-full bg-black/5">
            <motion.div
              className="relative h-full rounded-full bg-gradient-to-r from-primary to-gold"
              animate={{ width: `${progressPercent}%` }}
            />
            <motion.div
              className="absolute -top-5 text-3xl"
              animate={{ left: `calc(${progressPercent}% - 24px)` }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
            >
              🏍️
            </motion.div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-quiet">
            <span>商家</span>
            <span>{deliverySteps[order.stepIndex]}</span>
            <span>🏠 收货地址</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h2 className="text-2xl font-semibold">
          {deliverySteps[order.stepIndex]}
        </h2>
        <div className="mt-2 text-sm text-quiet">
          骑手正在飞速赶来，预计今晚马上送达～
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-quiet">本单虚拟消费</div>
            <div className="text-xl font-semibold text-price">
              {money(order.amount)}
            </div>
          </div>
          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft"
            onClick={onAccelerate}
          >
            加速配送
          </button>
        </div>
      </div>
    </section>
  );
}

function CartButton({
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

function ProductCard({
  product,
  onClick,
  showFavorite = true,
  onToggleFavorite,
  isFavorite,
}: {
  product: Product;
  onClick: () => void;
  showFavorite?: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}) {
  return (
    <div className="masonry-item relative">
      <button
        className="block w-full rounded-[24px] bg-white p-2 text-left shadow-soft transition active:scale-[0.98]"
        onClick={onClick}
      >
        <ProductVisual product={product} />
        <div className="p-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            {product.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-semibold text-price">
              {money(product.price)}
            </span>
            <span className="text-xs text-quiet">销量 {product.sales}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-coral/10 px-2 py-1 text-[11px] text-coral"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>
      {showFavorite && onToggleFavorite && (
        <button
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md active:scale-90 transition-transform"
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
    </div>
  );
}

function ProductVisual({
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

function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "coral" | "mint";
}) {
  const color =
    tone === "coral"
      ? "text-coral"
      : tone === "mint"
        ? "text-mint"
        : "text-ink";
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-quiet">{label}</span>
      <span className={`text-right font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function BoughtItems({
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

function OrderCard({
  record,
  onAfterSale,
  onAfterSaleComplete,
}: {
  record: PurchaseRecord;
  onAfterSale: (id: string) => void;
  onAfterSaleComplete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAfterSale, setShowAfterSale] = useState(false);
  const [afterSaleReason, setAfterSaleReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [afterSaleCountdown, setAfterSaleCountdown] = useState("");

  const AFTER_SALE_DURATION = 15 * 60 * 1000;
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (record.afterSaleStatus !== "applied" || !record.afterSaleAppliedAt) return;

    const updateCountdown = () => {
      const appliedAt = new Date(record.afterSaleAppliedAt!).getTime();
      const now = Date.now();
      const elapsed = now - appliedAt;
      const remaining = Math.max(0, AFTER_SALE_DURATION - elapsed);

      if (remaining <= 0) {
        onAfterSaleComplete(record.id);
        setAfterSaleCountdown("");
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setAfterSaleCountdown(`${minutes}分${seconds.toString().padStart(2, "0")}秒`);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [record.afterSaleStatus, record.afterSaleAppliedAt, record.id, onAfterSaleComplete]);

  useEffect(() => {
    if (showAfterSale) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAfterSale]);

  const reasons = [
    { value: "no_need", label: "不需要了" },
    { value: "change_mind", label: "买错了/后悔了" },
    { value: "quality", label: "虚拟品质不满意" },
    { value: "duplicate", label: "重复购买" },
    { value: "other", label: "其他原因" },
  ];

  const handleSubmit = () => {
    if (!afterSaleReason) return;
    onAfterSale(record.id);
    setShowAfterSale(false);
    setAfterSaleReason("");
    setCustomReason("");
  };

  const firstItem = record.items[0];
  const extraCount = record.items.length - 1;

  return (
    <div className="rounded-[20px] bg-white/70 backdrop-blur-md border border-white/50 overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
      <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
        <span className="text-xs text-quiet">
          {formatPurchaseDate(record.createdAt)}
        </span>
        <span className="text-xs font-medium text-primary">
          {record.afterSaleStatus === "applied"
            ? `售后处理中 ${afterSaleCountdown ? `· ${afterSaleCountdown}` : ""}`
            : record.afterSaleStatus === "completed"
            ? "售后已完成"
            : "已完结"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 rounded-[14px] bg-black/[0.03] flex items-center justify-center text-3xl">
            {firstItem?.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {firstItem?.title}
              {extraCount > 0 && ` 等${record.items.length}件商品`}
            </div>
            <div className="mt-1 text-xs text-quiet">
              共 {record.items.length} 件
            </div>
            <div className="mt-1 text-sm font-semibold text-price">
              {money(record.amount)}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-xs text-quiet"
          >
            {expanded ? "收起" : "展开"}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div className="rounded-[14px] bg-black/[0.03] p-3 space-y-2">
              {record.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="mr-2">{item.emoji}</span>
                    {item.title}
                  </span>
                  <span className="text-quiet">x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {!record.afterSaleStatus || record.afterSaleStatus === "none" ? (
                <button
                  onClick={() => setShowAfterSale(true)}
                  className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium"
                >
                  申请售后
                </button>
              ) : record.afterSaleStatus === "applied" ? (
                <div className="flex-1 rounded-full bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary text-center">
                  处理中 · {afterSaleCountdown || "15分00秒"}
                </div>
              ) : null}
              <button className="flex-1 rounded-full bg-black/[0.06] px-4 py-2.5 text-sm font-medium">
                再次购买
              </button>
            </div>
          </div>
        )}
      </div>

      {showAfterSale && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAfterSale(false)}
          style={{ overscrollBehavior: "contain", touchAction: "none" }}
        >
          <div
            className="w-full max-w-[460px] rounded-t-[20px] bg-[#f2f2f7] pb-6 pt-2"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" />
            <div className="px-4 py-2 text-center text-[13px] text-[#8e8e93]">
              请选择售后原因
            </div>
            <div className="mx-3 mt-2 rounded-[12px] bg-white overflow-hidden">
              {reasons.map((reason, idx) => {
                const selected = afterSaleReason === reason.value;
                return (
                  <div key={reason.value}>
                    {idx > 0 && <div className="ml-4 h-px bg-black/5" />}
                    <button
                      onClick={() => {
                        setAfterSaleReason(reason.value);
                        if (reason.value !== "other") setCustomReason("");
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[15px] active:bg-black/5 transition-colors ${
                        selected ? "text-primary" : "text-[#1c1c1e]"
                      }`}
                    >
                      <span>{reason.label}</span>
                      {selected && (
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {afterSaleReason === "other" && (
              <div className="mx-3 mt-2 rounded-[12px] bg-white px-4 py-3">
                <textarea
                  autoFocus
                  className="w-full min-h-[60px] text-[15px] outline-none resize-none placeholder:text-[#c7c7cc]"
                  placeholder="请输入具体原因..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            <div className="mx-3 mt-2 rounded-[12px] bg-white overflow-hidden">
              <button
                onClick={handleSubmit}
                disabled={!afterSaleReason || (afterSaleReason === "other" && !customReason)}
                className={`w-full px-4 py-3 text-[15px] font-semibold transition-colors active:bg-black/5 ${
                  afterSaleReason && (afterSaleReason !== "other" || customReason)
                    ? "text-primary"
                    : "text-[#c7c7cc]"
                }`}
              >
                提交
              </button>
            </div>
            <div className="mx-3 mt-2 rounded-[12px] bg-white overflow-hidden">
              <button
                onClick={() => setShowAfterSale(false)}
                className="w-full px-4 py-3 text-[15px] font-medium text-[#1c1c1e] active:bg-black/5"
              >
                取消
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <Centered>
      <div className="text-6xl">🛒</div>
      <h2 className="mt-6 text-2xl font-semibold">购物车还是空的</h2>
      <p className="mt-3 text-quiet">先把今晚想买的快乐放进来。</p>
      <button
        className="mt-8 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-soft"
        onClick={onShop}
      >
        继续逛逛
      </button>
    </Centered>
  );
}

function formatPurchaseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
      {children}
    </section>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
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

function TabBar({
  view,
  setView,
  cartCount,
}: {
  view: View;
  setView: (view: View) => void;
  cartCount: number;
}) {
  const items = [
    { view: "home" as View, label: "首页", icon: Home },
    { view: "cart" as View, label: "购物车", icon: ShoppingBag },
    { view: "mine" as View, label: "我的", icon: UserRound },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 mx-auto flex max-w-[420px] justify-center px-4">
      <div className="flex w-full justify-around rounded-full bg-white/95 p-2 shadow-soft backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`relative flex min-w-20 flex-col items-center rounded-full px-4 py-2 text-xs ${active ? "bg-primary text-white" : "text-quiet"}`}
            >
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
