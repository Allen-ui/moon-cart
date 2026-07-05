import { NextResponse } from "next/server";
import { readAdminData } from "@/utils/admin-store";
import { products as staticProducts } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 公开接口：返回合并后的商品数据（静态 + 覆盖 + 自定义）
export async function GET() {
  const data = await readAdminData();
  const merged = [
    ...staticProducts.map((p) => ({ ...p, ...data.productOverrides[p.id] })),
    ...data.customProducts,
  ];
  return NextResponse.json({
    products: merged,
    shopImages: data.shopImages,
  });
}
