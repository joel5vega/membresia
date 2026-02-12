// src/services/dataCache.ts
import { Member } from '../types';
import LZString from 'lz-string';

const CACHE_KEY = 'members-cache-v1';
const CACHE_TIMESTAMP_KEY = 'members-cache-timestamp-v1';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos
const MAX_CACHE_SIZE = 4 * 1024 * 1024; // 4MB límite seguro

export async function cacheMembers(members: Member[]): Promise<void> {
  try {
    console.log(`💾 [CACHE] Saving ${members.length} members to localStorage...`);
    
    // 1. Filtrar datos esenciales para reducir tamaño
    console.log('📉 [CACHE] Filtering essential data only...');
    const slimMembers = members.map(({ 
      id, 
      nombre, 
      apellido, 
      edad, 
      celular, 
      email, 
      estado, 
      clase,
      fechaNacimiento ,sexo
    }) => ({
      id, nombre, apellido, edad, celular, email, estado, clase, fechaNacimiento,sexo
    }));
    
    // 2. Medir tamaño original
    const originalSize = JSON.stringify(slimMembers).length;
    console.log(`📏 [CACHE] Original size: ${formatBytes(originalSize)}`);
    
    // 3. Comprimir con LZ-string
    console.log('🔆 [CACHE] Compressing with LZ-string...');
    const jsonString = JSON.stringify(slimMembers);
    const compressed = LZString.compressToUTF16(jsonString);
    
    // 4. Verificar tamaño final
    const finalSize = JSON.stringify(compressed).length;
    console.log(`📦 [CACHE] Compressed: ${formatBytes(finalSize)} (${Math.round((finalSize/originalSize)*100)}% of original)`);
    
    if (finalSize > MAX_CACHE_SIZE) {
      console.warn('⚠️  [CACHE] Size exceeds 4MB limit, clearing cache');
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return;
    }
    
    // 5. Guardar cache comprimido
    const cacheData = {
      compressed: compressed,
      count: slimMembers.length,
      version: 'v2'
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    console.log('✅ [CACHE] Successfully saved compressed cache!');
    console.log(`📊 [CACHE] Members: ${slimMembers.length}, Size: ${formatBytes(finalSize)}`);
    
  } catch (error) {
    console.error('❌ [CACHE] Error saving cache:', error);
    // Limpiar cache corrupto en caso de error
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  }
}

export async function getCachedMembers(): Promise<{ members: Member[]; timestamp: number }> {
  try {
    console.log('🔍 [CACHE] Reading members from localStorage...');
    
    const raw = localStorage.getItem(CACHE_KEY);
    const tsRaw = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!raw || !tsRaw) {
      console.log('⚠️  [CACHE] No cache found');
      return { members: [], timestamp: 0 };
    }

    const cacheData = JSON.parse(raw);
    const timestamp = parseInt(tsRaw, 10);
    
    console.log(`📅 [CACHE] Cache timestamp: ${new Date(timestamp).toLocaleString()}`);

    if (cacheData.version !== 'v2') {
      console.log('🔄 [CACHE] Old cache version detected, clearing...');
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return { members: [], timestamp: 0 };
    }

    // Descomprimir
    console.log('🔓 [CACHE] Decompressing data...');
    const jsonString = LZString.decompressFromUTF16(cacheData.compressed);
    
    if (!jsonString) {
      console.error('❌ [CACHE] Failed to decompress');
      localStorage.removeItem(CACHE_KEY);
      return { members: [], timestamp: 0 };
    }

    const members = JSON.parse(jsonString) as Member[];
    console.log(`✅ [CACHE] Decompressed ${members.length} members successfully!`);
    
    return { members, timestamp };
  } catch (error) {
    console.error('❌ [CACHE] Error reading cache:', error);
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    return { members: [], timestamp: 0 };
  }
}

export function isCacheValid(timestamp: number): boolean {
  const age = Date.now() - timestamp;
  const ageMinutes = Math.floor(age / 1000 / 60);
  const isValid = age < CACHE_DURATION;
  console.log(`⏱️  [CACHE] Age: ${ageMinutes}min, Valid: ${isValid}`);
  return isValid;
}

// Utilidad para formatear bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
