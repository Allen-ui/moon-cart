import { promises as fs } from "fs";
import path from "path";
import type { Product } from "@/data/products";

// 后台数据存储路径
const DATA_DIR = path.join(process.cwd(), "data");
const ADMIN_DATA_FILE = path.join(DATA_DIR, "admin-data.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export type AdminData = {
  // 商品覆盖：以 id 为 key，只存被修改的字段
  productOverrides: Record<number, Partial<Product>>;
  // 后台新增的自定义商品
  customProducts: Product[];
  // 店铺主图：以店铺名为 key
  shopImages: Record<string, string>;
  // 从客户端同步的心愿单
  wishlist: Array<{
    id: string;
    title: string;
    note?: string;
    createdAt: string;
    clientId?: string;
  }>;
  // 从客户端同步的留言
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    clientId?: string;
  }>;
};

const defaultData: AdminData = {
  productOverrides: {},
  customProducts: [],
  shopImages: {},
  wishlist: [],
  messages: [],
};

// 确保目录和数据文件存在
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  try {
    await fs.access(ADMIN_DATA_FILE);
  } catch {
    await fs.writeFile(ADMIN_DATA_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  }
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function readAdminData(): Promise<AdminData> {
  await ensureDataFile();
  const raw = await fs.readFile(ADMIN_DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
}

export async function writeAdminData(data: AdminData): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(ADMIN_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// 保存上传的图片，返回可访问的 URL 路径
export async function saveUploadedImage(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  await ensureDataFile();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

// 简单的 session token 管理（内存，重启失效）
const validTokens = new Set<string>();
const ADMIN_PASSWORD = "admin123";

export function validateLogin(password: string): string | null {
  if (password === ADMIN_PASSWORD) {
    const token = `tk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    validTokens.add(token);
    return token;
  }
  return null;
}

export function isValidToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return validTokens.has(token);
}

export function revokeToken(token: string): void {
  validTokens.delete(token);
}
