import { norm } from './names';

const STOP = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
export const toks = (s) => norm(s).split(' ').filter((t) => t && !STOP.has(t));

export function ageFromBirth(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getUTCFullYear();
  const before = now.getMonth() < d.getUTCMonth() ||
    (now.getMonth() === d.getUTCMonth() && now.getDate() < d.getUTCDate());
  if (before) age--;
  return age >= 0 && age < 120 ? age : null;
}

/** Enriquece los nodos del grafo con los datos necesarios para ordenar y sugerir. */
export function buildPeople(members, nodes) {
  const byId = new Map(members.map((m) => [m.id, m]));

  // Edad de externos (y respaldo de miembros sin fecha): la declarada en algún genograma
  const declared = new Map();
  members.forEach((m) => (m.genograma || []).forEach((p) => {
    const a = parseInt(p.edad, 10);
    const k = norm(p.nombre);
    if (a >= 0 && a < 120 && !declared.has(k)) declared.set(k, a);
  }));

  return nodes.map((n) => {
    const m = n.realId ? byId.get(n.realId) : null;
    const own = m ? toks(m.apellido || '') : [];
    return {
      ...n,
      edad: (m && ageFromBirth(m.fechaNacimiento)) ?? declared.get(n.id) ?? null,
      surnames: own.length ? own : (() => { const t = toks(n.nombre); return t.length >= 3 ? t.slice(-2) : t.slice(-1); })(),
      celular: m?.celular || '',
      zona: m?.zona || '',
      clase: m?.clase || '',
      grado: (n.connections || []).length,
    };
  });
}

/** Objeto que esperan PersonPanel y los hooks de relaciones. */
export const toPerson = (p) => ({
  key: p.id, nombre: p.nombre, realId: p.realId, sexo: p.sexo, esMiembro: p.esMiembroIglesia,
});

/** "Juan Carlos Pérez Mamani" → { nombre: "Juan Carlos", apellido: "Pérez Mamani" } */
export function splitName(full) {
  const words = String(full || '').trim().split(/\s+/).filter(Boolean);
  const units = []; // cada unidad = una palabra con sus partículas ("de la Cruz")
  for (let i = words.length - 1; i >= 0; i--) {
    if (STOP.has(norm(words[i])) && units.length) units[0].unshift(words[i]);
    else units.unshift([words[i]]);
  }
  const k = units.length >= 3 ? 2 : units.length === 2 ? 1 : 0;
  const cut = units.length - k;
  return {
    nombre: units.slice(0, cut).flat().join(' '),
    apellido: units.slice(cut).flat().join(' '),
  };
}