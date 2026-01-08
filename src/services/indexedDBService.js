// IndexedDB Service for offline data persistence

const DB_NAME = 'MembresiaDB';
const DB_VERSION = 1;
const MEMBERS_STORE = 'members';
const PENDING_MEMBERS_STORE = 'pendingMembers';

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB initialization error:', request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create members store
      if (!database.objectStoreNames.contains(MEMBERS_STORE)) {
        const memberStore = database.createObjectStore(MEMBERS_STORE, { keyPath: 'id' });
        memberStore.createIndex('nombre', 'nombre', { unique: false });
        memberStore.createIndex('apellido', 'apellido', { unique: false });
        memberStore.createIndex('ci', 'ci', { unique: true });
      }

      // Create pending members store for offline sync
      if (!database.objectStoreNames.contains(PENDING_MEMBERS_STORE)) {
        const pendingStore = database.createObjectStore(PENDING_MEMBERS_STORE, { keyPath: 'id' });
        pendingStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };
  });
}

export async function saveMember(member) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMBERS_STORE, 'readwrite');
    const store = tx.objectStore(MEMBERS_STORE);
    const request = store.put(member);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(member);
  });
}

export async function getMember(id) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMBERS_STORE, 'readonly');
    const store = tx.objectStore(MEMBERS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllMembers() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMBERS_STORE, 'readonly');
    const store = tx.objectStore(MEMBERS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function deleteMember(id) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMBERS_STORE, 'readwrite');
    const store = tx.objectStore(MEMBERS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(id);
  });
}

// Pending members for offline sync
export async function savePendingMember(member) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_MEMBERS_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_MEMBERS_STORE);
    const pendingMember = {
      ...member,
      id: member.id || Date.now().toString(),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    const request = store.put(pendingMember);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(pendingMember);
  });
}

export async function getPendingMembers() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_MEMBERS_STORE, 'readonly');
    const store = tx.objectStore(PENDING_MEMBERS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function deletePendingMember(id) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_MEMBERS_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_MEMBERS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(id);
  });
}

export async function clearAllData() {
  if (!db) await initDB();
  return Promise.all([
    new Promise((resolve, reject) => {
      const tx = db.transaction(MEMBERS_STORE, 'readwrite');
      const request = tx.objectStore(MEMBERS_STORE).clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    }),
    new Promise((resolve, reject) => {
      const tx = db.transaction(PENDING_MEMBERS_STORE, 'readwrite');
      const request = tx.objectStore(PENDING_MEMBERS_STORE).clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    })
  ]);
}
