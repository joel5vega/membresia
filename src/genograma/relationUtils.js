import { norm, fullName } from './names';
import { inferRelations } from './inference';

export { norm, fullName };

export const RELACIONES = [
  'Padre', 'Madre', 'Hermano', 'Hermana', 'Hijo', 'Hija',
  'Abuelo', 'Abuela', 'Tío', 'Tía', 'Primo', 'Prima',
  'Sobrino', 'Sobrina', 'Nieto', 'Nieta', 'Amigo', 'Amiga',
  'Esposo', 'Esposa', 'Pareja', 'Ex-pareja',
];

/** Convierte "hermano"/"Tio" a la opción canónica del select. */
export const toOpcion = (rel) => RELACIONES.find((r) => norm(r) === norm(rel)) || 'Amigo';

// Relación inversa; `s` = sexo de quien recibe la relación inversa ('M' | 'F')
const f = (m, fem) => (s) => (s === 'F' ? fem : m);
const INVERSE = {
  Padre: f('Hijo', 'Hija'), Madre: f('Hijo', 'Hija'),
  Hijo: f('Padre', 'Madre'), Hija: f('Padre', 'Madre'),
  Hermano: f('Hermano', 'Hermana'), Hermana: f('Hermano', 'Hermana'),
  Abuelo: f('Nieto', 'Nieta'), Abuela: f('Nieto', 'Nieta'),
  Nieto: f('Abuelo', 'Abuela'), Nieta: f('Abuelo', 'Abuela'),
  Tío: f('Sobrino', 'Sobrina'), Tía: f('Sobrino', 'Sobrina'),
  Sobrino: f('Tío', 'Tía'), Sobrina: f('Tío', 'Tía'),
  Primo: f('Primo', 'Prima'), Prima: f('Primo', 'Prima'),
  Amigo: f('Amigo', 'Amiga'), Amiga: f('Amigo', 'Amiga'),
  Esposo: () => 'Esposa', Esposa: () => 'Esposo',
  Pareja: () => 'Pareja', 'Ex-pareja': () => 'Ex-pareja',
};
export const getInverseRelacion = (rel, sexo) =>
  (INVERSE[rel] ? INVERSE[rel](sexo) : 'Familiar');

/* ── Operaciones sobre un genograma ─────────────────────────────── */

/** Actualiza la relación si la persona ya existe (por nombre); si no, la agrega. */
export function upsertRelacion(genograma = [], nombre, relacion) {
  const key = norm(nombre);
  const i = genograma.findIndex((p) => norm(p.nombre) === key);
  if (i === -1) {
    return [...genograma, { nombre: nombre.trim(), relacion, edad: '', viveConElMiembro: false }];
  }
  return genograma.map((p, k) => (k === i ? { ...p, relacion } : p));
}

export const removeRelacion = (genograma = [], nombre) =>
  genograma.filter((p) => norm(p.nombre) !== norm(nombre));

/* ── Lectura: relaciones de una persona ─────────────────────────── */

/** Propias + declaradas por otros (invertidas) + inferidas. */
export function relationsOf(person, members) {
  const self = norm(person.nombre);
  const byName = new Map(members.map((m) => [norm(fullName(m)), m]));
  const list = new Map();

  const own = members.find((m) => m.id === person.realId)?.genograma || [];
  own.forEach((p) => {
    const key = norm(p.nombre);
    if (!key || key === self) return;
    list.set(key, {
      key, nombre: (p.nombre || '').trim(), relacion: toOpcion(p.relacion),
      realId: byName.get(key)?.id || null,
    });
  });

  members.forEach((m) => {
    if (m.id === person.realId) return;
    const key = norm(fullName(m));
    const entry = (m.genograma || []).find((p) => norm(p.nombre) === self);
    if (entry && !list.has(key)) {
      list.set(key, {
        key, nombre: fullName(m), realId: m.id,
        relacion: getInverseRelacion(toOpcion(entry.relacion), m.sexo),
      });
    }
  });

  inferRelations(members).forEach((r) => {
    if (r.from !== self || list.has(r.to)) return;
    list.set(r.to, {
      key: r.to, nombre: r.nombre, relacion: r.relacion,
      realId: byName.get(r.to)?.id || null, inferida: true,
    });
  });
  return [...list.values()];
}

/* ── Planes de escritura (puros): devuelven [{ id, genograma }] ─── */

const holder = (members, id) => (id ? members.find((m) => m.id === id) || null : null);

/** "b es `relacion` de a", escrito en AMBOS lados cuando son miembros. */
export function planSet(a, b, relacion, members) {
  if (a.key && a.key === b.key) throw new Error('Una persona no puede relacionarse consigo misma.');
  const ma = holder(members, a.realId);
  const mb = holder(members, b.realId);
  if (!ma && !mb) throw new Error('Al menos una de las dos personas debe ser miembro registrado.');

  const sexoA = a.sexo === 'M' || a.sexo === 'F' ? a.sexo : ma?.sexo;
  const nameA = ma ? fullName(ma) : a.nombre;
  const nameB = mb ? fullName(mb) : b.nombre;

  const plan = [];
  if (ma) plan.push({ id: ma.id, genograma: upsertRelacion(ma.genograma, nameB, relacion) });
  if (mb) {
    plan.push({
      id: mb.id,
      genograma: upsertRelacion(mb.genograma, nameA, getInverseRelacion(relacion, sexoA)),
    });
  }
  return plan;
}

export function planRemove(a, b, members) {
  const ma = holder(members, a.realId);
  const mb = holder(members, b.realId);
  const plan = [];
  if (ma) plan.push({ id: ma.id, genograma: removeRelacion(ma.genograma, mb ? fullName(mb) : b.nombre) });
  if (mb) plan.push({ id: mb.id, genograma: removeRelacion(mb.genograma, ma ? fullName(ma) : a.nombre) });
  return plan;
}

/** Edita campos (edad, sexo, viveConElMiembro) de una entrada del genograma de `ownerId`. */
export function planEntry(ownerId, name, patch, members) {
  const m = holder(members, ownerId);
  if (!m) throw new Error('El dueño del genograma no es un miembro registrado.');
  const key = norm(name);
  return [{
    id: m.id,
    genograma: (m.genograma || []).map((p) => (norm(p.nombre) === key ? { ...p, ...patch } : p)),
  }];
}

const usa = (m, name) => (m.genograma || []).some((p) => norm(p.nombre) === norm(name));

/** Renombra/fusiona una persona en TODOS los genogramas donde aparece. */
export function planRename(oldName, newName, members) {
  const from = norm(oldName);
  const to = newName.trim();
  return members.filter((m) => usa(m, oldName)).map((m) => {
    const seen = new Map();
    (m.genograma || []).forEach((p) => {
      const e = norm(p.nombre) === from ? { ...p, nombre: to } : p;
      const k = norm(e.nombre);
      const prev = seen.get(k);
      seen.set(k, prev
        ? { ...e, ...prev, edad: prev.edad || e.edad, viveConElMiembro: !!(prev.viveConElMiembro || e.viveConElMiembro) }
        : e);
    });
    seen.delete(norm(fullName(m))); // nadie es su propio familiar
    return { id: m.id, genograma: [...seen.values()] };
  });
}

export const planDeletePerson = (name, members) =>
  members.filter((m) => usa(m, name))
    .map((m) => ({ id: m.id, genograma: removeRelacion(m.genograma, name) }));