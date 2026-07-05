import { NextRequest, NextResponse } from "next/server";
import { isValidToken, saveUploadedImage } from "@/utils/admin-store";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const authP = isValidToken(token);
  const formDataP = request.formData();
  if (!(await authP)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const formData = await formDataP;
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "未找到文件" }, { status: 400 });
  }

  // 限制 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "文件不能超过5MB" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "仅支持 JPG/PNG/WebP/GIF" }, { status: 400 });
  }

  const ext = EXT_MAP[file.type] || "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveUploadedImage(buffer, ext);

  return NextResponse.json({ url });
}
