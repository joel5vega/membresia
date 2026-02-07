// Database wrapper for IndexedDB
const DB_NAME = 'membresiaCache';
const DB_VERSION = 1;
const MEMBERS_STORE = 'members';
const METADATA_STORE = 'metadata';
const CLASSES_STORE = 'classes';
const SESSIONS_STORE = 'sessions';
const ATTENDANCES_STORE = 'attendances';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(MEMBERS_STORE)) {
        db.createObjectStore(MEMBERS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(CLASSES_STORE)) {
        db.createObjectStore(CLASSES_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(ATTENDANCES_STORE)) {
        db.createObjectStore(ATTENDANCES_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE);
      }
    };
  });
};

// ============================================
// MEMBERS CACHE
// ============================================
export const cacheMembers = async (members) => {
  console.log('💾 Caching members...', { count: members.length });
  const db = await openDB();
  const tx = db.transaction([MEMBERS_STORE, METADATA_STORE], 'readwrite');
  
  await tx.objectStore(MEMBERS_STORE).clear();
  
  for (const member of members) {
    await tx.objectStore(MEMBERS_STORE).put(member);
  }
  
  const timestamp = Date.now();
  await tx.objectStore(METADATA_STORE).put(timestamp, 'membersLastFetch');
  
  console.log('✅ Members cached successfully', { 
    count: members.length, 
    timestamp: new Date(timestamp).toLocaleTimeString() 
  });
  
  return tx.complete;
};

export const getCachedMembers = async () => {
  console.log('📂 Retrieving cached members...');
  const db = await openDB();
  const tx = db.transaction([MEMBERS_STORE, METADATA_STORE], 'readonly');
  
  const members = await tx.objectStore(MEMBERS_STORE).getAll();
  const timestamp = await tx.objectStore(METADATA_STORE).get('membersLastFetch');
  
  const age = timestamp ? Math.round((Date.now() - timestamp) / 1000) : null;
  console.log('📊 Cache status:', { 
    found: members.length, 
    timestamp: timestamp ? new Date(timestamp).toLocaleTimeString() : 'never',
    ageSeconds: age,
    isValid: isCacheValid(timestamp)
  });
  
  return { members, timestamp };
};

// ============================================
// CLASSES CACHE
// ============================================
export const cacheClasses = async (classes) => {
  console.log('💾 Caching classes...', { count: classes.length });
  const db = await openDB();
  const tx = db.transaction([CLASSES_STORE, METADATA_STORE], 'readwrite');

  await tx.objectStore(CLASSES_STORE).clear();

  for (const classItem of classes) {
    await tx.objectStore(CLASSES_STORE).put(classItem);
  }

  const timestamp = Date.now();
  await tx.objectStore(METADATA_STORE).put(timestamp, 'classesLastFetch');

  console.log('✅ Classes cached successfully', { 
    count: classes.length,
    timestamp: new Date(timestamp).toLocaleTimeString()
  });

  return tx.complete;
};

export const getCachedClasses = async () => {
  console.log('📂 Retrieving cached classes...');
  const db = await openDB();
  const tx = db.transaction([CLASSES_STORE, METADATA_STORE], 'readonly');

  const classes = await tx.objectStore(CLASSES_STORE).getAll();
  const timestamp = await tx.objectStore(METADATA_STORE).get('classesLastFetch');

  const age = timestamp ? Math.round((Date.now() - timestamp) / 1000) : null;
  console.log('📊 Cache status:', { 
    found: classes.length,
    timestamp: timestamp ? new Date(timestamp).toLocaleTimeString() : 'never',
    ageSeconds: age,
    isValid: isCacheValid(timestamp)
  });

  return { classes, timestamp };
};

// ============================================
// SESSIONS CACHE
// ============================================
export const cacheSessions = async (sessions) => {
  console.log('💾 Caching sessions...', { count: sessions.length });
  const db = await openDB();
  const tx = db.transaction([SESSIONS_STORE, METADATA_STORE], 'readwrite');

  await tx.objectStore(SESSIONS_STORE).clear();

  for (const session of sessions) {
    await tx.objectStore(SESSIONS_STORE).put(session);
  }

  const timestamp = Date.now();
  await tx.objectStore(METADATA_STORE).put(timestamp, 'sessionsLastFetch');

  console.log('✅ Sessions cached successfully', { 
    count: sessions.length,
    timestamp: new Date(timestamp).toLocaleTimeString()
  });

  return tx.complete;
};

export const getCachedSessions = async () => {
  console.log('📂 Retrieving cached sessions...');
  const db = await openDB();
  const tx = db.transaction([SESSIONS_STORE, METADATA_STORE], 'readonly');

  const sessions = await tx.objectStore(SESSIONS_STORE).getAll();
  const timestamp = await tx.objectStore(METADATA_STORE).get('sessionsLastFetch');

  const age = timestamp ? Math.round((Date.now() - timestamp) / 1000) : null;
  console.log('📊 Cache status:', { 
    found: sessions.length,
    timestamp: timestamp ? new Date(timestamp).toLocaleTimeString() : 'never',
    ageSeconds: age,
    isValid: isCacheValid(timestamp)
  });

  return { sessions, timestamp };
};

// ============================================
// ATTENDANCES CACHE
// ============================================
export const cacheAttendances = async (attendances) => {
  console.log('💾 Caching attendances...', { count: attendances.length });
  const db = await openDB();
  const tx = db.transaction([ATTENDANCES_STORE, METADATA_STORE], 'readwrite');

  await tx.objectStore(ATTENDANCES_STORE).clear();

  for (const attendance of attendances) {
    await tx.objectStore(ATTENDANCES_STORE).put(attendance);
  }

  const timestamp = Date.now();
  await tx.objectStore(METADATA_STORE).put(timestamp, 'attendancesLastFetch');

  console.log('✅ Attendances cached successfully', { 
    count: attendances.length,
    timestamp: new Date(timestamp).toLocaleTimeString()
  });

  return tx.complete;
};

export const getCachedAttendances = async () => {
  console.log('📂 Retrieving cached attendances...');
  const db = await openDB();
  const tx = db.transaction([ATTENDANCES_STORE, METADATA_STORE], 'readonly');

  const attendances = await tx.objectStore(ATTENDANCES_STORE).getAll();
  const timestamp = await tx.objectStore(METADATA_STORE).get('attendancesLastFetch');

  const age = timestamp ? Math.round((Date.now() - timestamp) / 1000) : null;
  console.log('📊 Cache status:', { 
    found: attendances.length,
    timestamp: timestamp ? new Date(timestamp).toLocaleTimeString() : 'never',
    ageSeconds: age,
    isValid: isCacheValid(timestamp)
  });

  return { attendances, timestamp };
};

// ============================================
// CACHE VALIDATION
// ============================================
export const isCacheValid = (timestamp, maxAge = 60 * 60 * 1000) => {
  if (!timestamp) return false;
  const isValid = (Date.now() - timestamp) < maxAge;
  return isValid;
};

// ============================================
// CLEAR CACHE
// ============================================
export const clearAllCache = async () => {
  console.log('🗑️ Clearing all cache...');
  const db = await openDB();
  const stores = [MEMBERS_STORE, CLASSES_STORE, SESSIONS_STORE, ATTENDANCES_STORE, METADATA_STORE];
  const tx = db.transaction(stores, 'readwrite');

  for (const storeName of stores) {
    await tx.objectStore(storeName).clear();
  }

  await tx.complete;
  console.log('✅ All cache cleared');
};

export const clearMembersCache = async () => {
  console.log('🗑️ Clearing members cache...');
  const db = await openDB();
  const tx = db.transaction([MEMBERS_STORE, METADATA_STORE], 'readwrite');
  
  await tx.objectStore(MEMBERS_STORE).clear();
  await tx.objectStore(METADATA_STORE).delete('membersLastFetch');
  
  await tx.complete;
  console.log('✅ Members cache cleared');
};

export const clearClassesCache = async () => {
  console.log('🗑️ Clearing classes cache...');
  const db = await openDB();
  const tx = db.transaction([CLASSES_STORE, METADATA_STORE], 'readwrite');
  
  await tx.objectStore(CLASSES_STORE).clear();
  await tx.objectStore(METADATA_STORE).delete('classesLastFetch');
  
  await tx.complete;
  console.log('✅ Classes cache cleared');
};

// ============================================
// DEBUG UTILITIES
// ============================================
export const getCacheStats = async () => {
  console.log('📈 Fetching cache statistics...');
  const db = await openDB();
  
  const membersTx = db.transaction([MEMBERS_STORE, METADATA_STORE], 'readonly');
  const membersCount = (await membersTx.objectStore(MEMBERS_STORE).getAll()).length;
  const membersTimestamp = await membersTx.objectStore(METADATA_STORE).get('membersLastFetch');
  
  const classesTx = db.transaction([CLASSES_STORE, METADATA_STORE], 'readonly');
  const classesCount = (await classesTx.objectStore(CLASSES_STORE).getAll()).length;
  const classesTimestamp = await classesTx.objectStore(METADATA_STORE).get('classesLastFetch');
  
  const stats = {
    members: {
      count: membersCount,
      lastFetch: membersTimestamp ? new Date(membersTimestamp).toLocaleString() : 'never',
      ageSeconds: membersTimestamp ? Math.round((Date.now() - membersTimestamp) / 1000) : null,
      isValid: isCacheValid(membersTimestamp)
    },
    classes: {
      count: classesCount,
      lastFetch: classesTimestamp ? new Date(classesTimestamp).toLocaleString() : 'never',
      ageSeconds: classesTimestamp ? Math.round((Date.now() - classesTimestamp) / 1000) : null,
      isValid: isCacheValid(classesTimestamp)
    }
  };
  
  console.table(stats);
  return stats;
};
