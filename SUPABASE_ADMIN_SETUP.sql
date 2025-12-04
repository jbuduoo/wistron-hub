-- Supabase 管理員帳號設定 SQL
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

-- 1. 確保 users 表有 role 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 2. 建立管理員帳號（如果不存在）
-- 注意：密碼是明文 "1234"，實際應用應該使用加密
INSERT INTO users (username, password, name, email, role, points)
VALUES ('admin', '1234', '系統管理員', 'admin@wistron.com', 'admin', 0)
ON CONFLICT (username) DO UPDATE
SET role = 'admin',
    updated_at = NOW();

-- 3. 建立索引（如果還沒有）
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. 驗證管理員帳號已建立
SELECT username, name, role, created_at 
FROM users 
WHERE username = 'admin';

-- 5. 建立 admin_config 表（用於儲存後台管理配置）
CREATE TABLE IF NOT EXISTS admin_config (
    id BIGSERIAL PRIMARY KEY,
    config_type VARCHAR(50) NOT NULL,
    config_data JSONB NOT NULL,
    name VARCHAR(255),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 建立索引
CREATE INDEX IF NOT EXISTS idx_admin_config_type ON admin_config(config_type);
CREATE INDEX IF NOT EXISTS idx_admin_config_order ON admin_config("order");

-- 7. 啟用 Row Level Security (RLS)
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- 8. 建立 RLS 政策（允許管理員讀寫）
-- 先刪除已存在的政策（如果有的話），然後重新建立
DROP POLICY IF EXISTS "管理員可以讀取 admin_config" ON admin_config;
CREATE POLICY "管理員可以讀取 admin_config"
    ON admin_config FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "管理員可以插入 admin_config" ON admin_config;
CREATE POLICY "管理員可以插入 admin_config"
    ON admin_config FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "管理員可以更新 admin_config" ON admin_config;
CREATE POLICY "管理員可以更新 admin_config"
    ON admin_config FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "管理員可以刪除 admin_config" ON admin_config;
CREATE POLICY "管理員可以刪除 admin_config"
    ON admin_config FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

-- 注意：如果 RLS 政策太複雜，可以暫時使用以下簡化版本（僅用於開發測試）
-- 警告：這會允許所有已認證用戶訪問，僅用於開發環境！
-- DROP POLICY IF EXISTS "管理員可以讀取 admin_config" ON admin_config;
-- DROP POLICY IF EXISTS "管理員可以插入 admin_config" ON admin_config;
-- DROP POLICY IF EXISTS "管理員可以更新 admin_config" ON admin_config;
-- DROP POLICY IF EXISTS "管理員可以刪除 admin_config" ON admin_config;
-- CREATE POLICY "允許所有已認證用戶訪問 admin_config" ON admin_config FOR ALL USING (auth.role() = 'authenticated');

