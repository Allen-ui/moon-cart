"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Screen } from "@/components/common/Screen";
import { shortMoney } from "@/utils/format";
import { getMemberLevel, getNextLevel } from "@/utils/member";
import { BADGES } from "@/store/useShopStore";
import type { Stats, CartItem } from "@/store/useShopStore";

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

export interface MinePageProps {
  stats: Stats;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBack: () => void;
  onNavigateToOrders: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToMemberLevel: () => void;
  onNavigateToWish: () => void;
  onSetAvatar: (avatar: string) => void;
  onSetNickname: (nickname: string) => void;
  onApplyAfterSale: (id: string) => void;
  onCompleteAfterSale: (id: string) => void;
  onAddToWishlist: (title: string) => void;
  onRemoveFromWishlist: (id: string) => void;
  onAddMessage: (content: string) => void;
  lastOrderAmount: number;
  lastOrderItems: CartItem[];
}

export function MinePage({
  stats,
  darkMode,
  onToggleDarkMode,
  onBack,
  onNavigateToOrders,
  onNavigateToFavorites,
  onNavigateToMemberLevel,
  onNavigateToWish,
  onSetAvatar,
  onSetNickname,
  onApplyAfterSale,
  onCompleteAfterSale,
  onAddToWishlist,
  onRemoveFromWishlist,
  onAddMessage,
  lastOrderAmount,
  lastOrderItems,
}: MinePageProps) {
  const [ordersTab, setOrdersTab] = useState<"all" | "delivery" | "takeout" | "travel">("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "shipping" | "completed" | "aftersale">("all");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<"zodiac" | "chinese">("zodiac");
  const [nicknameEditorOpen, setNicknameEditorOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [wishInput, setWishInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareCardType, setShareCardType] = useState<"normal" | "blindbox">("normal");
  const [shareCardImage, setShareCardImage] = useState<string>("");

  const earnedBadges = useMemo(() => BADGES.filter((b) => stats.badges.includes(b.id)), [stats.badges]);

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

  const generateNickname = () => {
    const adj = nicknameAdjectives[Math.floor(Math.random() * nicknameAdjectives.length)];
    const noun = nicknameNouns[Math.floor(Math.random() * nicknameNouns.length)];
    return adj + noun;
  };

  const submitWish = () => {
    const title = wishInput.trim();
    if (!title) return;
    onAddToWishlist(title);
    setWishInput("");
  };

  const submitMessage = () => {
    const content = messageInput.trim();
    if (!content) return;
    onAddMessage(content);
    setMessageInput("");
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

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, PURPLE_DEEP);
    bg.addColorStop(0.4, PURPLE_DARK);
    bg.addColorStop(0.7, PURPLE_MID);
    bg.addColorStop(1, PURPLE_LIGHT);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

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

    ctx.textAlign = "center";
    ctx.font = `bold 52px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.fillText("🌙 睡前逛逛", center, 160);

    ctx.font = `24px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("MOON CART · 我的购物历史", center, 210);

    const cardW = 720;
    const cardH = 1000;
    const cardX = (W - cardW) / 2;
    const cardY = 280;

    const cardGlow = ctx.createRadialGradient(center, cardY + cardH / 2, 0, center, cardY + cardH / 2, cardW);
    cardGlow.addColorStop(0, "rgba(255,215,0,0.2)");
    cardGlow.addColorStop(1, "rgba(255,215,0,0)");
    ctx.fillStyle = cardGlow;
    ctx.fillRect(cardX - 100, cardY - 100, cardW + 200, cardH + 200);

    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    cardGrad.addColorStop(0, "rgba(255,255,255,0.1)");
    cardGrad.addColorStop(0.5, "rgba(255,255,255,0.05)");
    cardGrad.addColorStop(1, "rgba(255,255,255,0.1)");
    ctx.fillStyle = cardGrad;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 40);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,215,0,0.3)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 40);
    ctx.stroke();

    ctx.font = `bold 80px ${cjk}`;
    ctx.fillStyle = GOLD;
    ctx.fillText("🏆", center, cardY + 130);

    ctx.font = `bold 48px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.fillText(stats.nickname || "睡前逛逛用户", center, cardY + 220);

    const level = getMemberLevel(stats.virtualSpend);
    ctx.font = `28px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(`${level.icon} ${level.name}`, center, cardY + 280);

    const statY = cardY + 360;
    const statGap = 180;
    const statsData = [
      { label: "累计消费", value: formatMoney(payload.virtualSpend) },
      { label: "快乐次数", value: `${stats.happyCount}` },
      { label: "购买件数", value: `${payload.boughtCount}` },
    ];
    statsData.forEach((s, i) => {
      const x = center - statGap + i * statGap;
      ctx.font = `bold 44px ${cjk}`;
      ctx.fillStyle = GOLD;
      ctx.fillText(s.value, x, statY);
      ctx.font = `24px ${cjk}`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(s.label, x, statY + 45);
    });

    const itemsTitleY = cardY + 500;
    ctx.font = `bold 32px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.fillText("最近逛逛", center, itemsTitleY);

    const itemY = itemsTitleY + 80;
    const itemSize = 120;
    const itemGap = 30;
    const items = payload.items.slice(0, 5);
    const totalWidth = items.length * itemSize + (items.length - 1) * itemGap;
    const startX = center - totalWidth / 2 + itemSize / 2;

    items.forEach((item, i) => {
      const x = startX + i * (itemSize + itemGap);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      drawRoundRect(ctx, x - itemSize / 2, itemY, itemSize, itemSize, 24);
      ctx.fill();
      ctx.font = `60px ${cjk}`;
      ctx.fillText(item.emoji || "🛒", x, itemY + 80);
    });

    const qrY = cardY + cardH - 200;
    ctx.fillStyle = WHITE;
    drawRoundRect(ctx, center - 80, qrY, 160, 160, 16);
    ctx.fill();

    ctx.font = `24px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("扫码下载 睡前逛逛", center, qrY + 200);

    const bottomY = H - 120;
    ctx.font = `bold 36px ${cjk}`;
    ctx.fillStyle = WHITE;
    ctx.fillText("今天没花钱，但快乐已经到账", center, bottomY);

    ctx.font = `24px ${cjk}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("MOON CART · 虚拟购物快乐模拟器", center, bottomY + 50);

    return canvas;
  };

  const shareCard = async () => {
    const canvas = await drawShareCard();
    if (!canvas) return;
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setShareCardImage(url);
        setShareCardType("normal");
        setSharePanelOpen(true);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <>
      <Screen key="mine">
        <Header title="我的" onBack={onBack} right={
          <button
            onClick={onToggleDarkMode}
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
                  onClick={onNavigateToMemberLevel}
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
              onClick={onNavigateToOrders}
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
              onClick={onNavigateToFavorites}
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
                onNavigateToOrders();
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
            <div className="flex flex-wrap justify-between gap-y-3">
              {(showAllBadges ? earnedBadges : earnedBadges.slice(0, 10)).map((badge) => (
                <div
                  key={badge.id}
                  className="flex w-[18%] flex-col items-center"
                  title={badge.description}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                    {badge.icon}
                  </div>
                  <span className="mt-1 w-full truncate text-center text-[10px] text-text">
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
              onClick={onNavigateToWish}
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

      {avatarPickerOpen && typeof document !== "undefined" && createPortal(
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
                        onSetAvatar(item.emoji);
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

      {nicknameEditorOpen && typeof document !== "undefined" && createPortal(
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
                    onSetNickname(nicknameInput.trim());
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

      {sharePanelOpen && typeof document !== "undefined" && createPortal(
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
    </>
  );
}
