# 緯創分享平台

一個專業的企業內部內容分享平台，支援影片、文章和建議的發布與展示，並包含認證獎勵機制。

## 功能特色

- 🎬 **影片分享** - 支援影片內容上傳與播放
- 📄 **文章分享** - 發布和閱讀專業文章內容
- 💭 **建議提案** - 提交公司改進建議與創新想法
- 🏆 **認證系統** - 符合規範的內容可獲得金/銀/銅牌認證徽章
- 🔍 **搜尋功能** - 快速搜尋內容
- 📱 **響應式設計** - 適配各種裝置尺寸
- 🎨 **專業設計** - 現代化企業級 UI/UX 設計

## 檔案結構

```
├── index.html          # 主頁面（內容展示）
├── upload.html         # 上傳頁面
├── detail.html         # 內容詳情頁面
├── styles.css          # 樣式檔案
├── script.js           # JavaScript 功能
├── config.js           # GitHub API 設定檔
├── github-api.js       # GitHub API 工具函數
├── data.json           # 資料檔案（可選，會自動建立）
├── README.md           # 說明檔案
└── GITHUB_SETUP.md     # GitHub API 設定說明
```

## 使用方式

1. 直接在瀏覽器開啟 `index.html` 即可使用
2. 所有資料儲存在瀏覽器的 localStorage 中
3. 首次開啟會自動載入範例資料

## 頁面說明

### 主頁面 (index.html)
- 展示所有內容的專業網格佈局
- 側邊欄可篩選內容類型（全部/影片分享/文章分享/建議提案）
- 支援即時搜尋功能
- 可依最新發布、最受歡迎、認證等級排序

### 上傳頁面 (upload.html)
- 選擇內容類型（影片分享/文章分享/建議提案）
- 填寫標題、作者、描述
- 可上傳檔案（影片或圖片）
- 內容規範與獎勵標準說明
- 提交後儲存到 localStorage

### 詳情頁面 (detail.html)
- 顯示完整內容
- 顯示作者資訊、觀看數、點讚數
- 顯示認證徽章（金/銀/銅牌）
- 支援點讚和分享功能
- 相關內容推薦

## 技術說明

- **純前端實現** - 使用 HTML5、CSS3、Vanilla JavaScript
- **資料儲存** - 使用 GitHub API + JSON 檔案（可選：localStorage 備援）
- **響應式設計** - 使用 CSS Grid 和 Flexbox
- **無需後端伺服器** - 使用 GitHub API 作為資料庫

## 設定說明

### GitHub API 設定

本專案使用 GitHub API 來儲存資料，請先完成設定：

1. **建立 GitHub Repository**
2. **建立 Personal Access Token**（需要 `repo` 權限）
3. **編輯 `config.js`** 填入您的 GitHub 資訊
4. **在 Repository 中建立 `data.json`** 檔案

詳細設定步驟請參考 [GITHUB_SETUP.md](./GITHUB_SETUP.md)

### 快速開始

1. 設定 `config.js` 檔案
2. 直接在瀏覽器開啟 `index.html` 即可使用
3. 或部署到 GitHub Pages

## 注意事項

- 首次使用需要設定 GitHub API（參考 GITHUB_SETUP.md）
- 如果 GitHub API 設定未完成，會自動使用 localStorage 作為備援
- 上傳的檔案會以 Blob URL 形式儲存，重新整理頁面後可能無法顯示
- 建議將檔案上傳到雲端儲存服務（如 Cloudinary、ImgBB）

## 未來擴展建議

- 整合後端 API 和資料庫
- 實現用戶認證系統
- 添加評論功能
- 實現管理員審核系統
- 添加檔案上傳到雲端儲存
- 實現更完整的獎勵機制

