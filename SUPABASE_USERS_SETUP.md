# Supabase Users 表設定說明

## 建立 users 資料表

在 Supabase Dashboard 的 SQL Editor 中執行以下 SQL：

```sql
-- 建立用戶資料表（用於知識積分系統）
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_points ON users(points DESC);

-- 設定 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- 允許所有人新增（建立新用戶）
CREATE POLICY "Allow public insert access" ON users
  FOR INSERT WITH CHECK (true);

-- 允許所有人更新（更新積分）
CREATE POLICY "Allow public update access" ON users
  FOR UPDATE USING (true);
```

## 知識積分系統說明

- **發文加分**：每次發布內容（任何類型）自動獲得 1 知識積分
- **積分顯示**：在頁面右上角顯示當前用戶的知識積分
- **自動建立**：首次發文時自動建立用戶記錄
- **積分累積**：每次發文都會累積積分

## 注意事項

- 用戶名稱（name）必須唯一
- 積分預設為 0
- 系統會自動記錄用戶建立和更新時間

