import { NextRequest, NextResponse } from "next/server";
import { isValidToken, readAdminData, writeAdminData } from "@/utils/admin-store";
import { products as staticProducts } from "@/data/products";

export const runtime = "nodejs";

// 更新商品（覆盖字段）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = request.cookies.get("admin_token")?.value;
  const authP = isValidToken(token);
  const bodyP = request.json();
  const dataP = readAdminData();
  if (!(await authP)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const [body, data] = await Promise.all([bodyP, dataP]);
    const productId = Number(params.id);

    // 检查是否是自定义商品
    const customIndex = data.customProducts.findIndex((p) => p.id === productId);
    if (customIndex >= 0) {
      data.customProducts[customIndex] = { ...data.customProducts[customIndex], ...body };
      await writeAdminData(data);
      return NextResponse.json({ success: true, product: data.customProducts[customIndex] });
    }

    // 静态商品 → 写入覆盖层
    data.productOverrides[productId] = {
      ...data.productOverrides[productId],
      ...body,
    };
    await writeAdminData(data);

    const original = staticProducts.find((p) => p.id === productId);
    const merged = { ...original, ...data.productOverrides[productId] };

    return NextResponse.json({ success: true, product: merged });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}

// 删除自定义商品（静态商品不支持删除，只能清除覆盖）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = request.cookies.get("admin_token")?.value;
  const authP = isValidToken(token);
  const dataP = readAdminData();
  if (!(await authP)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const productId = Number(params.id);
  const data = await dataP;

  const customIndex = data.customProducts.findIndex((p) => p.id === productId);
  if (customIndex >= 0) {
    data.customProducts.splice(customIndex, 1);
    await writeAdminData(data);
    return NextResponse.json({ success: true });
  }

  // 清除静态商品的覆盖
  if (data.productOverrides[productId]) {
    delete data.productOverrides[productId];
    await writeAdminData(data);
  }

  return NextResponse.json({ success: true });
}
