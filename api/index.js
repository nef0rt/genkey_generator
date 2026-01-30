// index.js - Обновленная логика

class KeySystem {
    constructor() {
        this.platforms = [
            { id: 'windows', name: 'Windows', keyFormat: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX' },
            { id: 'office', name: 'MS Office', keyFormat: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX' },
            { id: 'steam', name: 'Steam', keyFormat: 'XXXXX-XXXXX-XXXXX' },
            { id: 'spotify', name: 'Spotify', keyFormat: 'spotify:user:xxxxx:xxxx' },
            { id: 'netflix', name: 'Netflix', keyFormat: 'NF-XXXX-XXXX-XXXX-XXX' },
            { id: 'adobe', name: 'Adobe CC', keyFormat: 'ADOBE-XXXX-XXXX-XXXX-XXXX' }
        ];
        
        this.subscriptionKey = "VEN2-ENTE-TRYM-GYMS";
        this.isSubscriptionActive = false;
        this.subscriptionUsed = false;
        this.dailyLimit = 3;
        
        this.init();
    }
    
    init() {
        this.loadSubscription();
    }
    
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
            timestamp: new Date().toISOString()
        };
    }
    
    checkDailyLimit(userData) {
        const today = new Date().toISOString().split('T')[0];
        if (userData.lastLogin !== today) {
            userData.todayKeys = 0;
            userData.lastLogin = today;
            return { canGenerate: true, remaining: this.dailyLimit };
        }
        
        if (this.isSubscriptionActive) {
            return { canGenerate: true, remaining: Infinity };
        }
        
        const remaining = this.dailyLimit - userData.todayKeys;
        return { 
            canGenerate: remaining > 0, 
            remaining: Math.max(0, remaining)
        };
    }
    
    validateSubscription(key) {
        const normalizedKey = key.trim().toUpperCase().replace(/\s+/g, '');
        
        if (normalizedKey !== this.subscriptionKey) {
            return { valid: false, message: "Неверный ключ подписки" };
        }
        
        if (this.subscriptionUsed) {
            return { valid: false, message: "Этот ключ уже был использован" };
        }
        
        return { valid: true, message: "Ключ действителен" };
    }
    
    activateSubscription() {
        if (this.subscriptionUsed) {
            return { success: false, message: "Подписка уже активирована" };
        }
        
        this.isSubscriptionActive = true;
        this.subscriptionUsed = true;
        localStorage.setItem('galaxyKeyGenSubscription', 'active');
        
        return { 
            success: true, 
            message: "Подписка Premium активирована!",
            benefits: [
                "Неограниченная генерация ключей",
                "Приоритетная поддержка",
                "Все сервисы доступны",
                "Отсутствие рекламы"
            ]
        };
    }
    
    loadSubscription() {
        const subscriptionData = localStorage.getItem('galaxyKeyGenSubscription');
        if (subscriptionData === 'active') {
            this.isSubscriptionActive = true;
            this.subscriptionUsed = true;
        }
    }
    
    resetSubscription() {
        this.isSubscriptionActive = false;
        this.subscriptionUsed = false;
        localStorage.removeItem('galaxyKeyGenSubscription');
        return { success: true, message: "Подписка сброшена" };
    }
}

// Экспорт для использования
if (typeof window !== 'undefined') {
    window.KeySystem = KeySystem;
}
