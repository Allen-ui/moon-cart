import { NextRequest, NextResponse } from "next/server";
import { validateLogin } from "@/utils/admin-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const token = validateLogin(password);
    if (!token) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
