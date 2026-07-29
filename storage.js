// Memoria persistente simple para el prototipo Chang@
window.ChangaStorage = {
    key: "changa_app_state_v1",

    load(defaultState) {
        try {
            const saved = localStorage.getItem(this.key);
            if (!saved) return defaultState;

            const parsed = JSON.parse(saved);
            return {
                ...defaultState,
                user: { ...defaultState.user, ...(parsed.user || {}) },
                changas: Array.isArray(parsed.changas) ? parsed.changas : defaultState.changas,
                receipts: Array.isArray(parsed.receipts) ? parsed.receipts : defaultState.receipts,
                contributions: Array.isArray(parsed.contributions) ? parsed.contributions : defaultState.contributions,
                notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaultState.notifications
            };
        } catch (error) {
            console.warn("No se pudo leer la memoria local de Chang@.", error);
            return defaultState;
        }
    },

    save(state) {
        try {
            const persistentState = {
                user: state.user,
                changas: state.changas,
                receipts: state.receipts,
                contributions: state.contributions,
                notifications: state.notifications
            };
            localStorage.setItem(this.key, JSON.stringify(persistentState));
        } catch (error) {
            console.warn("No se pudo guardar la memoria local de Chang@.", error);
        }
    },

    reset() {
        localStorage.removeItem(this.key);
    }
};

// Compatibilidad ligera: StorageService API (load/save) usada por varios módulos.
window.StorageService = {
    load(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null || raw === undefined) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            console.warn(`StorageService.load failed for key ${key}:`, e);
            return defaultValue;
        }
    },
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`StorageService.save failed for key ${key}:`, e);
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`StorageService.remove failed for key ${key}:`, e);
        }
    }
};
