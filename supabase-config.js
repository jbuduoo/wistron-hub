// Supabase 設定
const SUPABASE_CONFIG = {
    url: 'https://wkbirkeodswetwarfazs.supabase.co',
    anonKey: 'sb_publishable_hxrK1xiqO_V6XT65fYs23Q_fBznm3Da'
};

// 檢查設定是否完成
function checkSupabaseConfig() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.warn('⚠️ 請先設定 Supabase 設定！請編輯 supabase-config.js 檔案。');
        return false;
    }
    return true;
}

