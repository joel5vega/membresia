import { norm } from './names';
import { analyzeFamilies } from './generations';

const STOP = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
const WIDOW = new Set(['viuda', 'viudo', 'vda', 'vdo', 'sra', 'senora', 'dona', 'don']);
export const toks = (s) => norm(s).split(' ').filter((t) => t && !STOP.has(t));

// Corta en el primer "de/del" desde la posición `from` (lo que sigue es el apellido del esposo)
function cutAtDe(words, from) {
  const i = words.findIndex((w, k) => k >= from && ['de', 'del'].includes(norm(w)));
  return i === -1 ? words : words.slice(0, i);
}
const clean = (words) => words.map(norm).filter((t) => t && !STOP.has(t) && !WIDOW.has(t));

/** Apellidos propios (paterno primero), sin "viuda" ni el apellido del esposo. */
export function cleanSurnames(member, name) {
  if (member?.apellido) {
    const t = clean(cutAtDe(String(member.apellido).split(/\s+/), 1));
    if (t.length) return t;
  }
  const t = clean(cutAtDe(String(name || '').split(/\s+/), 2));
  return t.length >= 3 ? t.slice(-2) : t.slice(-1);
}

export function ageFromBirth(iso) {
  if (!iso) return null;
  if (String(iso).startsWith('0000')) return null;
const d = new Date(iso);
  if (isNaN(d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getUTCFullYear();
  const before = now.getMonth() < d.getUTCMonth() ||
    (now.getMonth() === d.getUTCMonth() && now.getDate() < d.getUTCDate());
  if (before) age--;
  return age >= 0 && age < 120 ? age : null;
}

/** Enriquece los nodos con edad, apellidos, nivel generacional y pareja. */
export function buildPeople(members, nodes) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const { level, comp, partners, parents } = analyzeFamilies(members);

  const declared = new Map(); // edad declarada en algún genograma (externos)
  members.forEach((m) => (m.genograma || []).forEach((p) => {
    const a = parseInt(p.edad, 10);
    const k = norm(p.nombre);
    if (a >= 0 && a < 120 && !declared.has(k)) declared.set(k, a);
  }));

  return nodes.map((n) => {
    const m = n.realId ? byId.get(n.realId) : null;
    return {
      ...n,
      edad: (m && ageFromBirth(m.fechaNacimiento)) ?? declared.get(n.id) ?? null,
      surnames: cleanSurnames(m, n.nombre),
      nivel: level.get(n.id) ?? 0,
      comp: comp.get(n.id) ?? -1,
padres: [...(parents.get(n.id) || [])],
      pareja: [...(partners.get(n.id) || [])][0] || null,
      celular: m?.celular || '',
      zona: m?.zona || '',
      clase: m?.clase || '',
      grado: (n.connections || []).length,
    };
  });
}

/** Objeto que esperan PersonSheet y los hooks de relaciones. */
export const toPerson = (p) => p && ({
  key: p.id, nombre: p.nombre, realId: p.realId, sexo: p.sexo, esMiembro: p.esMiembroIglesia, clase: p.clase,
});

/** "Juan Carlos Pérez Mamani" → { nombre: "Juan Carlos", apellido: "Pérez Mamani" } */
export function splitName(full) {
  const words = String(full || '').trim().split(/\s+/).filter(Boolean);
  const units = [];
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