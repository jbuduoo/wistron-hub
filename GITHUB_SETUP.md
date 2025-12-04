# GitHub API 設定說明

本專案使用 GitHub API + JSON 檔案來儲存資料，讓您的靜態網站可以持久化儲存內容。

## 📋 設定步驟

### 1. 建立 GitHub Repository

1. 登入 GitHub
2. 建立一個新的 Repository（可以是公開或私有）
3. 記下 Repository 名稱，例如：`wistron-share-platform`

### 2. 建立 GitHub Personal Access Token

1. 前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 網址：https://github.com/settings/tokens
2. 點擊 "Generate new token (classic)"
3. 填寫以下資訊：
   - **Note**: 例如 "Wistron Share Platform"
   - **Expiration**: 選擇過期時間（建議選擇較長時間）
   - **Scopes**: 勾選 `repo` 權限（需要完整權限）
4. 點擊 "Generate token"
5. **重要**：複製產生的 token（只會顯示一次！）

### 3. 設定 config.js

編輯 `config.js` 檔案，填入您的資訊：

```javascript
const GITHUB_CONFIG = {
    username: 'your-github-username',      // 您的 GitHub 使用者名稱
    repo: 'your-repo-name',                 // Repository 名稱
    token: 'ghp_xxxxxxxxxxxxxxxxxxxx',      // 剛才建立的 Personal Access Token
    dataPath: 'data.json',                   // 資料檔案路徑（通常保持 data.json）
    branch: 'main'                           // 分支名稱（通常是 main 或 master）
};
```

### 4. 初始化資料檔案

1. 在您的 GitHub Repository 中建立 `data.json` 檔案
2. 初始內容可以是空陣列：`[]`
3. 或者直接上傳專案中的 `data.json` 檔案

### 5. 部署到 GitHub Pages

1. 將所有檔案推送到 GitHub Repository
2. 前往 Repository Settings → Pages
3. 選擇 Source 為 `main` branch（或您使用的分支）
4. 點擊 Save
5. 等待幾分鐘，您的網站就會在 `https://your-username.github.io/your-repo-name/` 上線

## 🔒 安全性注意事項

⚠️ **重要**：GitHub Personal Access Token 具有完整權限，請妥善保管！

### 建議做法：

1. **不要將 token 提交到公開 Repository**
   - 如果 Repository 是公開的，請使用 GitHub Secrets（需要 GitHub Actions）
   - 或者將 `config.js` 加入 `.gitignore`

2. **使用環境變數（進階）**
   - 可以透過 GitHub Pages 的環境變數功能設定
   - 或使用 GitHub Actions Secrets

3. **限制 Token 權限**
   - 只給予必要的 `repo` 權限
   - 定期更新 Token

## 🚀 使用方式

設定完成後：

1. **讀取資料**：網站會自動從 GitHub 讀取 `data.json`
2. **新增內容**：使用者上傳內容時，會自動更新到 GitHub
3. **備援機制**：如果 GitHub API 失敗，會自動使用 localStorage 作為備援

## 📝 資料格式

`data.json` 檔案格式為 JSON 陣列，每個項目包含：

```json
[
  {
    "id": "1234567890",
    "type": "news",
    "title": "標題",
    "author": "作者",
    "description": "描述",
    "views": 0,
    "likes": 0,
    "reward": null,
    "createdAt": "2024-12-20T10:00:00Z"
  }
]
```

## 🐛 疑難排解

### 問題：無法讀取資料

- 檢查 `config.js` 設定是否正確
- 確認 Repository 是公開的，或 Token 有正確權限
- 檢查瀏覽器 Console 是否有錯誤訊息

### 問題：無法儲存資料

- 確認 Token 有 `repo` 權限
- 檢查 Token 是否過期
- 確認 Repository 名稱和分支名稱正確

### 問題：CORS 錯誤

- GitHub API 支援 CORS，不應該出現此問題
- 如果出現，可能是 Token 權限不足

## 📚 相關資源

- [GitHub API 文件](https://docs.github.com/en/rest)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Pages](https://pages.github.com/)


