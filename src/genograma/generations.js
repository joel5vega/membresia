import { norm, fullName } from './names';

// Cuánto cambia el nivel generacional de "el otro" respecto a quien lo declara
const DELTA = {
  padre: 1, madre: 1, tio: 1, tia: 1,
  abuelo: 2, abuela: 2,
  hijo: -1, hija: -1, sobrino: -1, sobrina: -1,
  nieto: -2, nieta: -2,
};
const COUPLE = new Set(['esposo', 'esposa', 'pareja']);
export const deltaOf = (rel) => DELTA[norm(rel)] ?? 0;

const addTo = (map, k, v) => {
  if (!map.has(k)) map.set(k, new Set());
  map.get(k).add(v);
};

/**
 * level:    Map(nombre → nivel). Mayor = más antiguo. Solo comparable dentro de la misma `comp`.
 * comp:     Map(nombre → id de grupo de parentesco)
 * partners: Map(nombre → Set(parejas))
 * parents:  Map(hijo → Set(progenitores))
 */
export function analyzeFamilies(members) {
  const adj = new Map();
  const partners = new Map();
  const parents = new Map();

  const link = (a, b, d) => {
    [[a, [b, d]], [b, [a, -d]]].forEach(([k, v]) => {
      if (!adj.has(k)) adj.set(k, []);
      adj.get(k).push(v);
    });
  };
  const couple = (a, b) => {
    if (a === b) return;
    addTo(partners, a, b);
    addTo(partners, b, a);
  };

  members.forEach((m) => {
    const me = norm(fullName(m));
    if (!me) return;
    (m.genograma || []).forEach((p) => {
      const other = norm(p.nombre);
      const rel = norm(p.relacion);
      if (!other || other === me) return;
      link(me, other, DELTA[rel] ?? 0);
      if (COUPLE.has(rel)) couple(me, other);
      if (rel === 'padre' || rel === 'madre') addTo(parents, me, other);
      if (rel === 'hijo' || rel === 'hija') addTo(parents, other, me);
    });
  });

  // Dos progenitores del mismo hijo son pareja
  parents.forEach((ps) => {
    const [a, b] = [...ps];
    if (ps.size === 2) couple(a, b);
  });

  const level = new Map();
  const comp = new Map();
  let id = 0;
  adj.forEach((_, start) => {
    if (level.has(start)) return;
    level.set(start, 0); comp.set(start, id);
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      adj.get(cur).forEach(([next, d]) => {
        if (!level.has(next)) { level.set(next, level.get(cur) + d); comp.set(next, id); queue.push(next); }
      });
    }
    id++;
  });
  return { level, comp, partners, parents };
}