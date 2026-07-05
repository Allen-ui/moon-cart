import { NextRequest, NextResponse } from "next/server";
import { isValidToken, saveUploadedImage } from "@/utils/admin-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!(await isValidToken(token))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "未找到文件" }, { status: 400 });
  }

  // 限制 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "文件不能超过5MB" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "仅支持 JPG/PNG/WebP/GIF" }, { status: 400 });
  }

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = extMap[file.type] || "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveUploadedImage(buffer, ext);

  return NextResponse.json({ url });
}
