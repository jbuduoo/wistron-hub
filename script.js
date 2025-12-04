// 範例資料
const sampleData = [
    {
        id: '1',
        type: 'video',
        title: '公司年度回顧影片 - 2024 精彩時刻',
        author: '張小明',
        description: '記錄了公司 2024 年的重要時刻，包含團隊活動、專案成果和員工訪談。',
        fileUrl: null,
        views: 1250,
        likes: 89,
        reward: 'gold',
        createdAt: '2024-11-15T10:00:00Z'
    },
    {
        id: '2',
        type: 'article',
        title: '如何提升團隊協作效率的 5 個方法',
        author: '李美麗',
        description: '在過去一年的專案管理中，我總結出幾個有效提升團隊協作效率的方法，希望對大家有幫助...\n\n1. 建立清晰的溝通機制\n2. 使用合適的協作工具\n3. 定期舉行團隊會議\n4. 設定明確的目標和時程\n5. 鼓勵開放式溝通',
        fileUrl: null,
        views: 856,
        likes: 67,
        reward: 'silver',
        createdAt: '2024-11-20T14:30:00Z'
    },
    {
        id: '3',
        type: 'suggestion',
        title: '建議建立員工健康促進計畫',
        author: '王大華',
        description: '建議公司可以建立一個員工健康促進計畫，包含：\n\n1. 定期舉辦健康講座\n2. 提供健身房優惠\n3. 舉辦運動競賽\n4. 提供健康檢查補助\n\n這些措施可以提升員工健康，進而提升工作效率和滿意度。',
        fileUrl: null,
        views: 432,
        likes: 45,
        reward: 'bronze',
        createdAt: '2024-11-25T09:15:00Z'
    },
    {
        id: '4',
        type: 'video',
        title: '新產品介紹 - AI 智能助手',
        author: '陳小芳',
        description: '介紹我們最新開發的 AI 智能助手功能，可以幫助員工提升工作效率。',
        fileUrl: null,
        views: 678,
        likes: 52,
        reward: null,
        createdAt: '2024-11-28T16:45:00Z'
    },
    {
        id: '5',
        type: 'article',
        title: '遠距工作的最佳實踐',
        author: '林志強',
        description: '分享我在遠距工作期間學到的經驗和技巧，包含時間管理、溝通方式和工具使用。',
        fileUrl: null,
        views: 523,
        likes: 38,
        reward: null,
        createdAt: '2024-12-01T11:20:00Z'
    },
    {
        id: '6',
        type: 'video',
        title: '技術分享：雲端架構最佳實踐',
        author: '黃建宏',
        description: '分享我們團隊在雲端架構設計上的經驗，包含微服務架構、容器化部署和監控系統的建立。',
        fileUrl: null,
        views: 945,
        likes: 72,
        reward: 'gold',
        createdAt: '2024-12-02T09:30:00Z'
    },
    {
        id: '7',
        type: 'article',
        title: '專案管理工具比較與選擇指南',
        author: '吳雅婷',
        description: '比較市面上常見的專案管理工具，包含 Jira、Trello、Asana 等，並提供選擇建議。',
        fileUrl: null,
        views: 678,
        likes: 54,
        reward: 'silver',
        createdAt: '2024-12-03T14:15:00Z'
    },
    {
        id: '8',
        type: 'suggestion',
        title: '建議實施彈性工作時間制度',
        author: '劉家豪',
        description: '建議公司實施彈性工作時間制度，讓員工可以根據個人需求調整上下班時間，提升工作滿意度和效率。',
        fileUrl: null,
        views: 567,
        likes: 48,
        reward: 'bronze',
        createdAt: '2024-12-04T10:45:00Z'
    },
    {
        id: '9',
        type: 'video',
        title: '產品開發流程介紹',
        author: '鄭文心',
        description: '介紹我們產品的完整開發流程，從需求分析到上線部署的每個階段。',
        fileUrl: null,
        views: 789,
        likes: 61,
        reward: null,
        createdAt: '2024-12-05T16:20:00Z'
    },
    {
        id: '10',
        type: 'article',
        title: '程式碼審查的最佳實踐',
        author: '許志明',
        description: '分享如何進行有效的程式碼審查，包含審查重點、溝通技巧和常見問題的處理方式。',
        fileUrl: null,
        views: 634,
        likes: 49,
        reward: 'silver',
        createdAt: '2024-12-06T11:10:00Z'
    },
    {
        id: '11',
        type: 'suggestion',
        title: '建議建立內部技術分享會',
        author: '周美玲',
        description: '建議定期舉辦內部技術分享會，讓不同團隊可以分享技術經驗和最佳實踐，促進知識交流。',
        fileUrl: null,
        views: 456,
        likes: 41,
        reward: null,
        createdAt: '2024-12-07T13:30:00Z'
    },
    {
        id: '12',
        type: 'video',
        title: '團隊建設活動回顧',
        author: '蔡佳蓉',
        description: '記錄今年度團隊建設活動的精彩瞬間，包含戶外活動、團隊競賽和聚餐等。',
        fileUrl: null,
        views: 1123,
        likes: 95,
        reward: 'gold',
        createdAt: '2024-12-08T15:00:00Z'
    },
    {
        id: '13',
        type: 'project',
        title: 'React 專案管理系統',
        author: '陳志偉',
        description: '使用 React + TypeScript 開發的專案管理系統，包含任務管理、團隊協作和進度追蹤功能。\n\n主要功能：\n- 任務建立與分配\n- 即時協作\n- 進度視覺化\n- 檔案上傳與管理',
        githubLink: 'https://github.com/example/project-management',
        views: 892,
        likes: 78,
        reward: 'gold',
        createdAt: '2024-12-09T10:30:00Z'
    },
    {
        id: '14',
        type: 'project',
        title: 'Python 資料分析工具',
        author: '林雅文',
        description: '一個強大的 Python 資料分析工具，支援多種資料格式匯入，提供豐富的視覺化功能。',
        githubLink: 'https://github.com/example/data-analysis',
        views: 654,
        likes: 56,
        reward: 'silver',
        createdAt: '2024-12-10T14:20:00Z'
    },
    {
        id: '15',
        type: 'project',
        title: 'Vue.js 電商網站',
        author: '黃建明',
        description: '使用 Vue.js 3 + Vite 開發的現代化電商網站，包含完整的購物車、結帳和會員系統。',
        githubLink: 'https://github.com/example/ecommerce',
        views: 723,
        likes: 62,
        reward: null,
        createdAt: '2024-12-11T09:15:00Z'
    }
];

// 初始化資料（使用 Supabase API）
async function initializeData() {
    try {
        // 從 Supabase 讀取現有資料
        const existingData = await loadDataFromSupabase();
        
        // 如果沒有資料或資料很少，合併範例資料
        if (existingData.length === 0) {
            // 如果沒有資料，逐筆新增範例資料到 Supabase
            for (const item of sampleData) {
                try {
                    await addContentToSupabase(item);
                } catch (error) {
                    console.error('新增範例資料失敗:', error);
                }
            }
        } else if (existingData.length < sampleData.length) {
            // 如果現有資料少於範例資料，合併並更新
            const existingIds = new Set(existingData.map(item => item.id));
            const newItems = sampleData.filter(item => !existingIds.has(item.id));
            for (const item of newItems) {
                try {
                    await addContentToSupabase(item);
                } catch (error) {
                    console.error('新增範例資料失敗:', error);
                }
            }
        }
    } catch (error) {
        console.error('初始化資料失敗:', error);
        // 如果 Supabase API 失敗，使用 localStorage 作為備援
        const localData = localStorage.getItem('contents');
        if (!localData) {
            localStorage.setItem('contents', JSON.stringify(sampleData));
        }
    }
}

// 載入內容到主頁
async function loadContent(filter = 'all', sort = 'newest') {
    // 從 Supabase 讀取資料
    const contents = await loadDataFromSupabase();
    let filtered = contents;

    // 篩選
    if (filter === 'all') {
        // 顯示競賽相關內容
        filtered = contents.filter(c => c.isHackathon === true);
    } else if (filter !== 'all') {
        filtered = contents.filter(c => c.type === filter);
    }

    // 排序
    filtered.sort((a, b) => {
        if (sort === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sort === 'popular') {
            return (b.views || 0) - (a.views || 0);
        } else if (sort === 'reward') {
            const rewardOrder = { gold: 3, silver: 2, bronze: 1, null: 0 };
            return rewardOrder[b.reward] - rewardOrder[a.reward];
        }
        return 0;
    });

    const grid = document.getElementById('contentGrid');
    const emptyState = document.getElementById('emptyState');

    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // 如果是最新消息或找內部專家，使用列表式顯示
    if (filter === 'news' || filter === 'expert') {
        grid.className = 'news-list';
        grid.style.display = 'block';
        emptyState.style.display = 'none';

        grid.innerHTML = filtered.map((content) => {
            const startDate = content.startDate ? formatNewsDate(content.startDate) : '';
            const endDate = content.endDate ? formatNewsDate(content.endDate) : '';
            const publishDate = formatNewsDate(content.createdAt);
            const isOfficial = content.isOfficial || false;
            const isExpert = content.type === 'expert';
            
            return `
            <div class="news-list-item ${isOfficial ? 'official-news-item' : ''} ${isExpert ? 'expert-item' : ''}" onclick="window.location.href='detail.html?id=${content.id}'">
                ${isOfficial ? '<div class="official-tag">官方</div>' : ''}
                <div class="news-content">
                    <div class="news-header">
                        <h3 class="news-title">${content.title}</h3>
                        ${content.reward ? `<span class="news-reward">${getRewardIcon(content.reward)}</span>` : ''}
                    </div>
                    <div class="news-meta">
                        <div class="news-meta-item">
                            <span class="meta-label">📅 發布時間：</span>
                            <span class="meta-value">${publishDate}</span>
                        </div>
                        ${startDate && !isExpert ? `
                        <div class="news-meta-item">
                            <span class="meta-label">⏰ 開始時間：</span>
                            <span class="meta-value">${startDate}</span>
                        </div>
                        ` : ''}
                        ${endDate && !isExpert ? `
                        <div class="news-meta-item">
                            <span class="meta-label">🏁 結束時間：</span>
                            <span class="meta-value">${endDate}</span>
                        </div>
                        ` : ''}
                        <div class="news-meta-item">
                            <span class="meta-label">👤 發表人：</span>
                            <span class="meta-value">${content.author}</span>
                        </div>
                    </div>
                    <p class="news-description">${content.description.substring(0, 150)}${content.description.length > 150 ? '...' : ''}</p>
                    <div class="news-footer">
                        <div class="news-stats">
                            <span>👁️ ${content.views || 0}</span>
                            <span>👍 ${content.likes || 0}</span>
                        </div>
                        <span class="news-badge ${isExpert ? 'expert-badge' : ''}">${getTypeName(content.type)}</span>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } else {
        // 其他類型使用卡片式顯示
        grid.className = 'content-grid';
        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = filtered.map((content, index) => {
            const patternClass = getRandomPattern(index);
            const colorClass = getRandomColor(index);
            const isOfficial = content.isOfficial || false;
            return `
            <div class="content-card ${isOfficial ? 'official-news' : ''}" onclick="window.location.href='detail.html?id=${content.id}'">
                ${isOfficial ? '<div class="official-badge">官方公告</div>' : ''}
                <div class="card-thumbnail">
                    ${content.fileUrl ? 
                        `<img src="${content.fileUrl}" alt="${content.title}">` : 
                        `<div class="placeholder-thumbnail ${patternClass} ${colorClass}">${getTypeIcon(content.type)}</div>`
                    }
                </div>
                <div class="card-info">
                    <h3>${content.title}</h3>
                    <p class="card-author">${content.author}${content.jobLocation ? ` · ${content.jobLocation}` : ''}</p>
                    ${content.jobDepartment ? `<p class="job-department">${content.jobDepartment}${content.jobType ? ` · ${content.jobType}` : ''}</p>` : ''}
                    <div class="card-stats">
                        <span>👁️ ${content.views || 0}</span>
                        <span>👍 ${content.likes || 0}</span>
                        ${content.reward ? `<span class="reward-indicator">${getRewardIcon(content.reward)}</span>` : ''}
                        ${content.githubLink ? `<span class="github-indicator" title="GitHub 專案">🔗</span>` : ''}
                        ${content.isHR ? `<span class="hr-badge" title="人資發布">👤</span>` : ''}
                    </div>
                    <span class="type-badge ${content.type}">${getTypeName(content.type)}</span>
                </div>
            </div>
        `;
        }).join('');
    }
}

// 格式化最新消息日期
function formatNewsDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 獲取類型圖示
function getTypeIcon(type) {
    const icons = {
        news: '📢',
        video: '🎬',
        article: '📄',
        suggestion: '💭',
        project: '💻',
        job: '💼',
        expert: '🤝'
    };
    return icons[type] || '📄';
}

// 獲取類型名稱
function getTypeName(type) {
    const names = {
        news: '最新消息',
        video: '影片分享',
        article: '文章分享',
        suggestion: '建議提案',
        project: '作品分享',
        job: '職缺分享',
        expert: '找內部專家'
    };
    return names[type] || '其他';
}

// 獲取獎勵圖示
function getRewardIcon(reward) {
    const icons = {
        gold: '🏅',
        silver: '🥈',
        bronze: '🥉'
    };
    return icons[reward] || '';
}

// 獲取隨機圖案樣式
function getRandomPattern(index) {
    const patterns = ['pattern-dots', 'pattern-lines', 'pattern-grid', 'pattern-circles', 'pattern-diagonal'];
    return patterns[index % patterns.length];
}

// 獲取隨機顏色
function getRandomColor(index) {
    const colors = ['color-blue', 'color-purple', 'color-green', 'color-orange', 'color-pink', 'color-teal'];
    return colors[index % colors.length];
}

// 搜尋功能
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    async function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const contents = await loadDataFromSupabase();
        
        if (!query) {
            const activeFilter = document.querySelector('.nav-item.active');
            const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'news';
            await loadContent(filter);
            return;
        }

        let filtered = contents.filter(c => 
            c.title.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.author.toLowerCase().includes(query)
        );
        
        // 如果搜尋結果為空，也搜尋競賽相關內容
        if (filtered.length === 0) {
            filtered = contents.filter(c => 
                c.isHackathon === true && (
                    c.title.toLowerCase().includes(query) ||
                    c.description.toLowerCase().includes(query) ||
                    c.author.toLowerCase().includes(query)
                )
            );
        }

        const grid = document.getElementById('contentGrid');
        const emptyState = document.getElementById('emptyState');

        if (filtered.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `<p>找不到符合「${query}」的內容</p>`;
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = filtered.map((content, index) => {
            const patternClass = getRandomPattern(index);
            const colorClass = getRandomColor(index);
            const isOfficial = content.isOfficial || false;
            return `
            <div class="content-card ${isOfficial ? 'official-news' : ''}" onclick="window.location.href='detail.html?id=${content.id}'">
                ${isOfficial ? '<div class="official-badge">官方公告</div>' : ''}
                <div class="card-thumbnail">
                    ${content.fileUrl ? 
                        `<img src="${content.fileUrl}" alt="${content.title}">` : 
                        `<div class="placeholder-thumbnail ${patternClass} ${colorClass}">${getTypeIcon(content.type)}</div>`
                    }
                </div>
                <div class="card-info">
                    <h3>${content.title}</h3>
                    <p class="card-author">${content.author}${content.jobLocation ? ` · ${content.jobLocation}` : ''}</p>
                    ${content.jobDepartment ? `<p class="job-department">${content.jobDepartment}${content.jobType ? ` · ${content.jobType}` : ''}</p>` : ''}
                    <div class="card-stats">
                        <span>👁️ ${content.views || 0}</span>
                        <span>👍 ${content.likes || 0}</span>
                        ${content.reward ? `<span class="reward-indicator">${getRewardIcon(content.reward)}</span>` : ''}
                        ${content.githubLink ? `<span class="github-indicator" title="GitHub 專案">🔗</span>` : ''}
                        ${content.isHR ? `<span class="hr-badge" title="人資發布">👤</span>` : ''}
                    </div>
                    <span class="type-badge ${content.type}">${getTypeName(content.type)}</span>
                </div>
            </div>
        `;
        }).join('');
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
}

// 設定側邊欄篩選
function setupSidebarFilter() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentTitle = document.getElementById('contentTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 更新活動狀態
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 獲取篩選類型
            const filter = item.getAttribute('data-filter');
            
            // 更新標題
            const titles = {
                all: '2025黑客松競賽',
                news: '最新消息',
                video: '影片分享',
                article: '文章分享',
                suggestion: '建議提案',
                project: '作品分享',
                job: '職缺分享',
                expert: '找內部專家'
            };
            contentTitle.textContent = titles[filter] || '全部內容';

            // 載入內容
            const sortSelect = document.getElementById('sortSelect');
            loadContent(filter, sortSelect ? sortSelect.value : 'newest');
        });
    });
}

// 設定排序
function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const activeFilter = document.querySelector('.nav-item.active');
            const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'news';
            loadContent(filter, e.target.value);
        });
    }
}

// 頁面載入時初始化
if (document.getElementById('contentGrid')) {
    // 檢查必要的函數是否存在
    if (typeof loadDataFromSupabase === 'undefined') {
        console.error('錯誤：loadDataFromSupabase 函數未定義！請確認 supabase-api.js 已正確載入。');
        alert('網站載入錯誤：請重新整理頁面（按 Ctrl+Shift+R 強制重新載入）');
    } else {
        initializeData().then(() => {
            loadContent('news'); // 預設載入最新消息
        }).catch(err => {
            console.error('初始化失敗:', err);
            // 即使初始化失敗，也嘗試載入內容
            loadContent('news');
        });
        setupSearch();
        setupSidebarFilter();
        setupSort();
    }
}

