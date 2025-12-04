// Supabase API 工具函數

let supabaseClient = null;

// 初始化 Supabase 客戶端
function initSupabase() {
    if (!checkSupabaseConfig()) {
        console.warn('Supabase 設定未完成，使用 localStorage 作為備援');
        return null;
    }

    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
    return supabaseClient;
}

// 讀取所有資料
async function loadDataFromSupabase() {
    try {
        const client = initSupabase();
        if (!client) {
            // 使用 localStorage 作為備援
            const localData = localStorage.getItem('contents');
            return localData ? JSON.parse(localData) : [];
        }

        const { data, error } = await client
            .from('contents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // 轉換資料格式以符合現有程式碼
        const formattedData = data.map(item => ({
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            author: item.author,
            createdAt: item.created_at,
            views: item.views || 0,
            likes: item.likes || 0,
            content: item.content,
            mediaUrl: item.media_url,
            githubUrl: item.github_url,
            hackathon: item.hackathon || false,
            startDate: item.start_date,
            endDate: item.end_date,
            isOfficial: item.is_official || false,
            jobLocation: item.job_location,
            jobType: item.job_type,
            jobDepartment: item.job_department,
            jobSalary: item.job_salary,
            jobRequirements: item.job_requirements,
            jobContact: item.job_contact,
            reward: item.reward
        }));

        // 同時儲存到 localStorage 作為快取
        localStorage.setItem('contents', JSON.stringify(formattedData));
        localStorage.setItem('contents_last_update', Date.now().toString());

        return formattedData;
    } catch (error) {
        console.error('讀取 Supabase 資料失敗:', error);
        
        // 如果讀取失敗，嘗試使用 localStorage 備援
        const localData = localStorage.getItem('contents');
        if (localData) {
            console.log('使用 localStorage 備援資料');
            return JSON.parse(localData);
        }
        
        return [];
    }
}

// 新增單筆資料
async function addContentToSupabase(newContent) {
    try {
        const client = initSupabase();
        if (!client) {
            // 使用 localStorage 作為備援
            const existingData = JSON.parse(localStorage.getItem('contents') || '[]');
            const updatedData = [...existingData, { ...newContent, id: Date.now().toString() }];
            localStorage.setItem('contents', JSON.stringify(updatedData));
            return { success: true, message: '已儲存到 localStorage（Supabase 設定未完成）' };
        }

        // 轉換資料格式以符合資料庫結構
        const dbData = {
            type: newContent.type,
            title: newContent.title,
            description: newContent.description,
            author: newContent.author,
            content: newContent.content || null,
            media_url: newContent.mediaUrl || null,
            github_url: newContent.githubUrl || null,
            hackathon: newContent.hackathon || false,
            start_date: newContent.startDate || null,
            end_date: newContent.endDate || null,
            is_official: newContent.isOfficial || false,
            job_location: newContent.jobLocation || null,
            job_type: newContent.jobType || null,
            job_department: newContent.jobDepartment || null,
            job_salary: newContent.jobSalary || null,
            job_requirements: newContent.jobRequirements || null,
            job_contact: newContent.jobContact || null,
            reward: newContent.reward || null
        };

        const { data, error } = await client
            .from('contents')
            .insert([dbData])
            .select();

        if (error) {
            throw error;
        }

        // 更新 localStorage
        const existingData = await loadDataFromSupabase();
        localStorage.setItem('contents', JSON.stringify(existingData));

        return { 
            success: true, 
            message: '資料已成功儲存到 Supabase',
            data: data[0]
        };
    } catch (error) {
        console.error('新增內容失敗:', error);
        
        // 如果儲存失敗，至少儲存到 localStorage
        try {
            const existingData = JSON.parse(localStorage.getItem('contents') || '[]');
            const updatedData = [...existingData, { ...newContent, id: Date.now().toString() }];
            localStorage.setItem('contents', JSON.stringify(updatedData));
            return { 
                success: false, 
                message: `Supabase 儲存失敗，已儲存到本地: ${error.message}`,
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

// 更新單筆資料
async function updateContentInSupabase(contentId, updatedContent) {
    try {
        const client = initSupabase();
        if (!client) {
            // 使用 localStorage 作為備援
            const existingData = JSON.parse(localStorage.getItem('contents') || '[]');
            const updatedData = existingData.map(item => 
                item.id === contentId ? { ...item, ...updatedContent } : item
            );
            localStorage.setItem('contents', JSON.stringify(updatedData));
            return { success: true, message: '已更新到 localStorage（Supabase 設定未完成）' };
        }

        // 轉換資料格式
        const dbData = {};
        if (updatedContent.views !== undefined) dbData.views = updatedContent.views;
        if (updatedContent.likes !== undefined) dbData.likes = updatedContent.likes;
        if (updatedContent.title !== undefined) dbData.title = updatedContent.title;
        if (updatedContent.description !== undefined) dbData.description = updatedContent.description;
        if (updatedContent.content !== undefined) dbData.content = updatedContent.content;
        if (updatedContent.mediaUrl !== undefined) dbData.media_url = updatedContent.mediaUrl;
        if (updatedContent.githubUrl !== undefined) dbData.github_url = updatedContent.githubUrl;
        if (updatedContent.hackathon !== undefined) dbData.hackathon = updatedContent.hackathon;
        if (updatedContent.startDate !== undefined) dbData.start_date = updatedContent.startDate;
        if (updatedContent.endDate !== undefined) dbData.end_date = updatedContent.endDate;
        if (updatedContent.isOfficial !== undefined) dbData.is_official = updatedContent.isOfficial;
        if (updatedContent.jobLocation !== undefined) dbData.job_location = updatedContent.jobLocation;
        if (updatedContent.jobType !== undefined) dbData.job_type = updatedContent.jobType;
        if (updatedContent.jobDepartment !== undefined) dbData.job_department = updatedContent.jobDepartment;
        if (updatedContent.jobSalary !== undefined) dbData.job_salary = updatedContent.jobSalary;
        if (updatedContent.jobRequirements !== undefined) dbData.job_requirements = updatedContent.jobRequirements;
        if (updatedContent.jobContact !== undefined) dbData.job_contact = updatedContent.jobContact;
        if (updatedContent.reward !== undefined) dbData.reward = updatedContent.reward;

        const { data, error } = await client
            .from('contents')
            .update(dbData)
            .eq('id', contentId)
            .select();

        if (error) {
            throw error;
        }

        // 更新 localStorage
        const existingData = await loadDataFromSupabase();
        localStorage.setItem('contents', JSON.stringify(existingData));

        return { 
            success: true, 
            message: '資料已成功更新到 Supabase',
            data: data[0]
        };
    } catch (error) {
        console.error('更新內容失敗:', error);
        throw error;
    }
}

// 刪除單筆資料
async function deleteContentFromSupabase(contentId) {
    try {
        const client = initSupabase();
        if (!client) {
            // 使用 localStorage 作為備援
            const existingData = JSON.parse(localStorage.getItem('contents') || '[]');
            const updatedData = existingData.filter(item => item.id !== contentId);
            localStorage.setItem('contents', JSON.stringify(updatedData));
            return { success: true, message: '已從 localStorage 刪除（Supabase 設定未完成）' };
        }

        const { error } = await client
            .from('contents')
            .delete()
            .eq('id', contentId);

        if (error) {
            throw error;
        }

        // 更新 localStorage
        const existingData = await loadDataFromSupabase();
        localStorage.setItem('contents', JSON.stringify(existingData));

        return { 
            success: true, 
            message: '資料已成功從 Supabase 刪除'
        };
    } catch (error) {
        console.error('刪除內容失敗:', error);
        throw error;
    }
}

// 讀取留言
async function loadCommentsFromSupabase(contentId) {
    try {
        const client = initSupabase();
        if (!client) {
            return [];
        }

        const { data, error } = await client
            .from('comments')
            .select('*')
            .eq('content_id', contentId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data.map(item => ({
            id: item.id,
            contentId: item.content_id,
            author: item.author,
            content: item.content,
            createdAt: item.created_at,
            likes: item.likes || 0
        }));
    } catch (error) {
        console.error('讀取留言失敗:', error);
        return [];
    }
}

// 新增留言
async function addCommentToSupabase(contentId, comment) {
    try {
        const client = initSupabase();
        if (!client) {
            return { success: false, message: 'Supabase 設定未完成' };
        }

        const { data, error } = await client
            .from('comments')
            .insert([{
                content_id: contentId,
                author: comment.author,
                content: comment.content
            }])
            .select();

        if (error) {
            throw error;
        }

        return { 
            success: true, 
            message: '留言已成功新增',
            data: data[0]
        };
    } catch (error) {
        console.error('新增留言失敗:', error);
        throw error;
    }
}

// 更新留言（例如按讚）
async function updateCommentInSupabase(commentId, updatedData) {
    try {
        const client = initSupabase();
        if (!client) {
            return { success: false, message: 'Supabase 設定未完成' };
        }

        const { data, error } = await client
            .from('comments')
            .update(updatedData)
            .eq('id', commentId)
            .select();

        if (error) {
            throw error;
        }

        return { 
            success: true, 
            message: '留言已成功更新',
            data: data[0]
        };
    } catch (error) {
        console.error('更新留言失敗:', error);
        throw error;
    }
}

