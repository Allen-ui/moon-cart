"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, MessageSquare, RefreshCw } from "lucide-react";

type FeedbackItem = {
  id: string;
  title?: string;
  note?: string;
  content?: string;
  createdAt: string;
};

export function FeedbackViewer({ type }: { type: "wishlist" | "messages" }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feedback", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setItems(type === "wishlist" ? data.wishlist : data.messages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const isWishlist = type === "wishlist";
  const Icon = isWishlist ? Heart : MessageSquare;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon className="h-5 w-5 text-[#FF5000]" />
          {isWishlist ? "用户心愿清单" : "用户留言"}
          {items.length > 0 && <span className="text-gray-400">（{items.length}条）</span>}
        </h2>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">加载中...</p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Icon className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="text-sm text-gray-400">暂无{isWishlist ? "心愿" : "留言"}</p>
          <p className="mt-1 text-xs text-gray-300">
            用户在前台{isWishlist ? "添加心愿" : "提交留言"}后会自动同步到这里
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              {isWishlist ? (
                <>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  {item.note && (
                    <div className="mt-1 text-sm text-gray-500">{item.note}</div>
                  )}
                </>
              ) : (
                <div className="leading-relaxed text-gray-900">{item.content}</div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                {formatDate(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}
