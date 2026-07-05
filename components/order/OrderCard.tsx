"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type PurchaseRecord, useShopStore } from "@/store/useShopStore";
import { money, formatPurchaseDate } from "@/utils/format";
import { calculateTravelCountdown, parseLocalDate } from "@/utils/order";

const AFTER_SALE_REASONS = [
  { value: "no_need", label: "不需要了" },
  { value: "change_mind", label: "买错了/后悔了" },
  { value: "quality", label: "虚拟品质不满意" },
  { value: "duplicate", label: "重复购买" },
  { value: "other", label: "其他原因" },
];

const AFTER_SALE_DURATION = 15 * 60 * 1000;
const IS_DEV = process.env.NODE_ENV === "development";

export function OrderCard({
  record,
  onAfterSale,
  onAfterSaleComplete,
}: {
  record: PurchaseRecord;
  onAfterSale: (id: string) => void;
  onAfterSaleComplete: (id: string) => void;
}) {
  const updateOrderStatus = useShopStore((s) => s.updateOrderStatus);
  const [expanded, setExpanded] = useState(false);
  const [showAfterSale, setShowAfterSale] = useState(false);
  const [afterSaleReason, setAfterSaleReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [afterSaleCountdown, setAfterSaleCountdown] = useState("");
  const [countdownText, setCountdownText] = useState("");
  const [progress, setProgress] = useState(0);
  const [travelStatus, setTravelStatus] = useState("");

  const onAfterSaleCompleteRef = useRef(onAfterSaleComplete);
  onAfterSaleCompleteRef.current = onAfterSaleComplete;

  useEffect(() => {
    if (record.afterSaleStatus !== "applied" || !record.afterSaleAppliedAt) return;

    const updateCountdown = () => {
      const appliedAt = new Date(record.afterSaleAppliedAt!).getTime();
      const now = Date.now();
      const elapsed = now - appliedAt;
      const remaining = Math.max(0, AFTER_SALE_DURATION - elapsed);

      if (remaining <= 0) {
        onAfterSaleCompleteRef.current(record.id);
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
  }, [record.afterSaleStatus, record.afterSaleAppliedAt, record.id]);

  useEffect(() => {
    if (!record.travelStartDate) return;
    
    const updateTravelInfo = () => {
      const specs = record.items[0]?.selectedSpecs;
      const startDate = parseLocalDate(record.travelStartDate || "");
      const endDate = parseLocalDate(
        specs?.["退房日期"] || specs?.["还车日期"] || record.travelStartDate || ""
      );
      const travelNights = specs
        ? Math.round(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / 86400000)
        : 1;
      const countdown = calculateTravelCountdown(record.travelStartDate, record.createdAt, travelNights);
      setCountdownText(countdown.displayText);
      setProgress(countdown.progress);
      
      if (countdown.status === "countdown") {
        setTravelStatus("待出行");
      } else if (countdown.status === "traveling") {
        setTravelStatus("已出行");
      } else if (countdown.status === "completed") {
        setTravelStatus("已完成");
      }
    };

    updateTravelInfo();
    const timer = window.setInterval(updateTravelInfo, 1000);
    return () => window.clearInterval(timer);
  }, [record.travelStartDate, record.createdAt]);

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

  const handleSubmit = useCallback(() => {
    if (!afterSaleReason) return;
    onAfterSale(record.id);
    setShowAfterSale(false);
    setAfterSaleReason("");
    setCustomReason("");
  }, [afterSaleReason, onAfterSale, record.id]);

  const firstItem = record.items[0];
  const extraCount = record.items.length - 1;

  const isTravelOrder = useMemo(
    () => record.travelStartDate && record.items.every((item) => item.category === "旅行"),
    [record.travelStartDate, record.items]
  );

  return (
    <div className="rounded-[20px] bg-white/70 backdrop-blur-md border border-white/50 overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
      <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
        <div className="flex flex-col">
          <span className="text-xs text-quiet">
            订单号：{record.orderNo}
          </span>
          <span className="text-[10px] text-quiet/70 mt-0.5">
            {formatPurchaseDate(record.createdAt)}
          </span>
        </div>
        <span className="text-xs font-medium text-primary">
          {isTravelOrder ? (
            travelStatus || "待出行"
          ) : record.status === "pending"
            ? "待付款"
            : record.status === "shipping"
            ? "配送中"
            : record.status === "aftersale"
            ? record.afterSaleStatus === "applied"
              ? `售后中 ${afterSaleCountdown ? `· ${afterSaleCountdown}` : ""}`
              : record.afterSaleStatus === "completed"
              ? "售后完成"
              : "售后中"
            : record.afterSaleStatus === "completed"
            ? "售后完成"
            : "已完成"}
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
              {isTravelOrder && record.travelStartDate && (
                <span className="text-primary">{countdownText}</span>
              )}
              {!isTravelOrder && `共 ${record.items.length} 件`}
            </div>
            <div className="mt-1 text-sm font-semibold text-price">
              {money(record.amount)}
            </div>
          </div>
          {record.items.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 text-xs text-quiet"
            >
              {expanded ? "收起" : "展开"}
            </button>
          )}
        </div>

        {isTravelOrder && record.travelStartDate && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-quiet text-right">
              {Math.round(progress)}%
            </div>
          </div>
        )}

        {(expanded || record.items.length === 1) && (
          <div className="mt-4 space-y-4">
            {record.items.length > 1 && (
              <div className="rounded-[14px] bg-black/[0.03] p-3 space-y-2">
                {record.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="mr-2">{item.emoji}</span>
                      {item.title}
                      {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                        <span className="text-xs text-quiet ml-2">
                          {Object.entries(item.selectedSpecs).map(([k, v]) => `${k}:${v}`).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="text-quiet">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {isTravelOrder && travelStatus === "待出行" ? (
                <button
                  onClick={() => updateOrderStatus(record.id, "completed")}
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
                >
                  确认出行
                </button>
              ) : record.status === "shipping" && !isTravelOrder ? (
                <button
                  onClick={() => updateOrderStatus(record.id, "completed")}
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
                >
                  确认收货
                </button>
              ) : !record.afterSaleStatus || record.afterSaleStatus === "none" ? (
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
              {AFTER_SALE_REASONS.map((reason, idx) => {
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
