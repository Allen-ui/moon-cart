import { NextRequest, NextResponse } from "next/server";
import { readAdminData, writeAdminData } from "@/utils/admin-store";

export const runtime = "nodejs";

// 客户端同步心愿单和留言到服务器
export async function POST(request: NextRequest) {
  try {
    const bodyP = request.json();
    const dataP = readAdminData();
    const [body, data] = await Promise.all([bodyP, dataP]);

    let updated = false;

    if (body.wishlist && Array.isArray(body.wishlist)) {
      // 以 id 去重，合并新心愿
      const existingIds = new Set(data.wishlist.map((w) => w.id));
      const newItems = body.wishlist.filter((w: { id: string }) => !existingIds.has(w.id));
      if (newItems.length > 0) {
        data.wishlist = [...newItems, ...data.wishlist].slice(0, 500);
        updated = true;
      }
    }

    if (body.messages && Array.isArray(body.messages)) {
      const existingIds = new Set(data.messages.map((m) => m.id));
      const newItems = body.messages.filter((m: { id: string }) => !existingIds.has(m.id));
      if (newItems.length > 0) {
        data.messages = [...newItems, ...data.messages].slice(0, 500);
        updated = true;
      }
    }

    if (updated) {
      await writeAdminData(data);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
