// 後台管理 API

// 側邊欄配置管理
async function getSidebarConfig() {
    const storageKey = 'admin_sidebar_config';
    
    // 嘗試從 Supabase 讀取
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            const { data, error } = await supabase
                .from('admin_config')
                .select('*')
                .eq('config_type', 'sidebar')
                .order('order', { ascending: true });
            
            if (!error && data && data.length > 0) {
                return data.map(item => item.config_data);
            }
        } catch (error) {
            console.warn('Supabase 讀取側邊欄配置失敗，使用 localStorage:', error);
        }
    }
    
    // 從 localStorage 讀取
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        return JSON.parse(stored);
    }
    
    // 返回預設配置
    return getDefaultSidebarConfig();
}

function getDefaultSidebarConfig() {
    return [
        { id: '1', filter: 'news', icon: '📢', label: '最新消息', order: 1, enabled: true },
        { id: '2', filter: 'all', icon: '🏆', label: '2025黑客松競賽', order: 2, enabled: true },
        { id: '3', filter: 'video', icon: '🎬', label: '影片分享', order: 3, enabled: true },
        { id: '4', filter: 'article', icon: '📄', label: '文章分享', order: 4, enabled: true },
        { id: '5', filter: 'suggestion', icon: '💰', label: '懸賞區', order: 5, enabled: true },
        { id: '6', filter: 'project', icon: '💻', label: '作品分享', order: 6, enabled: true },
        { id: '7', filter: 'job', icon: '🤝', label: '專案支援技能媒合', order: 7, enabled: true },
        { id: '8', filter: 'expert', icon: '🤝', label: '找內部專家', order: 8, enabled: true }
    ];
}

async function saveSidebarConfig(items) {
    const storageKey = 'admin_sidebar_config';
    
    // 嘗試儲存到 Supabase
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            // 先刪除舊配置
            await supabase
                .from('admin_config')
                .delete()
                .eq('config_type', 'sidebar');
            
            // 插入新配置
            const configData = items.map(item => ({
                config_type: 'sidebar',
                config_data: item
            }));
            
            const { error } = await supabase
                .from('admin_config')
                .insert(configData);
            
            if (!error) {
                // 同時更新 localStorage 作為備份
                localStorage.setItem(storageKey, JSON.stringify(items));
                return { success: true };
            }
        } catch (error) {
            console.warn('Supabase 儲存側邊欄配置失敗，使用 localStorage:', error);
        }
    }
    
    // 儲存到 localStorage
    localStorage.setItem(storageKey, JSON.stringify(items));
    return { success: true };
}

// 表單欄位配置管理
async function getFormFieldsConfig() {
    const storageKey = 'admin_form_fields_config';
    
    // 嘗試從 Supabase 讀取
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            const { data, error } = await supabase
                .from('admin_config')
                .select('*')
                .eq('config_type', 'form_fields')
                .order('order', { ascending: true });
            
            if (!error && data && data.length > 0) {
                return data.map(item => item.config_data);
            }
        } catch (error) {
            console.warn('Supabase 讀取表單欄位配置失敗，使用 localStorage:', error);
        }
    }
    
    // 從 localStorage 讀取
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        return JSON.parse(stored);
    }
    
    // 返回預設配置
    return getDefaultFormFieldsConfig();
}

function getDefaultFormFieldsConfig() {
    return [
        // 所有類型共用欄位
        { id: 'f1', contentType: 'all', fieldKey: 'contentType', fieldType: 'select', label: '內容類型', placeholder: '', required: true, enabled: true, order: 1, options: [
            { value: 'news', label: '📢 最新消息' },
            { value: 'video', label: '🎬 影片分享' },
            { value: 'article', label: '📄 文章分享' },
            { value: 'suggestion', label: '💰 懸賞區' },
            { value: 'project', label: '💻 作品分享' },
            { value: 'job', label: '🤝 專案支援及技能媒合' },
            { value: 'expert', label: '🤝 找內部專家' }
        ]},
        { id: 'f2', contentType: 'all', fieldKey: 'title', fieldType: 'text', label: '標題', placeholder: '輸入標題...', required: true, enabled: true, order: 2 },
        { id: 'f3', contentType: 'all', fieldKey: 'author', fieldType: 'text', label: '作者名稱', placeholder: '輸入您的姓名...', required: true, enabled: true, order: 3 },
        { id: 'f4', contentType: 'all', fieldKey: 'description', fieldType: 'editor', label: '描述/內容', placeholder: '輸入內容描述或文章內容...', required: true, enabled: true, order: 4 },
        
        // 影片分享專用
        { id: 'f5', contentType: 'video', fieldKey: 'videoLink', fieldType: 'url', label: '影片連結', placeholder: 'https://www.youtube.com/watch?v=...', required: true, enabled: true, order: 5 },
        
        // 最新消息專用
        { id: 'f6', contentType: 'news', fieldKey: 'startDate', fieldType: 'datetime-local', label: '開始時間', placeholder: '', required: false, enabled: true, order: 5 },
        { id: 'f7', contentType: 'news', fieldKey: 'endDate', fieldType: 'datetime-local', label: '結束時間', placeholder: '', required: false, enabled: true, order: 6 },
        
        // 作品分享專用
        { id: 'f8', contentType: 'project', fieldKey: 'githubLink', fieldType: 'url', label: 'GitHub 連結', placeholder: 'https://github.com/username/repository', required: true, enabled: true, order: 5 },
        
        // 專案支援專用
        { id: 'f9', contentType: 'job', fieldKey: 'jobLocation', fieldType: 'text', label: '專案地點/遠端', placeholder: '例如：台北、新竹、遠端...', required: true, enabled: true, order: 5 },
        { id: 'f10', contentType: 'job', fieldKey: 'jobType', fieldType: 'select', label: '支援類型', placeholder: '', required: true, enabled: true, order: 6, options: [
            { value: '短期支援', label: '短期支援' },
            { value: '長期支援', label: '長期支援' },
            { value: '顧問諮詢', label: '顧問諮詢' },
            { value: '技能分享', label: '技能分享' }
        ]},
        { id: 'f11', contentType: 'job', fieldKey: 'jobDepartment', fieldType: 'text', label: '專案/部門', placeholder: '例如：AI 專案、技術部...', required: true, enabled: true, order: 7 },
        { id: 'f12', contentType: 'job', fieldKey: 'jobSalary', fieldType: 'text', label: '時間需求/報酬', placeholder: '例如：每週 10 小時、專案期間、或 面議', required: false, enabled: true, order: 8 },
        { id: 'f13', contentType: 'job', fieldKey: 'jobRequirements', fieldType: 'textarea', label: '需要的技能/專長', placeholder: '請描述需要的技能...', required: true, enabled: true, order: 9 },
        { id: 'f14', contentType: 'job', fieldKey: 'jobContact', fieldType: 'text', label: '聯絡方式', placeholder: '例如：your.email@wistron.com', required: true, enabled: true, order: 10 },
        
        // 檔案上傳（多數類型可用）
        { id: 'f15', contentType: 'video', fieldKey: 'file', fieldType: 'file', label: '上傳檔案', placeholder: '', required: false, enabled: true, order: 6 },
        { id: 'f16', contentType: 'article', fieldKey: 'file', fieldType: 'file', label: '上傳檔案', placeholder: '', required: false, enabled: true, order: 5 },
        { id: 'f17', contentType: 'suggestion', fieldKey: 'file', fieldType: 'file', label: '上傳檔案', placeholder: '', required: false, enabled: true, order: 5 },
        { id: 'f18', contentType: 'project', fieldKey: 'file', fieldType: 'file', label: '上傳檔案', placeholder: '', required: false, enabled: true, order: 6 },
        { id: 'f19', contentType: 'job', fieldKey: 'file', fieldType: 'file', label: '上傳檔案', placeholder: '', required: false, enabled: true, order: 11 }
    ];
}

async function saveFormFieldsConfig(fields) {
    const storageKey = 'admin_form_fields_config';
    
    // 嘗試儲存到 Supabase
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            // 先刪除舊配置
            await supabase
                .from('admin_config')
                .delete()
                .eq('config_type', 'form_fields');
            
            // 插入新配置
            const configData = fields.map(field => ({
                config_type: 'form_fields',
                config_data: field
            }));
            
            const { error } = await supabase
                .from('admin_config')
                .insert(configData);
            
            if (!error) {
                // 同時更新 localStorage 作為備份
                localStorage.setItem(storageKey, JSON.stringify(fields));
                return { success: true };
            }
        } catch (error) {
            console.warn('Supabase 儲存表單欄位配置失敗，使用 localStorage:', error);
        }
    }
    
    // 儲存到 localStorage
    localStorage.setItem(storageKey, JSON.stringify(fields));
    return { success: true };
}

// 檢查管理員權限
function checkAdminAccess() {
    if (!Auth.isLoggedIn()) {
        alert('請先登入！');
        window.location.href = 'login.html';
        return false;
    }
    
    if (!Auth.isAdmin()) {
        alert('您沒有權限訪問此頁面！');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

