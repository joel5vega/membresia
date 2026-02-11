// src/services/dataCache.ts

import { Member } from '../types';

const CACHE_KEY = 'members-cache-v1';
const CACHE_TIMESTAMP_KEY = 'members-cache-timestamp-v1';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

export async function cacheMembers(members: Member[]): Promise<void> {
  try {
    console.log(`💾 Saving ${members.length} members to localStorage cache...`);
    localStorage.setItem(CACHE_KEY, JSON.stringify(members));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('✅ Cache saved');
  } catch (error) {
    console.error('❌ Error saving cache:', error);
  }
}

export async function getCachedMembers(): Promise<{ members: Member[]; timestamp: number }> {
  try {
    console.log('🔍 Reading members from localStorage cache...');
    const raw = localStorage.getItem(CACHE_KEY);
    const tsRaw = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!raw || !tsRaw) {
      console.log('⚠️  No cache found');
      return { members: [], timestamp: 0 };
    }

    const members = JSON.parse(raw) as Member[];
    const timestamp = parseInt(tsRaw, 10);

    console.log(`   Found ${members.length} cached members at ${new Date(timestamp).toLocaleString()}`);
    return { members, timestamp };
  } catch (error) {
    console.error('❌ Error reading cache:', error);
    return { members: [], timestamp: 0 };
  }
}

export function isCacheValid(timestamp: number): boolean {
  const age = Date.now() - timestamp;
  const ageMinutes = Math.floor(age / 1000 / 60);
  const isValid = age < CACHE_DURATION;
  console.log(`   Cache age: ${ageMinutes} minutes (valid: ${isValid})`);
  return isValid;
}
