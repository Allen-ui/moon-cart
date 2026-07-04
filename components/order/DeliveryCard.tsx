"use client";

import { motion } from "framer-motion";
import { type DeliveryOrder, getDeliverySteps } from "@/utils/order";
import { money } from "@/utils/format";

export function DeliveryCard({
  order,
  index,
  onAccelerate,
}: {
  order: DeliveryOrder;
  index: number;
  onAccelerate: () => void;
}) {
  const steps = getDeliverySteps(order.channel);
  const progress = Math.round(((order.stepIndex + 1) / steps.length) * 100);
  const firstItem = order.items[0];
  const extraCount = order.items.length;
  const progressPercent = Math.min(92, 8 + order.stepIndex * 7.2);
  const isTravel = order.channel === "travel";

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
              {isTravel ? "✈️" : "🏍️"}
            </motion.div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-quiet">
            <span>{isTravel ? "出发地" : "商家"}</span>
            <span>{steps[order.stepIndex]}</span>
            <span>{isTravel ? "目的地" : "🏠 收货地址"}</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h2 className="text-2xl font-semibold">
          {steps[order.stepIndex]}
        </h2>
        <div className="mt-2 text-sm text-quiet">
          {isTravel
            ? "行程正在安排中，预计马上出发～"
            : "骑手正在飞速赶来，预计今晚马上送达～"}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-quiet">{isTravel ? "本单预订费用" : "本单虚拟消费"}</div>
            <div className="text-xl font-semibold text-price">
              {money(order.amount)}
            </div>
          </div>
          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft"
            onClick={onAccelerate}
          >
            {isTravel ? "加速出行" : "加速配送"}
          </button>
        </div>
      </div>
    </section>
  );
}
