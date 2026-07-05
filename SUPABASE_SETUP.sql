-- 在 Supabase SQL Editor 中执行此脚本创建所需的表

-- 管理员数据存储（商品覆盖、自定义商品、店铺主图、心愿单、留言）
CREATE TABLE IF NOT EXISTS admin_data (
  id INT PRIMARY KEY DEFAULT 1,
  product_overrides JSONB DEFAULT '{}'::jsonb,
  custom_products JSONB DEFAULT '[]'::jsonb,
  shop_images JSONB DEFAULT '{}'::jsonb,
  wishlist JSONB DEFAULT '[]'::jsonb,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理员登录 Token 存储（用于服务端会话验证）
CREATE TABLE IF NOT EXISTS admin_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 RLS 策略（允许所有操作，因为是后台管理）
ALTER TABLE admin_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on admin_data" ON admin_data
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all on admin_tokens" ON admin_tokens
  FOR ALL USING (true)
  WITH CHECK (true);

-- 创建存储桶用于上传图片
INSERT INTO storage.buckets (id, name) 
VALUES ('uploads', 'uploads') 
ON CONFLICT (id) DO NOTHING;

-- 允许公开访问上传的图片
CREATE POLICY "Public access for uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- 允许上传图片
CREATE POLICY "Allow upload to uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');
