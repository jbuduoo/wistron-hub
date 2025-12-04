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

