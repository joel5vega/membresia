// scripts/recompressPhotos.js
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

/**
 * Recompresa TODAS las fotos base64 existentes en Firestore a 200x200px.
 * Ejecutar UNA SOLA VEZ desde la consola del navegador (loggeado).
 */
export async function recompressAllPhotos({ maxSize = 200, quality = 0.7 } = {}) {
  console.log('🚀 Iniciando recompresión de fotos...');
  console.log(`   maxSize: ${maxSize}px, quality: ${quality}`);

  const snap = await getDocs(collection(db, 'members'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const conFoto = all.filter(m => m.photoUrl && m.photoUrl.startsWith('data:image'));
  console.log(`📸 Encontrados ${conFoto.length} miembros con foto base64`);

  if (conFoto.length === 0) {
    console.log('✅ No hay fotos que recompresar');
    return { ok: 0, fail: 0, skipped: 0, totalMB: 0 };
  }

  // Calcular peso total actual
  const totalBytesBefore = conFoto.reduce((s, m) => s + (m.photoUrl?.length || 0), 0);
  console.log(`📊 Peso total ACTUAL: ${(totalBytesBefore / 1024 / 1024).toFixed(2)} MB`);

  if (totalBytesBefore < 500 * 1024) {
    console.log('✅ Peso total < 500KB → NO hace falta recompresar');
    console.log('   El problema puede ser otro (¿Cloud Function con 1MB exacto?)');
    // No abortamos, igual seguimos
  }

  let ok = 0, fail = 0, skipped = 0;
  let totalBytesAfter = 0;

  for (const m of conFoto) {
    try {
      const base64 = m.photoUrl;

      // Si ya es chica (<10KB), saltarla
      if (base64.length < 10 * 1024) {
        skipped++;
        totalBytesAfter += base64.length;
        console.log(`⏭️  ${m.nombre || m.id}: ya es chica (${(base64.length / 1024).toFixed(1)}KB)`);
        continue;
      }

      // Convertir base64 → File
      const blob = await (await fetch(base64)).blob();
      const file = new File([blob], 'photo.png', { type: blob.type });

      // Comprimir
      const newBase64 = await compressFileToBase64(file, maxSize, quality);

      // Calcular reducción
      const beforeKB = (base64.length / 1024).toFixed(1);
      const afterKB = (newBase64.length / 1024).toFixed(1);
      const ratio = (100 - (newBase64.length / base64.length * 100)).toFixed(0);

      // Actualizar en Firestore
      await updateDoc(doc(db, 'members', m.id), {
        photoUrl: newBase64,
      });

      totalBytesAfter += newBase64.length;
      ok++;
      console.log(`✅ ${m.nombre || m.id}: ${beforeKB}KB → ${afterKB}KB (-${ratio}%)`);

      // Pausa pequeña para no saturar
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      fail++;
      console.error(`❌ Falló ${m.nombre || m.id}:`, err.message);
      totalBytesAfter += m.photoUrl?.length || 0;
    }
  }

  console.log(`\n📊 RESUMEN:`);
  console.log(`   ✅ Recompresadas: ${ok}`);
  console.log(`   ⏭️  Ya eran chicas: ${skipped}`);
  console.log(`   ❌ Fallidas: ${fail}`);
  console.log(`   📦 Peso ANTES: ${(totalBytesBefore / 1024).toFixed(1)} KB`);
  console.log(`   📦 Peso DESPUÉS: ${(totalBytesAfter / 1024).toFixed(1)} KB`);
  console.log(`   💾 Ahorro: ${((1 - totalBytesAfter / totalBytesBefore) * 100).toFixed(1)}%`);

  return { ok, fail, skipped, bytesBefore: totalBytesBefore, bytesAfter: totalBytesAfter };
}

/**
 * Helper: comprime un File a base64
 */
function compressFileToBase64(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const ratio = Math.min(maxSize / width, maxSize / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('No se pudo leer la imagen'));
    img.src = url;
  });
}