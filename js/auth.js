// 用戶認證管理
const Auth = {
    // 檢查是否已登入
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    },

    // 取得當前用戶
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // 檢查是否為管理員
    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && (currentUser.username === 'admin' || currentUser.role === 'admin');
    },

    // 登入（優先使用 Supabase，失敗時使用 localStorage）
    async login(username, password) {
        // 嘗試使用 Supabase
        if (typeof initSupabase !== 'undefined') {
            try {
                const result = await loginWithSupabase(username, password);
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.warn('Supabase 登入失敗，使用 localStorage:', error);
            }
        }

        // 使用 localStorage 作為備援
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                username: user.username,
                name: user.name,
                avatar: user.avatar || null,
                role: user.role || (user.username === 'admin' ? 'admin' : 'user')
            }));
            return { success: true, user: user };
        }
        
        // 特殊處理：admin 帳號（如果 Supabase 和 localStorage 都沒有）
        if (username === 'admin' && password === '1234') {
            const adminUser = {
                id: 'admin',
                username: 'admin',
                name: '系統管理員',
                avatar: null,
                role: 'admin',
                points: 0
            };
            localStorage.setItem('currentUser', JSON.stringify({
                id: adminUser.id,
                username: adminUser.username,
                name: adminUser.name,
                avatar: adminUser.avatar,
                role: adminUser.role
            }));
            return { success: true, user: adminUser };
        }
        return { success: false, message: '帳號或密碼錯誤' };
    },

    // 註冊（優先使用 Supabase，失敗時使用 localStorage）
    async register(username, password, name, email) {
        // 嘗試使用 Supabase
        if (typeof initSupabase !== 'undefined') {
            try {
                const result = await registerWithSupabase(username, password, name, email);
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.warn('Supabase 註冊失敗，使用 localStorage:', error);
            }
        }

        // 使用 localStorage 作為備援
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 檢查用戶名是否已存在
        if (users.find(u => u.username === username)) {
            return { success: false, message: '此帳號已被使用' };
        }

        // 檢查 email 是否已存在
        if (users.find(u => u.email === email)) {
            return { success: false, message: '此 Email 已被使用' };
        }

        // 建立新用戶
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password, // 實際應用應該加密
            name: name,
            email: email,
            avatar: null,
            points: 0,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // 自動登入
        localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            avatar: newUser.avatar
        }));

        return { success: true, user: newUser };
    },

    // 登出
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // 更新用戶資訊
    async updateUser(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        // 嘗試使用 Supabase
        if (typeof initSupabase !== 'undefined' && currentUser.id) {
            try {
                const result = await updateUserInSupabase(currentUser.id, updates);
                if (result.success) {
                    // 更新 localStorage 中的當前用戶資訊
                    const updatedUser = { ...currentUser, ...updates };
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: updatedUser.id,
                        username: updatedUser.username,
                        name: updatedUser.name,
                        avatar: updatedUser.avatar
                    }));
                    return true;
                }
            } catch (error) {
                console.warn('Supabase 更新失敗，使用 localStorage:', error);
            }
        }

        // 使用 localStorage 作為備援
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            
            // 更新當前用戶資訊
            localStorage.setItem('currentUser', JSON.stringify({
                id: users[userIndex].id,
                username: users[userIndex].username,
                name: users[userIndex].name,
                avatar: users[userIndex].avatar,
                role: users[userIndex].role || (users[userIndex].username === 'admin' ? 'admin' : 'user')
            }));
            return true;
        }
        return false;
    }
};

