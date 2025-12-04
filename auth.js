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

    // 登入
    login(username, password) {
        // 簡單的驗證（實際應用應該連接到後端）
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                name: user.name,
                avatar: user.avatar || null
            }));
            return { success: true, user: user };
        }
        return { success: false, message: '帳號或密碼錯誤' };
    },

    // 註冊
    register(username, password, name, email) {
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
    updateUser(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            
            // 更新當前用戶資訊
            localStorage.setItem('currentUser', JSON.stringify({
                username: users[userIndex].username,
                name: users[userIndex].name,
                avatar: users[userIndex].avatar
            }));
            return true;
        }
        return false;
    }
};

