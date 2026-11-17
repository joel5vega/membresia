import { norm, fullName } from './names';

const MALE = new Set(['padre', 'hijo', 'hermano', 'abuelo', 'nieto', 'tio', 'sobrino', 'primo', 'amigo', 'esposo']);
const FEMALE = new Set(['madre', 'hija', 'hermana', 'abuela', 'nieta', 'tia', 'sobrina', 'prima', 'amiga', 'esposa']);
const PARENT = new Set(['padre', 'madre']);
const CHILD = new Set(['hijo', 'hija']);
const SIBLING = new Set(['hermano', 'hermana']);

const addTo = (map, k, v) => { if (!map.has(k)) map.set(k, new Set()); map.get(k).add(v); };

/** Devuelve [{ from, to, nombre, relacion }] = "`to` es `relacion` de `from`". Nunca repite lo explícito. */
export function inferRelations(members) {
  const people = new Map();
  const parents = new Map();      // hijo → Set(padres)
  const siblings = new Map();
  const explicit = new Set();
  const pair = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const touch = (name, sexo) => {
    const key = norm(name);
    if (!key) return null;
    const p = people.get(key) || { key, nombre: String(name).trim(), sexo: null };
    if (!p.sexo && (sexo === 'M' || sexo === 'F')) p.sexo = sexo;
    people.set(key, p);
    return key;
  };

  // 1. Hechos explícitos
  members.forEach((m) => {
    const me = touch(fullName(m), m.sexo);
    (m.genograma || []).forEach((p) => {
      const rel = norm(p.relacion);
      const other = touch(p.nombre, MALE.has(rel) ? 'M' : FEMALE.has(rel) ? 'F' : null);
      if (!me || !other || me === other) return;
      explicit.add(pair(me, other));
      if (PARENT.has(rel)) addTo(parents, me, other);
      else if (CHILD.has(rel)) addTo(parents, other, me);
      else if (SIBLING.has(rel)) { addTo(siblings, me, other); addTo(siblings, other, me); }
    });
  });

  // 2. Grupos de hermanos (cierre transitivo + hijos del mismo padre/madre)
  const uf = new Map();
  const find = (k) => {
    if (!uf.has(k)) uf.set(k, k);
    while (uf.get(k) !== k) { uf.set(k, uf.get(uf.get(k))); k = uf.get(k); }
    return k;
  };
  const union = (a, b) => uf.set(find(a), find(b));
  siblings.forEach((set, k) => set.forEach((o) => union(k, o)));
  const kids = new Map();
  parents.forEach((ps, c) => ps.forEach((p) => addTo(kids, p, c)));
  kids.forEach((cs) => { const [first, ...rest] = [...cs]; rest.forEach((c) => union(first, c)); });

  const groups = new Map();
  [...uf.keys()].forEach((k) => addTo(groups, find(k), k));
  const groupOf = (k) => groups.get(find(k));

  // 3. Padres efectivos: propios + los de sus hermanos (aproximación: medios hermanos incluidos)
  const eff = new Map();
  people.forEach((_, k) => {
    const set = new Set(parents.get(k));
    groupOf(k)?.forEach((s) => parents.get(s)?.forEach((p) => set.add(p)));
    if (set.size) eff.set(k, set);
  });

  // 4. Emitir
  const out = new Map();
  const sex = (k) => people.get(k)?.sexo;
  const lab = (k, m, f, n) => (sex(k) === 'M' ? m : sex(k) === 'F' ? f : n);
  const emit = (from, to, relacion) => {
    if (from === to || explicit.has(pair(from, to))) return;
    const id = `${from}>${to}`;
    if (!out.has(id)) out.set(id, { from, to, nombre: people.get(to).nombre, relacion });
  };

  groups.forEach((g) => {
    const ks = [...g];
    ks.forEach((a) => ks.forEach((b) => a !== b && emit(a, b, lab(b, 'Hermano', 'Hermana', 'Hermano/a'))));
  });

  eff.forEach((ps, c) => ps.forEach((p) => {
    emit(c, p, lab(p, 'Padre', 'Madre', 'Progenitor/a'));
    emit(p, c, lab(c, 'Hijo', 'Hija', 'Hijo/a'));
    eff.get(p)?.forEach((g) => {
      emit(c, g, lab(g, 'Abuelo', 'Abuela', 'Abuelo/a'));
      emit(g, c, lab(c, 'Nieto', 'Nieta', 'Nieto/a'));
    });
    groupOf(p)?.forEach((u) => {
      if (u === p || ps.has(u)) return;
      emit(c, u, lab(u, 'Tío', 'Tía', 'Tío/a'));
      emit(u, c, lab(c, 'Sobrino', 'Sobrina', 'Sobrino/a'));
    });
  }));

  return [...out.values()];
}