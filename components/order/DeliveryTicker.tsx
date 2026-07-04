"use client";

import { motion } from "framer-motion";
import { type DeliveryOrder, getDeliverySteps } from "@/utils/order";

export function DeliveryTicker({
  orders,
  onOpen,
}: {
  orders: DeliveryOrder[];
  onOpen: () => void;
}) {
  if (!orders.length) return null;
  const latest = orders[orders.length - 1];
  const latestSteps = getDeliverySteps(latest.channel);
  const progress = Math.round(
    ((latest.stepIndex + 1) / latestSteps.length) * 100,
  );
  const progressPercent = Math.min(92, 8 + latest.stepIndex * 7.2);
  const firstItem = latest.items[0];
  const extraCount = latest.items.length;
  const isTravel = latest.channel === "travel";

  return (
    <div className="sticky top-0 z-40 -mx-4 mb-3 bg-paper px-4 pb-2 pt-1">
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
              {isTravel ? "✈️" : "🏍️"}
            </motion.span>
          </div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] text-quiet">
            <span>{isTravel ? "出发地" : "商家"}</span>
            <span className="truncate">
              {orders.length > 1
                ? `${orders.length} 单配送中 · ${latestSteps[latest.stepIndex]}`
                : latestSteps[latest.stepIndex]}
            </span>
            <span>{isTravel ? "🏝️" : "🏠"}</span>
          </div>
        </div>
      </button>
    </div>
  );
}
