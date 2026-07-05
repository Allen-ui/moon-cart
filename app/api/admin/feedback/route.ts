import { NextRequest, NextResponse } from "next/server";
import { isValidToken, readAdminData } from "@/utils/admin-store";

export const runtime = "nodejs";

// 获取所有心愿单和留言
export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const authP = isValidToken(token);
  const dataP = readAdminData();
  if (!(await authP)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const data = await dataP;
  return NextResponse.json({
    wishlist: data.wishlist,
    messages: data.messages,
  });
}
