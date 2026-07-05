import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import type { Product } from "@/data/products";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const ADMIN_DATA_FILE = path.join(DATA_DIR, "admin-data.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const CACHE_TTL = 30_000;
let cachedData: AdminData | null = null;
let cacheExpireAt = 0;
let dataFileInitialized = false;

export type AdminData = {
  productOverrides: Record<number, Partial<Product>>;
  customProducts: Product[];
  shopImages: Record<string, string>;
  wishlist: Array<{
    id: string;
    title: string;
    note?: string;
    createdAt: string;
    clientId?: string;
  }>;
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

async function ensureDataFile(): Promise<void> {
  if (dataFileInitialized) return;
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
  dataFileInitialized = true;
}

async function readFileData(): Promise<AdminData> {
  await ensureDataFile();
  const raw = await fs.readFile(ADMIN_DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
}

async function writeFileData(data: AdminData): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(ADMIN_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function readDbData(): Promise<AdminData> {
  if (!supabase) return defaultData;
  try {
    const { data, error } = await supabase
      .from("admin_data")
      .select("*")
      .single();
    if (error || !data) {
      return defaultData;
    }
    return {
      ...defaultData,
      productOverrides: data.product_overrides || {},
      customProducts: data.custom_products || [],
      shopImages: data.shop_images || {},
      wishlist: data.wishlist || [],
      messages: data.messages || [],
    };
  } catch {
    return defaultData;
  }
}

async function writeDbData(data: AdminData): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("admin_data")
      .upsert({
        id: 1,
        product_overrides: data.productOverrides,
        custom_products: data.customProducts,
        shop_images: data.shopImages,
        wishlist: data.wishlist,
        messages: data.messages,
      });
    if (error) throw error;
  } catch {
    // ignore
  }
}

export const readAdminData = cache(async (): Promise<AdminData> => {
  const now = Date.now();
  if (cachedData && now < cacheExpireAt) {
    return cachedData;
  }
  const data = hasSupabaseConfig ? await readDbData() : await readFileData();
  cachedData = data;
  cacheExpireAt = now + CACHE_TTL;
  return data;
});

function invalidateAdminCache() {
  cachedData = null;
  cacheExpireAt = 0;
}

export async function writeAdminData(data: AdminData): Promise<void> {
  if (hasSupabaseConfig) {
    await writeDbData(data);
  } else {
    await writeFileData(data);
  }
  invalidateAdminCache();
}

export async function saveUploadedImage(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  if (hasSupabaseConfig && supabase) {
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filename, buffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });
    if (error || !data) {
      throw new Error("上传失败");
    }
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filename);
    return urlData.publicUrl;
  } else {
    await ensureDataFile();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }
}

const validTokens = new Set<string>();

const ADMIN_PASSWORD = "admin123";

export function validateLogin(password: string): string | null {
  if (password === ADMIN_PASSWORD) {
    return `tk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  return null;
}

export async function isValidToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  if (!hasSupabaseConfig) {
    return validTokens.has(token);
  }
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from("admin_tokens")
      .select("id")
      .eq("token", token)
      .single();
    return !error && !!data;
  } catch {
    return false;
  }
}

export async function storeToken(token: string): Promise<void> {
  if (!hasSupabaseConfig) {
    validTokens.add(token);
    return;
  }
  if (!supabase) return;
  try {
    await supabase.from("admin_tokens").insert({ token });
  } catch {
    // ignore
  }
}

export async function revokeToken(token: string): Promise<void> {
  validTokens.delete(token);
  if (hasSupabaseConfig && supabase) {
    try {
      await supabase.from("admin_tokens").delete().eq("token", token);
    } catch {
      // ignore
    }
  }
}
