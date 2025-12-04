# Supabase 認證系統設定說明

## 1. 建立 users 資料表（用於用戶認證）

在 Supabase Dashboard 的 SQL Editor 中執行以下 SQL：

```sql
-- 建立用戶認證資料表
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'user',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_role ON users(role);

-- 建立預設管理員帳號
INSERT INTO users (username, password, name, email, role, points)
VALUES ('admin', '1234', '系統管理員', 'admin@wistron.com', 'admin', 0)
ON CONFLICT (username) DO UPDATE
SET role = 'admin',
    updated_at = NOW();

-- 設定 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取（用於顯示用戶資訊）
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- 允許所有人新增（註冊新用戶）
CREATE POLICY "Allow public insert access" ON users
  FOR INSERT WITH CHECK (true);

-- 允許用戶更新自己的資料（需要驗證）
CREATE POLICY "Allow user to update own profile" ON users
  FOR UPDATE USING (true);

-- 注意：實際生產環境應該：
-- 1. 使用 Supabase Auth 進行密碼加密
-- 2. 限制 UPDATE 權限，只允許用戶更新自己的資料
-- 3. 使用更安全的密碼儲存方式（如 bcrypt）
```

## 2. 更新 contents 表（添加 user_id 關聯）

```sql
-- 添加 user_id 欄位到 contents 表（可選，用於關聯用戶）
ALTER TABLE contents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);
```

## 3. 更新 user_profiles 表（如果已存在）

如果之前已經建立了 `user_profiles` 表，可以選擇：
- 合併到 `users` 表
- 或保持兩個表，使用 `username` 作為關聯

## 4. 密碼安全建議

**重要：** 目前的實作將密碼以明文儲存，這在生產環境中是不安全的。

### 建議的改進方案：

1. **使用 Supabase Auth**（推薦）
   - 使用 Supabase 內建的認證系統
   - 自動處理密碼加密
   - 支援多種登入方式（Email、OAuth 等）

2. **使用 bcrypt 加密**（如果使用自定義認證）
   - 在後端 API 中加密密碼
   - 使用 Supabase Edge Functions 處理認證邏輯

## 5. 資料遷移

如果已經有 localStorage 中的用戶資料，可以使用以下腳本遷移：

```javascript
// 遷移腳本（在瀏覽器 Console 中執行）
const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
for (const user of localUsers) {
    // 呼叫 Supabase API 新增用戶
    // 注意：需要先加密密碼
}
```

## 6. 測試

完成設定後，測試以下功能：
- [ ] 用戶註冊
- [ ] 用戶登入
- [ ] 用戶登出
- [ ] 更新用戶資訊
- [ ] 知識積分同步

