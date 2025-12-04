// GitHub API 工具函數

// 讀取資料
async function loadDataFromGitHub() {
    try {
        if (!checkConfig()) {
            // 如果設定未完成，使用 localStorage 作為備援
            console.warn('GitHub 設定未完成，使用 localStorage 作為備援');
            const localData = localStorage.getItem('contents');
            if (localData) {
                return JSON.parse(localData);
            }
            return [];
        }

        const { username, repo, branch, dataPath } = GITHUB_CONFIG;
        
        // 使用 raw.githubusercontent.com 讀取檔案
        const url = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${dataPath}`;
        
        const response = await fetch(url, {
            cache: 'no-cache' // 避免快取
        });

        if (!response.ok) {
            if (response.status === 404) {
                // 檔案不存在，返回空陣列
                console.log('資料檔案不存在，將建立新檔案');
                return [];
            }
            throw new Error(`讀取失敗: ${response.status}`);
        }

        const data = await response.json();
        
        // 同時儲存到 localStorage 作為快取
        localStorage.setItem('contents', JSON.stringify(data));
        localStorage.setItem('contents_last_update', Date.now().toString());
        
        return data;
    } catch (error) {
        console.error('讀取 GitHub 資料失敗:', error);
        
        // 如果讀取失敗，嘗試使用 localStorage 備援
        const localData = localStorage.getItem('contents');
        if (localData) {
            console.log('使用 localStorage 備援資料');
            return JSON.parse(localData);
        }
        
        return [];
    }
}

// 取得檔案 SHA（更新檔案時需要）
async function getFileSha() {
    try {
        const { username, repo, branch, dataPath, token } = GITHUB_CONFIG;
        
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${dataPath}?ref=${branch}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 404) {
            return null; // 檔案不存在
        }

        if (!response.ok) {
            throw new Error(`取得 SHA 失敗: ${response.status}`);
        }

        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('取得檔案 SHA 失敗:', error);
        return null;
    }
}

// 儲存資料到 GitHub
async function saveDataToGitHub(newData, commitMessage = 'Update content data') {
    try {
        if (!checkConfig()) {
            // 如果設定未完成，使用 localStorage 作為備援
            console.warn('GitHub 設定未完成，使用 localStorage 作為備援');
            localStorage.setItem('contents', JSON.stringify(newData));
            return { success: true, message: '已儲存到 localStorage（GitHub 設定未完成）' };
        }

        const { username, repo, branch, dataPath, token } = GITHUB_CONFIG;
        
        // 取得檔案 SHA
        const sha = await getFileSha();
        
        // 將資料轉換為 Base64
        const content = btoa(JSON.stringify(newData, null, 2));
        
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${dataPath}`;
        
        const body = {
            message: commitMessage,
            content: content,
            branch: branch
        };
        
        // 如果檔案已存在，需要提供 SHA
        if (sha) {
            body.sha = sha;
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`儲存失敗: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const result = await response.json();
        
        // 同時更新 localStorage
        localStorage.setItem('contents', JSON.stringify(newData));
        localStorage.setItem('contents_last_update', Date.now().toString());
        
        return { 
            success: true, 
            message: '資料已成功儲存到 GitHub',
            commit: result.commit
        };
    } catch (error) {
        console.error('儲存到 GitHub 失敗:', error);
        
        // 如果儲存失敗，至少儲存到 localStorage
        try {
            localStorage.setItem('contents', JSON.stringify(newData));
            return { 
                success: false, 
                message: `GitHub 儲存失敗，已儲存到本地: ${error.message}`,
                fallback: true
            };
        } catch (localError) {
            return { 
                success: false, 
                message: `儲存失敗: ${error.message}` 
            };
        }
    }
}

// 新增單筆資料
async function addContentToGitHub(newContent) {
    try {
        // 讀取現有資料
        const existingData = await loadDataFromGitHub();
        
        // 新增資料
        const updatedData = [...existingData, newContent];
        
        // 儲存
        return await saveDataToGitHub(updatedData, `Add new content: ${newContent.title}`);
    } catch (error) {
        console.error('新增內容失敗:', error);
        throw error;
    }
}

// 更新單筆資料
async function updateContentInGitHub(contentId, updatedContent) {
    try {
        // 讀取現有資料
        const existingData = await loadDataFromGitHub();
        
        // 更新資料
        const updatedData = existingData.map(item => 
            item.id === contentId ? { ...item, ...updatedContent } : item
        );
        
        // 儲存
        return await saveDataToGitHub(updatedData, `Update content: ${updatedContent.title || contentId}`);
    } catch (error) {
        console.error('更新內容失敗:', error);
        throw error;
    }
}

// 刪除單筆資料
async function deleteContentFromGitHub(contentId) {
    try {
        // 讀取現有資料
        const existingData = await loadDataFromGitHub();
        
        // 刪除資料
        const updatedData = existingData.filter(item => item.id !== contentId);
        
        // 儲存
        return await saveDataToGitHub(updatedData, `Delete content: ${contentId}`);
    } catch (error) {
        console.error('刪除內容失敗:', error);
        throw error;
    }
}

