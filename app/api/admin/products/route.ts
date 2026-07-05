import { NextRequest, NextResponse } from "next/server";
import { isValidToken, readAdminData, writeAdminData } from "@/utils/admin-store";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/data/products";

export const runtime = "nodejs";

// 获取所有商品（静态 + 自定义 + 覆盖）
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const data = await readAdminData();
  const merged: Product[] = [
    ...staticProducts.map((p) => ({ ...p, ...data.productOverrides[p.id] })),
    ...data.customProducts,
  ];

  return NextResponse.json({ products: merged, overrides: data.productOverrides });
}

// 新增自定义商品
export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = await readAdminData();

    const newId = Math.max(...staticProducts.map((p) => p.id), ...data.customProducts.map((p) => p.id), 9000) + 1;

    const newProduct: Product = {
      id: newId,
      title: body.title || "未命名商品",
      price: Number(body.price) || 0,
      image: `custom-${newId}`,
      category: body.category || "生活用品",
      subCategory: body.subCategory,
      shop: body.shop,
      shopImage: body.shopImage,
      sales: body.sales || "0",
      coupon: body.coupon || `满${Math.max(29, Number(body.price) || 0)}减5`,
      tags: body.tags || [],
      intro: body.intro || "一份不用犹豫的虚拟奖励。加入购物车，获得下单成功的快乐，不产生任何真实消费。",
      palette: body.palette || "from-orange-400 to-amber-500",
      emoji: body.emoji || "📦",
      imageUrl: body.imageUrl,
      specs: body.specs,
    };

    data.customProducts.push(newProduct);
    await writeAdminData(data);

    return NextResponse.json({ success: true, product: newProduct });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
