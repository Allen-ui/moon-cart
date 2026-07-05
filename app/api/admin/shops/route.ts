import { NextRequest, NextResponse } from "next/server";
import { isValidToken, readAdminData, writeAdminData } from "@/utils/admin-store";
import { products as staticProducts } from "@/data/products";

export const runtime = "nodejs";

// 获取所有店铺列表及主图
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const authP = isValidToken(token);
  const dataP = readAdminData();
  if (!(await authP)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const data = await dataP;
  // 收集所有有 shop 字段的商品，去重得到店铺列表
  const shopSet = new Set<string>();
  staticProducts.forEach((p) => {
    if (p.shop) shopSet.add(p.shop);
  });
  data.customProducts.forEach((p) => {
    if (p.shop) shopSet.add(p.shop);
  });

  const shops = Array.from(shopSet).map((name) => ({
    name,
    image: data.shopImages[name] || null,
    productCount: staticProducts.filter((p) => p.shop === name).length
      + data.customProducts.filter((p) => p.shop === name).length,
  }));

  return NextResponse.json({ shops });
}

// 更新店铺主图
export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const authP = isValidToken(token);
  const bodyP = request.json();
  const dataP = readAdminData();
  if (!(await authP)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const [{ shopName, image }, data] = await Promise.all([bodyP, dataP]);
    data.shopImages[shopName] = image;
    await writeAdminData(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
