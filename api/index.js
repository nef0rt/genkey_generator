// GalaxyKeyGen - Система управления

// Конфигурация
const CONFIG = {
    PREMIUM_KEY: "FLUGEROVICHTESTINGSITE2",
    DAILY_LIMIT: 3,
    SUBSCRIPTION_STORAGE_KEY: "galaxyKeyGenSubscription",
    USER_STORAGE_KEY: "galaxyKeyGenUser"
};

// Система ключей
const KeySystem = {
    platforms: [
        { 
            id: 'windows', 
            name: 'Windows', 
            icon: 'fab fa-windows',
            desc: 'Windows 10/11 Pro',
            keyFormat: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'
        },
        { 
            id: 'office', 
            name: 'MS Office', 
            icon: 'fas fa-file-word',
            desc: 'Office 2021/365',
            keyFormat: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'
        },
        { 
            id: 'steam', 
            name: 'Steam', 
            icon: 'fab fa-steam',
            desc: 'Steam Wallet',
            keyFormat: 'XXXXX-XXXXX-XXXXX'
        },
        { 
            id: 'spotify', 
            name: 'Spotify', 
            icon: 'fab fa-spotify',
            desc: 'Premium аккаунты',
            keyFormat: 'spotify:user:xxxxx:xxxx'
        },
        { 
            id: 'netflix', 
            name: 'Netflix', 
            icon: 'fas fa-tv',
            desc: 'Premium подписка',
            keyFormat: 'NF-XXXX-XXXX-XXXX-XXX'
        },
        { 
            id: 'adobe', 
            name: 'Adobe CC', 
            icon: 'fas fa-palette',
            desc: 'Creative Cloud',
            keyFormat: 'ADOBE-XXXX-XXXX-XXXX-XXXX'
        },
        { 
            id: 'epic', 
            name: 'Epic Games', 
            icon: 'fas fa-ghost',
            desc: 'Epic Store',
            keyFormat: 'XXXX-XXXX-XXXX-XXXX'
        },
        { 
            id: 'origin', 
            name: 'EA Play', 
            icon: 'fas fa-gamepad',
            desc: 'EA ключи',
            keyFormat: 'ORIGIN-XXXX-XXXX-XXXX'
        }
    ],
    
    generateKey(platformId) {
        const platform = this.platforms.find(p => p.id === platformId);
        if (!platform) return null;
        
        const format = platform.keyFormat;
        let key = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const digits = '0123456789';
        
        for (let i = 0; i < format.length; i++) {
            if (format[i] === 'X') {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            } else if (format[i] === 'x') {
                key += chars.charAt(Math.floor(Math.random() * chars.length)).toLowerCase();
            } else if (format[i] === '0') {
                key += digits.charAt(Math.floor(Math.random() * digits.length));
            } else {
                key += format[i];
            }
        }
        
        return {
            key: key,
            platform: platform.name,
            format: platform.keyFormat,
            timestamp: new Date().toISOString(),
            id: `KEY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
    },
    
    checkDailyLimit(userData) {
        const today = new Date().toISOString().split('T')[0];
        
        // Сброс дневного лимита
        if (userData.lastLogin !== today) {
            userData.todayKeys = 0;
            userData.lastLogin = today;
            UserManager.saveUser(userData);
        }
        
        // Если есть подписка - без лимита
        const subscription = SubscriptionManager.getSubscription();
        if (subscription.isActive && subscription.username === userData.username) {
            return { canGenerate: true, remaining: Infinity };
        }
        
        const remaining = CONFIG.DAILY_LIMIT - userData.todayKeys;
        return { 
            canGenerate: remaining > 0, 
            remaining: Math.max(0, remaining)
        };
    }
};

// Менеджер подписки
const SubscriptionManager = {
    getSubscription() {
        try {
            const data = localStorage.getItem(CONFIG.SUBSCRIPTION_STORAGE_KEY);
            if (!data) return { isActive: false, username: null, activatedAt: null };
            
            return JSON.parse(data);
        } catch (e) {
            console.error("Ошибка загрузки подписки:", e);
            return { isActive: false, username: null, activatedAt: null };
        }
    },
    
    activateSubscription(key, username) {
        // Нормализация ключа
        const normalizedKey = key.trim().toUpperCase().replace(/\s+/g, '');
        
        // Проверка ключа
        if (normalizedKey !== CONFIG.PREMIUM_KEY) {
            return { success: false, message: "Неверный ключ подписки" };
        }
        
        // Проверка существующей подписки
        const currentSubscription = this.getSubscription();
        if (currentSubscription.isActive) {
            // Проверяем, активирована ли уже на другом аккаунте
            if (currentSubscription.username !== username) {
                return { 
                    success: false, 
                    message: "Этот ключ уже активирован на другом аккаунте! Один ключ = один аккаунт." 
                };
            }
            return { 
                success: false, 
                message: "Подписка уже активирована на вашем аккаунте" 
            };
        }
        
        // Активация подписки
        const subscriptionData = {
            isActive: true,
            username: username,
            activatedAt: new Date().toISOString(),
            key: normalizedKey,
            activatedOn: new Date().toLocaleDateString('ru-RU')
        };
        
        try {
            localStorage.setItem(CONFIG.SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionData));
            return { 
                success: true, 
                message: "Подписка Premium успешно активирована! 🎉",
                data: subscriptionData
            };
        } catch (e) {
            console.error("Ошибка сохранения подписки:", e);
            return { success: false, message: "Ошибка активации подписки" };
        }
    },
    
    deactivateSubscription() {
        localStorage.removeItem(CONFIG.SUBSCRIPTION_STORAGE_KEY);
        return { success: true, message: "Подписка деактивирована" };
    },
    
    checkSubscriptionForUser(username) {
        const subscription = this.getSubscription();
        return subscription.isActive && subscription.username === username;
    }
};

// Менеджер пользователей
const UserManager = {
    loadUser() {
        try {
            const data = localStorage.getItem(CONFIG.USER_STORAGE_KEY);
            if (!data) return this.getDefaultUser();
            
            const user = JSON.parse(data);
            
            // Проверяем дату последнего входа
            const today = new Date().toISOString().split('T')[0];
            if (user.lastLogin !== today) {
                user.todayKeys = 0;
                user.lastLogin = today;
                this.saveUser(user);
            }
            
            return user;
        } catch (e) {
            console.error("Ошибка загрузки пользователя:", e);
            return this.getDefaultUser();
        }
    },
    
    saveUser(userData) {
        try {
            localStorage.setItem(CONFIG.USER_STORAGE_KEY, JSON.stringify(userData));
            return true;
        } catch (e) {
            console.error("Ошибка сохранения пользователя:", e);
            return false;
        }
    },
    
    register(username) {
        const user = {
            username: username,
            isGuest: false,
            totalKeys: 0,
            todayKeys: 0,
            lastPlatform: "",
            lastLogin: new Date().toISOString().split('T')[0],
            registeredAt: new Date().toISOString(),
            avatarColor: this.generateAvatarColor(username)
        };
        
        this.saveUser(user);
        return user;
    },
    
    setGuest() {
        const user = {
            username: "Гость",
            isGuest: true,
            totalKeys: 0,
            todayKeys: 0,
            lastPlatform: "",
            lastLogin: new Date().toISOString().split('T')[0],
            avatarColor: "#6c63ff"
        };
        
        this.saveUser(user);
        return user;
    },
    
    logout() {
        return this.setGuest();
    },
    
    incrementKeys() {
        const user = this.loadUser();
        user.totalKeys++;
        user.todayKeys++;
        this.saveUser(user);
        return user;
    },
    
    updateLastPlatform(platformName) {
        const user = this.loadUser();
        user.lastPlatform = platformName;
        this.saveUser(user);
        return user;
    },
    
    generateAvatarColor(username) {
        // Генерация цвета на основе имени пользователя
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#6c63ff', '#ff6b9d', '#4CAF50', '#2196F3', 
            '#FF9800', '#9C27B0', '#00BCD4', '#E91E63'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    },
    
    getDefaultUser() {
        return {
            username: "Гость",
            isGuest: true,
            totalKeys: 0,
            todayKeys: 0,
            lastPlatform: "",
            lastLogin: new Date().toISOString().split('T')[0],
            avatarColor: "#6c63ff"
        };
    }
};

// Экспорт для глобального использования
if (typeof window !== 'undefined') {
    window.KeySystem = KeySystem;
    window.SubscriptionManager = SubscriptionManager;
    window.UserManager = UserManager;
    window.CONFIG = CONFIG;
            }
