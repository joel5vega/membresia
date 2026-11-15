// utils/imageCompressor.js

/**
 * Comprime una imagen a un tamaño máximo y la convierte a base64.
 * Sin dependencias externas.
 * 
 * @param {File} file - Archivo de imagen
 * @param {number} maxSize - Tamaño máximo en píxeles (ancho o alto)
 * @param {number} quality - Calidad JPEG 0-1
 * @returns {Promise<string>} - data URL base64
 */
export function compressImageToBase64(file, maxSize = 200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo debe ser una imagen'));
    }

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
      if (!ctx) return reject(new Error('No se pudo crear canvas'));

      // Fondo blanco para PNGs transparentes (si no, se ven negras en JPEG)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // JPEG calidad 0.7 → ~5-8KB base64 para 200x200px
      const base64 = canvas.toDataURL('image/jpeg', quality);
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };

    img.src = url;
  });
}