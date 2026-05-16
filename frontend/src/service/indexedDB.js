export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SuperNoteApp', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Store notes offline
            if (!db.objectStoreNames.contains('notes')) {
                db.createObjectStore('notes', { keyPath: 'id' });
            }
            // Queue offline actions
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const saveNotesOffline = async (notes) => {
    try {
        const db = await initDB();
        const tx = db.transaction('notes', 'readwrite');
        const store = tx.objectStore('notes');
        store.clear(); // Clear existing
        notes.forEach(note => store.put(note));
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
        });
    } catch (e) {
        console.error('Lỗi lưu offline', e);
        return false;
    }
};

export const getNotesOffline = async () => {
    try {
        const db = await initDB();
        const tx = db.transaction('notes', 'readonly');
        const store = tx.objectStore('notes');
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        return [];
    }
};

export const addSyncQueue = async (action, data) => {
    try {
        const db = await initDB();
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.put({ action, data, timestamp: Date.now() });
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
        });
    } catch (e) {
        console.error('Lỗi add sync queue', e);
        return false;
    }
};

export const getSyncQueue = async () => {
    try {
        const db = await initDB();
        const tx = db.transaction('syncQueue', 'readonly');
        const store = tx.objectStore('syncQueue');
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        return [];
    }
};

export const clearSyncQueueItem = async (id) => {
    try {
        const db = await initDB();
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.delete(id);
    } catch (e) {
        console.error(e);
    }
};
