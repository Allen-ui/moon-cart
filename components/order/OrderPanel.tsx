"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { type DeliveryOrder, getDeliverySteps, calculateTravelCountdown, parseLocalDate } from "@/utils/order";
import { money } from "@/utils/format";
import { BoughtItems } from "./BoughtItems";

export function OrderPanel({
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
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    if (orders.length) setActiveIndex(orders.length - 1);
  }, [orders.length]);

  useEffect(() => {
    if (!open || orders.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % orders.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [open, orders.length]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      onClose();
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open || !orders.length) return null;
  const safeIndex = Math.min(activeIndex, orders.length - 1);
  const selected = orders[safeIndex];
  const selectedSteps = getDeliverySteps(selected.channel);
  
  // 旅行订单：计算倒计时进度
  let progress = 0;
  let displayText = "";
  if (selected.channel === "travel" && selected.travelStartDate) {
    const travelNights = selected.items[0]?.selectedSpecs ? 
      Math.round(((parseLocalDate(selected.items[0].selectedSpecs["退房日期"] || selected.items[0].selectedSpecs["还车日期"] || selected.travelStartDate)?.getTime() || 0) - (parseLocalDate(selected.travelStartDate)?.getTime() || 0)) / 86400000) : 1;
    const countdown = calculateTravelCountdown(selected.travelStartDate, selected.createdAt, travelNights);
    progress = countdown.progress;
    displayText = countdown.displayText;
  } else {
    progress = Math.round(
      ((selected.stepIndex + 1) / selectedSteps.length) * 100,
    );
    displayText = selectedSteps[selected.stepIndex];
  }

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
                {orders.length > 1 ? `${selected.channel === "travel" ? "待出行" : "配送中"} · 共 ${orders.length} 单` : "订单生成成功"}
              </div>
              <div className="mt-1 text-xl font-semibold">
                {displayText}
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
              订单 {safeIndex + 1} · {selected.channel === "travel" ? "虚拟出行进度" : "虚拟配送进度"}
            </span>
            <span className="font-semibold text-price">{Math.round(progress)}%</span>
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
            {selected.channel !== "travel" && (
              <button
                className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white"
                onClick={() => onAccelerate(selected.id)}
              >
                加速配送
              </button>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
