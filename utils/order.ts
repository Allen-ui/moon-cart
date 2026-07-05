import type { Product } from "@/data/products";
import type { CartItem } from "@/store/useShopStore";

export type DeliveryOrder = {
  id: string;
  amount: number;
  items: CartItem[];
  stepIndex: number;
  createdAt: string;
  channel: "index" | "takeout" | "travel";
  travelStartDate?: string;
};

const travelSteps = [
  "订单生成",
  "商家确认预订",
  "预订成功",
  "距离出发还有7天",
  "距离出发还有5天",
  "距离出发还有3天",
  "距离出发还有2天",
  "距离出发还有1天",
  "今天出发",
  "出行中",
  "行程已完成",
];

const deliveryStepsByChannel: Record<
  "index" | "takeout" | "travel",
  string[]
> = {
  index: [
    "订单生成",
    "商家接单",
    "商品拣货中",
    "商品打包完成",
    "快递揽收",
    "运输到分拣中心",
    "运往配送站",
    "派送员接单",
    "配送中",
    "距离 5.2km",
    "距离 2.3km",
    "距离 800m",
    "已送达",
  ],
  takeout: [
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
  ],
  travel: [
    "订单生成",
    "商家确认预订",
    "预订成功",
    "距离出发还有7天",
    "距离出发还有5天",
    "距离出发还有3天",
    "距离出发还有2天",
    "距离出发还有1天",
    "今天出发",
    "出行中",
    "行程已完成",
  ],
};

export const getDeliverySteps = (channel?: string) =>
  deliveryStepsByChannel[
    (channel as "index" | "takeout" | "travel") ?? "index"
  ];

export const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const local = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0);
    if (!isNaN(local.getTime())) return local;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
};

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayStr = (): string => {
  return formatLocalDate(new Date());
};

export const getTomorrowStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
};

export const calculateTravelCountdown = (
  travelStartDate?: string,
  createdAt?: string,
  travelNights: number = 1,
) => {
  const now = new Date();
  const start = travelStartDate ? parseLocalDate(travelStartDate) : null;

  if (!start) {
    return {
      remainingMs: 0,
      progress: 0,
      displayText: "预订成功",
      status: "pending",
    };
  }

  const remaining = start.getTime() - now.getTime();

  if (remaining > 0) {
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    let displayText = "";
    if (days > 0) {
      displayText = `距出发还有${days}天`;
      if (hours > 0) displayText += `${hours}小时`;
    } else if (hours > 0) {
      displayText = `距出发还有${hours}小时`;
      if (minutes > 0) displayText += `${minutes}分`;
    } else if (minutes > 0) {
      displayText = `距出发还有${minutes}分钟`;
    } else {
      displayText = "即将出发";
    }

    const created = createdAt ? parseLocalDate(createdAt) : null;
    let progress = 0;
    if (created && created.getTime() < start.getTime()) {
      const total = start.getTime() - created.getTime();
      const elapsed = now.getTime() - created.getTime();
      progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    } else {
      progress = Math.min(100, Math.max(0, 100 - (remaining / (30 * 86400000)) * 100));
    }

    return {
      remainingMs: remaining,
      progress,
      displayText,
      status: "countdown",
    };
  }

  const endDate = new Date(start.getTime() + travelNights * 86400000);
  if (now.getTime() < endDate.getTime()) {
    const travelTotal = endDate.getTime() - start.getTime();
    const travelElapsed = now.getTime() - start.getTime();
    const progress = Math.min(100, Math.max(0, (travelElapsed / travelTotal) * 100));
    return {
      remainingMs: 0,
      progress,
      displayText: "出行中",
      status: "traveling",
    };
  }

  return {
    remainingMs: 0,
    progress: 100,
    displayText: "行程已完成",
    status: "completed",
  };
};

export const calculateSpecPrice = (product: Product, selectedSpecs: Record<string, string>) => {
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

export const getChannelFromItems = (items: CartItem[]): "index" | "takeout" | "travel" => {
  const categories = items.map((i) => i.category);
  if (categories.length > 0 && categories.every((c) => c === "旅行"))
    return "travel";
  if (categories.length > 0 && categories.every((c) => c === "外卖"))
    return "takeout";
  return "index";
};

/**
 * 检查旅游商品是否已选完所有必填规格
 * 必填项：产品自带 specs 中的每一项 + 日期（出发/入住/取车 + 退房/还车）
 */
export const validateTravelSpecs = (
  product: Product,
  specs: Record<string, string>
): { valid: boolean; missingFields: string[] } => {
  const missing: string[] = [];
  // 检查产品自带规格
  if (product.specs) {
    product.specs.forEach((spec) => {
      if (!specs[spec.label]) {
        missing.push(spec.label);
      }
    });
  }
  // 检查日期
  const title = product.title || "";
  const isHotel = /酒店|民宿|海景|温泉|亚特兰蒂斯|房|客栈/.test(title);
  const isRental = /租车|自驾/.test(title);
  const todayStr = getTodayStr();
  if (isHotel) {
    if (!specs["入住日期"]) missing.push("入住日期");
    if (!specs["退房日期"]) missing.push("退房日期");
    // 验证日期顺序：退房日期必须晚于入住日期
    if (specs["入住日期"] && specs["退房日期"]) {
      if (specs["入住日期"] < todayStr) missing.push("入住日期（不能早于今天）");
      if (specs["退房日期"] <= specs["入住日期"]) missing.push("退房日期（必须晚于入住日期）");
    }
  } else if (isRental) {
    if (!specs["取车日期"]) missing.push("取车日期");
    if (!specs["还车日期"]) missing.push("还车日期");
    // 验证日期顺序：还车日期必须晚于取车日期
    if (specs["取车日期"] && specs["还车日期"]) {
      if (specs["取车日期"] < todayStr) missing.push("取车日期（不能早于今天）");
      if (specs["还车日期"] <= specs["取车日期"]) missing.push("还车日期（必须晚于取车日期）");
    }
  } else {
    if (!specs["出发日期"]) missing.push("出发日期");
    else if (specs["出发日期"] < todayStr) missing.push("出发日期（不能早于今天）");
    // 如果有返程日期，验证不能早于出发日期
    if (specs["返程日期"] && specs["出发日期"] && specs["返程日期"] < specs["出发日期"]) {
      missing.push("返程日期（不能早于出发日期）");
    }
  }
  return { valid: missing.length === 0, missingFields: missing };
};
