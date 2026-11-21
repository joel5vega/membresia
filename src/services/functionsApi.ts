import './firebaseConfig'; // asegura que Firebase esté inicializado
import { getFunctions, httpsCallable } from 'firebase/functions';

const call = async <T,>(name: string, data: unknown = {}): Promise<T> =>
  (await httpsCallable(getFunctions(), name)(data)).data as T;

export type GenogramaPatch = { id: string; genograma: any[] };

export const fetchMembersLite = (photos = true) => call<any[]>('membersLite', { photos });

export const deleteMemberCascade = (id: string, keepRelations = false) =>
  call<{ changed: GenogramaPatch[] }>('deleteMemberCascade', { id, keepRelations });

export const renameMemberCascade = (id: string, nombre: string, apellido: string) =>
  call<{ changed: GenogramaPatch[] }>('renameMemberCascade', { id, nombre, apellido });

export const fetchPublicBirthdays = (k?: string | null) => call<any>('publicBirthdays', { k: k || '' });