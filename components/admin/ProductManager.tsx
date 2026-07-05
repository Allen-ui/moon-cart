"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Upload, Plus, X, Save, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) =>
    !search || p.title.includes(search) || p.category.includes(search) || (p.shop ?? "").includes(search)
  );

  return (
    <div>
      {/* 工具栏 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索商品名称、分类、店铺"
            className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 rounded-xl bg-[#FF5000] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          新增商品
        </button>
      </div>

      {/* 商品列表 */}
      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">加载中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">暂无商品</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md"
              onClick={() => setEditing(product)}
            >
              <div className="mb-2 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">{product.emoji}</span>
                )}
              </div>
              <div className="truncate text-sm font-medium text-gray-900">{product.title}</div>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-sm font-bold text-[#FF5000]">¥{product.price}</span>
                <span className="text-xs text-gray-400">{product.category}</span>
              </div>
              {product.shop && (
                <div className="mt-0.5 truncate text-xs text-gray-400">📦 {product.shop}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 编辑弹窗 */}
      {editing && (
        <EditDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchProducts();
          }}
        />
      )}

      {/* 新增弹窗 */}
      {showAdd && (
        <AddDialog
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

// ========== 编辑弹窗 ==========
function EditDialog({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [emoji, setEmoji] = useState(product.emoji);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
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
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji,
          imageUrl: imageUrl || undefined,
          title,
          price: Number(price),
        }),
      });
      if (res.ok) {
        onSaved();
      } else {
        alert("保存失败");
      }
    } catch {
      alert("保存失败");
    }
  };

  const handleRemoveImage = async () => {
    setImageUrl("");
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: undefined }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">编辑商品</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 预览 */}
        <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
          {imageUrl ? (
            <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl">{emoji}</span>
          )}
        </div>

        {/* 图片上传 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">商品主图</label>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "上传中..." : "上传图片"}
            </button>
            {imageUrl && (
              <button
                onClick={handleRemoveImage}
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <ImageIcon className="h-4 w-4" />
                移除图片
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">上传图片后前台将显示图片替代 emoji，支持 JPG/PNG/WebP/GIF，最大5MB</p>
        </div>

        {/* Emoji */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Emoji 表情（无图片时显示）</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>

        {/* 标题 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">商品名称</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>

        {/* 价格 */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">价格（元）</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
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
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#FF5000] py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            保存
          </button>
        </div>

        {/* 商品额外信息 */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          <div>ID: {product.id}</div>
          <div>分类: {product.category}{product.subCategory ? ` / ${product.subCategory}` : ""}</div>
          {product.shop && <div>店铺: {product.shop}</div>}
        </div>
      </div>
    </div>
  );
}

// ========== 新增弹窗 ==========
function AddDialog({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("生活用品");
  const [emoji, setEmoji] = useState("📦");
  const [imageUrl, setImageUrl] = useState("");
  const [shop, setShop] = useState("");
  const [intro, setIntro] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ["外卖", "水果", "零食", "饮料", "数码", "美妆", "鞋服", "家电", "生活用品", "旅行"];

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
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

  const handleAdd = async () => {
    if (!title.trim() || !price) {
      alert("请填写商品名称和价格");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price: Number(price),
          category,
          emoji,
          imageUrl: imageUrl || undefined,
          shop: shop.trim() || undefined,
          intro: intro.trim() || undefined,
        }),
      });
      if (res.ok) {
        onAdded();
      } else {
        alert("添加失败");
      }
    } catch {
      alert("添加失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">新增商品</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 预览 */}
        <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
          {imageUrl ? (
            <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl">{emoji}</span>
          )}
        </div>

        {/* 图片上传 */}
        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">商品主图（可选）</label>
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
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "上传中..." : "上传图片"}
          </button>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Emoji（无图片时显示）</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">商品名称 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：限量手办"
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">价格 *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="如：99"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">店铺名称（可选）</label>
          <input
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            placeholder="如：官方旗舰店"
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">商品简介（可选）</label>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={2}
            placeholder="商品描述"
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#FF5000]"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#FF5000] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving ? "添加中..." : "添加商品"}
          </button>
        </div>
      </div>
    </div>
  );
}
