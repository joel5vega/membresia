/** Única fuente de verdad para comparar nombres. */
export const norm = (s) =>
  (s ?? '').toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')   // "Jhon -" → "jhon"
    .replace(/\s+/g, ' ')           // espacios dobles
    .trim();

export const fullName = (m) =>
  m?.nombreCompleto || `${m?.nombre || ''} ${m?.apellido || ''}`.trim();