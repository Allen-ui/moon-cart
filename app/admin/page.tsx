"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductManager } from "@/components/admin/ProductManager";
import { ShopManager } from "@/components/admin/ShopManager";
import { FeedbackViewer } from "@/components/admin/FeedbackViewer";
import { Package, Store, MessageSquare, Heart, LogOut, Lock } from "lucide-react";

type Tab = "products" | "shops" | "wishlist" | "messages";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("products");

  // 检查是否已登录（cookie 由服务端设置，这里只检查状态）
  useEffect(() => {
    fetch("/api/admin/products", { credentials: "include" })
      .then((res) => {
        if (res.ok) setLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  const handleLogin = useCallback(async () => {
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setLoggedIn(true);
        setPassword("");
      } else {
        setLoginError("密码错误");
      }
    } catch {
      setLoginError("网络错误");
    } finally {
      setLoggingIn(false);
    }
  }, [password]);

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF5000]">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">后台管理</h1>
            <p className="mt-1 text-sm text-gray-500">睡前逛逛 · Moon Cart</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="请输入管理密码"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF5000] focus:ring-1 focus:ring-[#FF5000]"
          />
          {loginError && (
            <p className="mt-2 text-sm text-red-500">{loginError}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loggingIn || !password}
            className="mt-4 w-full rounded-xl bg-[#FF5000] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loggingIn ? "登录中..." : "登录"}
          </button>
          <a
            href="/"
            className="mt-4 block text-center text-xs text-gray-400 hover:text-gray-600"
          >
            ← 返回前台
          </a>
        </div>
      </div>
    );
  }

  const tabs: Array<{ key: Tab; label: string; icon: typeof Package }> = [
    { key: "products", label: "商品管理", icon: Package },
    { key: "shops", label: "店铺管理", icon: Store },
    { key: "wishlist", label: "心愿清单", icon: Heart },
    { key: "messages", label: "用户留言", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <h1 className="text-lg font-bold text-gray-900">睡前逛逛 · 后台管理</h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              前台
            </a>
            <button
              onClick={() => {
                setLoggedIn(false);
                setPassword("");
              }}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        {/* 侧边栏 */}
        <nav className="w-48 shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#FF5000] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 内容区 */}
        <main className="min-w-0 flex-1">
          {activeTab === "products" && <ProductManager />}
          {activeTab === "shops" && <ShopManager />}
          {activeTab === "wishlist" && <FeedbackViewer type="wishlist" />}
          {activeTab === "messages" && <FeedbackViewer type="messages" />}
        </main>
      </div>
    </div>
  );
}
