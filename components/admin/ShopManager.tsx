"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, X, Store } from "lucide-react";

type Shop = {
  name: string;
  image: string | null;
  productCount: number;
};

export function ShopManager() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Shop | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shops", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        店铺管理 {shops.length > 0 && <span className="text-gray-400">（{shops.length}家）</span>}
      </h2>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">加载中...</p>
      ) : shops.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">暂无店铺（商品中未设置 shop 字段）</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {shops.map((shop) => (
            <div
              key={shop.name}
              className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md"
              onClick={() => setEditing(shop)}
            >
              <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                {shop.image ? (
                  <img src={shop.image} alt={shop.name} className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-10 w-10 text-gray-300" />
                )}
              </div>
              <div className="truncate text-sm font-medium text-gray-900">{shop.name}</div>
              <div className="mt-0.5 text-xs text-gray-400">{shop.productCount} 件商品</div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ShopEditDialog
          shop={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchShops();
          }}
        />
      )}
    </div>
  );
}

function ShopEditDialog({
  shop,
  onClose,
  onSaved,
}: {
  shop: Shop;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [image, setImage] = useState(shop.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImage(data.url);
      } else {
        const err = await res.json();
        alert(err.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName: shop.name, image }),
      });
      if (res.ok) {
        onSaved();
      } else {
        alert("保存失败");
      }
    } catch {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">编辑店铺主图</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 text-sm font-medium text-gray-700">{shop.name}</div>

        {/* 预览 */}
        <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
          {image ? (
            <img src={image} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <Store className="h-12 w-12 text-gray-300" />
          )}
        </div>

        {/* 上传 */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "上传中..." : "上传图片"}
          </button>
          {image && (
            <button
              onClick={() => setImage("")}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              移除图片
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#FF5000] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
