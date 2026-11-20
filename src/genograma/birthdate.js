export const NO_YEAR = '0000';

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** "1990-09-16" | "0000-09-16" → { y: '1990'|'', m: '09', d: '16' } */
export function parseBirth(v) {
  const [y = '', m = '', d = ''] = String(v || '').slice(0, 10).split('-');
  if (!m || !d) return { y: '', m: '', d: '' };
  return { y: y === NO_YEAR ? '' : y, m, d };
}

/** { y, m, d } → "AAAA-MM-DD" (o "0000-MM-DD" sin año). Devuelve '' si falta día o mes. */
export function buildBirth({ y, m, d }) {
  if (!m || !d) return '';
  const yy = /^\d{4}$/.test(String(y)) && Number(y) > 1900 ? String(y) : NO_YEAR;
  return `${yy}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Texto para mostrar: "16/09/1990" o "16 sep". */
export function formatBirth(v) {
  const { y, m, d } = parseBirth(v);
  if (!m) return '—';
  return y ? `${d}/${m}/${y}` : `${Number(d)} ${MESES[Number(m) - 1].slice(0, 3).toLowerCase()}`;
}

export const hasYear = (v) => !!parseBirth(v).y;