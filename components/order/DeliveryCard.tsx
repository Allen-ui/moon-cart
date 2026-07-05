"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { type DeliveryOrder, getDeliverySteps, calculateTravelCountdown, parseLocalDate } from "@/utils/order";
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
  const isTravel = order.channel === "travel";
  const firstItem = order.items[0];
  const extraCount = order.items.length;

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [countdownText, setCountdownText] = useState("");

  const steps = getDeliverySteps(order.channel);
  const progressPercent = isTravel
    ? Math.min(92, progress * 0.92)
    : Math.min(92, 8 + order.stepIndex * 7.2);

  useEffect(() => {
    if (isTravel && order.travelStartDate) {
      const specs = order.items[0]?.selectedSpecs;
      const startDate = parseLocalDate(order.travelStartDate);
      const endDate = parseLocalDate(
        specs?.["退房日期"] || specs?.["还车日期"] || order.travelStartDate
      );
      const travelNights = specs
        ? Math.round(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / 86400000)
        : 1;
      const update = () => {
        const countdown = calculateTravelCountdown(order.travelStartDate!, order.createdAt, travelNights);
        setProgress(countdown.progress);
        if (countdown.status === "countdown") {
          setStatusText("待出行");
          setCountdownText(countdown.displayText);
        } else if (countdown.status === "traveling") {
          setStatusText("出行中");
          setCountdownText("旅途愉快～");
        } else {
          setStatusText("已完成");
          setCountdownText("行程已结束");
        }
      };
      update();
      const timer = window.setInterval(update, 1000);
      return () => window.clearInterval(timer);
    } else {
      const p = Math.round(((order.stepIndex + 1) / steps.length) * 100);
      setProgress(p);
      setStatusText(steps[order.stepIndex]);
      setCountdownText("");
    }
  }, [isTravel, order.travelStartDate, order.createdAt, order.stepIndex, order.channel, order.items]);

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
              {firstItem?.title ?? (isTravel ? "即将出发" : "商品配送中")}
              {extraCount > 1 && ` 等${extraCount}件`}
            </div>
          </div>
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary">
          {Math.round(progress)}%
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
            <span>{isTravel ? countdownText || statusText : statusText}</span>
            <span>{isTravel ? "目的地" : "🏠 收货地址"}</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h2 className="text-2xl font-semibold">
          {isTravel ? countdownText || statusText : statusText}
        </h2>
        <div className="mt-2 text-sm text-quiet">
          {isTravel
            ? (countdownText ? `${statusText}，${countdownText}` : "行程已安排")
            : "骑手正在飞速赶来，预计今晚马上送达～"}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-quiet">{isTravel ? "本单预订费用" : "本单虚拟消费"}</div>
            <div className="text-xl font-semibold text-price">
              {money(order.amount)}
            </div>
          </div>
          {isTravel ? (
            <button
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft"
              onClick={onAccelerate}
            >
              查看详情
            </button>
          ) : (
            <button
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft"
              onClick={onAccelerate}
            >
              加速配送
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
