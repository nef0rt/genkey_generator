// index.js - Логика подписки и управления состоянием

// Глобальное состояние подписки
class SubscriptionManager {
    constructor() {
        this.subscriptionKey = "VEN2-ENTE-TRYM-GYMS";
        this.isActive = false;
        this.isUsed = false;
        this.init();
    }

    init() {
        // Проверяем сохраненное состояние подписки
        const savedState = localStorage.getItem('galaxyKeyGenSubscription');
        if (savedState === 'active') {
            this.isActive = true;
            this.isUsed = true;
        }
    }

    validateKey(inputKey) {
        // Нормализуем ключ (убираем пробелы, приводим к верхнему регистру)
        const normalizedKey = inputKey.trim().toUpperCase().replace(/\s+/g, '');
        
        // Проверяем формат ключа
        if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedKey)) {
            return { valid: false, message: "Неверный формат ключа. Используйте формат XXXX-XXXX-XXXX-XXXX" };
        }
        
        // Проверяем, соответствует ли ключ премиум-ключу
        if (normalizedKey === this.subscriptionKey) {
            if (this.isUsed) {
                return { valid: false, message: "Этот ключ уже был использован. Один ключ - одна активация." };
            }
            return { valid: true, message: "Ключ действителен!" };
        }
        
        return { valid: false, message: "Неверный ключ подписки." };
    }

    activateSubscription() {
        if (this.isUsed) {
            return { success: false, message: "Подписка уже активирована или ключ использован" };
        }
        
        this.isActive = true;
        this.isUsed = true;
        localStorage.setItem('galaxyKeyGenSubscription', 'active');
        
        return { 
            success: true, 
            message: "Подписка Premium активирована!",
            features: [
                "Неограниченная генерация ключей",
                "Приоритетная поддержка",
                "Эксклюзивные шаблоны ключей",
                "Отсутствие рекламы"
            ]
        };
    }

    getSubscriptionStatus() {
        return {
            isActive: this.isActive,
            isUsed: this.isUsed,
            key: this.subscriptionKey
        };
    }

    resetSubscription() {
        this.isActive = false;
        this.isUsed = false;
        localStorage.removeItem('galaxyKeyGenSubscription');
        return { success: true, message: "Подписка сброшена" };
    }
}

// Экспорт для использования в браузере
if (typeof window !== 'undefined') {
    window.SubscriptionManager = SubscriptionManager;
}

// Инициализация менеджера подписки
const subscriptionManager = new SubscriptionManager();

// Функции для работы с ключами
const KeyGenerator = {
    generate(platform) {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
        const platformCode = platform ? platform.substr(0, 3).toUpperCase() : 'GEN';
        
        let key = '';
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Исключаем похожие символы
        
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return {
            key: key,
            timestamp: new Date().toISOString(),
            platform: platform,
            id: `${platformCode}-${timestamp}-${randomPart}`
        };
    },
    
    validate(key) {
        // Простая валидация формата
        return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
    }
};

// Управление пользователем
const UserManager = {
    saveUserData(data) {
        localStorage.setItem('galaxyKeyGenUser', JSON.stringify(data));
    },
    
    loadUserData() {
        const data = localStorage.getItem('galaxyKeyGenUser');
        return data ? JSON.parse(data) : {
            username: 'Гость',
            totalKeys: 0,
            todayKeys: 0,
            lastPlatform: '',
            lastLogin: new Date().toISOString().split('T')[0]
        };
    },
    
    updateKeyStats() {
        const userData = this.loadUserData();
        const today = new Date().toISOString().split('T')[0];
        
        if (userData.lastLogin !== today) {
            userData.todayKeys = 0;
            userData.lastLogin = today;
        }
        
        userData.totalKeys++;
        userData.todayKeys++;
        
        this.saveUserData(userData);
        return userData;
    }
};
