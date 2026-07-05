"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type DeliveryOrder, getDeliverySteps, calculateTravelCountdown, parseLocalDate } from "@/utils/order";

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
  const firstItem = latest.items[0];
  const extraCount = latest.items.length;
  const isTravel = latest.channel === "travel";

  const [displayProgress, setDisplayProgress] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (isTravel && latest.travelStartDate) {
      const travelNights = latest.items[0]?.selectedSpecs
        ? Math.round(
            ((parseLocalDate(
              latest.items[0].selectedSpecs["退房日期"] ||
              latest.items[0].selectedSpecs["还车日期"] ||
              latest.travelStartDate
            )?.getTime() || 0) -
              (parseLocalDate(latest.travelStartDate)?.getTime() || 0)) /
              86400000
          )
        : 1;
      const update = () => {
        const countdown = calculateTravelCountdown(
          latest.travelStartDate!,
          latest.createdAt,
          travelNights
        );
        setDisplayProgress(countdown.progress);
        setDisplayPercent(Math.min(92, 8 + countdown.progress * 0.84));
        setStatusText(countdown.displayText);
      };
      update();
      const timer = window.setInterval(update, 1000);
      return () => window.clearInterval(timer);
    } else {
      const p = Math.round(((latest.stepIndex + 1) / latestSteps.length) * 100);
      setDisplayProgress(p);
      setDisplayPercent(Math.min(92, 8 + latest.stepIndex * 7.2));
      setStatusText(latestSteps[latest.stepIndex]);
    }
  }, [isTravel, latest.travelStartDate, latest.createdAt, latest.stepIndex, latestSteps, latest.items]);

  useEffect(() => {
    if (isTravel) {
      const hideTimer = window.setTimeout(() => {
        setIsVisible(false);
        setShowTip(true);
      }, 5000);
      const tipTimer = window.setTimeout(() => {
        setShowTip(false);
      }, 8000);
      return () => {
        window.clearTimeout(hideTimer);
        window.clearTimeout(tipTimer);
      };
    }
  }, [isTravel, latest.id]);

  const hasNonTravelOrders = orders.some(o => o.channel !== "travel");

  if (!isTravel && !hasNonTravelOrders && !isVisible) {
    if (showTip) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-0 z-40 -mx-4 mb-3 bg-paper px-4 pb-2 pt-1"
          >
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-quiet shadow-soft">
              <span>✈️ 可在"我的逛逛"中查看行程详情</span>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }
    return null;
  }

  const displayOrders = isTravel && !hasNonTravelOrders
    ? (isVisible ? orders : [])
    : orders;

  if (displayOrders.length === 0) {
    if (showTip) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-0 z-40 -mx-4 mb-3 bg-paper px-4 pb-2 pt-1"
          >
            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-quiet shadow-soft">
              <span>✈️ 可在"我的逛逛"中查看行程详情</span>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }
    return null;
  }

  const displayLatest = displayOrders[displayOrders.length - 1];
  const displayIsTravel = displayLatest.channel === "travel";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="sticky top-0 z-40 -mx-4 mb-3 bg-paper px-4 pb-2 pt-1"
      >
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
                {firstItem?.title ?? (displayIsTravel ? "即将出发" : "商品配送中")}
                {extraCount > 1 && ` 等${extraCount}件`}
              </span>
              {!displayIsTravel && (
                <span className="shrink-0 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-price">
                  {Math.round(displayProgress)}%
                </span>
              )}
            </div>
            <div className="relative mt-1.5 h-5">
              <div className="absolute inset-x-0 top-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-primary to-gold"
                  style={{ width: `${displayPercent}%` }}
                />
              </div>
              <motion.span
                className="absolute top-0 text-base"
                animate={{ left: `calc(${displayPercent}% - 10px)` }}
                transition={{ type: "spring", stiffness: 70, damping: 16 }}
              >
                {displayIsTravel ? "✈️" : "🏍️"}
              </motion.span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] text-quiet">
              <span>{displayIsTravel ? "下单" : "商家"}</span>
              <span className="truncate">
                {displayOrders.length > 1
                  ? `${displayOrders.length} 单${displayIsTravel ? "待出发" : "配送中"} · ${statusText}`
                  : statusText}
              </span>
              <span>{displayIsTravel ? "出发" : "🏠"}</span>
            </div>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
