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

// Relación inversa; `s` = sexo de quien origina la relación ('M' | 'F')
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
export const getInverseRelacion = (rel, sexoOrigen) =>
  (INVERSE[rel] ? INVERSE[rel](sexoOrigen) : 'Familiar');

/** Actualiza la relación si la persona ya existe (por nombre); si no, la agrega. */
export function upsertRelacion(genograma = [], nombre, relacion) {
  const key = norm(nombre);
  const i = genograma.findIndex((p) => norm(p.nombre) === key);
  if (i === -1)
    return [...genograma, { nombre: nombre.trim(), relacion, edad: '', viveConElMiembro: false }];
  return genograma.map((p, k) => (k === i ? { ...p, relacion } : p));
}

export const removeRelacion = (genograma = [], nombre) =>
  genograma.filter((p) => norm(p.nombre) !== norm(nombre));

const JERARQUIA = ['padre', 'madre', 'hermano', 'hermana'];

/** Construye el payload del modal a partir del nodo clicado en la constelación. */
export function buildEditData(node, members) {
  if (node.esMiembroIglesia) {
    return { type: 'new', source: { id: node.id, realId: node.realId, nombre: node.nombre } };
  }
  const key = norm(node.nombre);
  const lista = (m) => (Array.isArray(m.genograma) ? m.genograma : []);
  const anclas = members.filter((m) => lista(m).some((p) => norm(p.nombre) === key));
  if (!anclas.length) return null;

  const ancla =
    JERARQUIA.map((rel) =>
      anclas.find((a) => lista(a).some((p) => norm(p.nombre) === key && norm(p.relacion) === rel))
    ).find(Boolean) || anclas[0];

  const entrada = lista(ancla).find((p) => norm(p.nombre) === key);
  return {
    type: 'edit',
    source: { realId: ancla.id, nombre: fullName(ancla) },
    target: node, // trae realId (null si es familiar externo)
    relacion: toOpcion(entrada?.relacion),
  };
}

/** Relaciones de una persona: propias + declaradas por otros + inferidas. */
export function relationsOf(person, members) {
  const self = norm(person.nombre);
  const byName = new Map(members.map((m) => [norm(fullName(m)), m]));
  const list = new Map();

  const own = members.find((m) => m.id === person.realId)?.genograma || [];
  own.forEach((p) => {
    const key = norm(p.nombre);
    if (!key || key === self) return;
    list.set(key, { key, nombre: p.nombre.trim(), relacion: toOpcion(p.relacion), realId: byName.get(key)?.id || null });
  });

  members.forEach((m) => {
    if (m.id === person.realId) return;
    const key = norm(fullName(m));
    const entry = (m.genograma || []).find((p) => norm(p.nombre) === self);
    if (entry && !list.has(key)) {
      list.set(key, { key, nombre: fullName(m), realId: m.id,
        relacion: getInverseRelacion(toOpcion(entry.relacion), m.sexo) });
    }
  });

  inferRelations(members).forEach((f) => {
    if (f.from !== self || list.has(f.to)) return;
    list.set(f.to, { key: f.to, nombre: f.nombre, relacion: f.relacion,
      realId: byName.get(f.to)?.id || null, inferida: true });
  });
  return [...list.values()];
}
const holder = (members, id) => members.find((m) => m.id === id);

/** "b es `relacion` de a" → lista de { id, genograma } a guardar. */
export function planSet(a, b, relacion, members) {
  const plan = [];
  const ma = a.realId && holder(members, a.realId);
  const mb = b.realId && holder(members, b.realId);
  if (ma) plan.push({ id: ma.id, genograma: upsertRelacion(ma.genograma, b.nombre, relacion) });
  if (mb) {
    plan.push({
      id: mb.id,
      genograma: upsertRelacion(mb.genograma, a.nombre, getInverseRelacion(relacion, a.sexo)),
    });
  }
  if (!plan.length) throw new Error('Al menos una de las dos personas debe ser miembro registrado.');
  return plan;
}

export function planRemove(a, b, members) {
  const plan = [];
  const ma = a.realId && holder(members, a.realId);
  const mb = b.realId && holder(members, b.realId);
  if (ma) plan.push({ id: ma.id, genograma: removeRelacion(ma.genograma, b.nombre) });
  if (mb) plan.push({ id: mb.id, genograma: removeRelacion(mb.genograma, a.nombre) });
  return plan;
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
      seen.set(k, prev ? { ...e, ...prev, edad: prev.edad || e.edad,
        viveConElMiembro: !!(prev.viveConElMiembro || e.viveConElMiembro) } : e);
    });
    seen.delete(norm(fullName(m))); // nadie es su propio familiar
    return { id: m.id, genograma: [...seen.values()] };
  });
}

export const planDeletePerson = (name, members) =>
  members.filter((m) => usa(m, name))
    .map((m) => ({ id: m.id, genograma: removeRelacion(m.genograma, name) }));