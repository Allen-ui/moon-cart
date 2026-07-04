import type { Product } from "@/data/products";
import type { CartItem } from "@/store/useShopStore";

export type DeliveryOrder = {
  id: string;
  amount: number;
  items: CartItem[];
  stepIndex: number;
  createdAt: string;
  channel: "index" | "takeout" | "travel";
};

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
