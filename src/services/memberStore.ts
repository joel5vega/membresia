import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { fetchMembersLite, GenogramaPatch } from './functionsApi';

type M = any;
const TTL = 30 * 60 * 1000;   // pasado este tiempo se refresca en segundo plano

let members: M[] | null = null;
let loadedAt = 0;
let pending: Promise<M[]> | null = null;

async function load(): Promise<M[]> {
  try {
    return await fetchMembersLite();
  } catch (e) {
    console.warn('membersLite no disponible; lectura directa de Firestore', e);
    const snap = await getDocs(collection(db, 'members'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

function refresh(): Promise<M[]> {
  pending ||= load()
    .then((m) => { members = m; loadedAt = Date.now(); return m; })
    .finally(() => { pending = null; });
  return pending;
}

/** Devuelve la caché al instante; si está vencida, refresca por detrás. */
export function getAll({ force = false }: { force?: boolean } = {}): Promise<M[]> {
  if (members && !force) {
    if (Date.now() - loadedAt > TTL) refresh().catch(() => {});
    return Promise.resolve(members);
  }
  return refresh();
}

export const peek = () => members;
export const clearMembers = () => { members = null; loadedAt = 0; };

/* Todas las mutaciones crean arrays nuevos (nunca mutan) */
export const patch = (id: string, data: object) => {
  if (members) members = members.map((m) => (m.id === id ? { ...m, ...data } : m));
};
export const patchMany = (list: GenogramaPatch[] = []) => {
  if (!members || !list.length) return;
  const map = new Map(list.map((p) => [p.id, p.genograma]));
  members = members.map((m) => (map.has(m.id) ? { ...m, genograma: map.get(m.id) } : m));
};
export const add = (m: M) => { if (members) members = [...members, m]; };
export const remove = (id: string) => { if (members) members = members.filter((m) => m.id !== id); };