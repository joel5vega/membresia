import {
  collection, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where,
  QueryConstraint, Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Member, CreateMemberDTO } from '../types';
import { getAll, peek, patch, patchMany, add, remove } from './memberStore';
import { deleteMemberCascade, renameMemberCascade } from './functionsApi';

const MEMBERS_COLLECTION = 'members';

const norm = (s: unknown) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const buildMemberId = (nombre: string, apellido: string) => {
  const random3 = Math.floor(100 + Math.random() * 900);
  const clean = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const firstName = clean(nombre).charAt(0).toUpperCase() + clean(nombre).slice(1);
  const lastName = clean(apellido).charAt(0).toUpperCase() + clean(apellido).slice(1);
  return `${lastName}${firstName}-${random3}`;
};

export const memberService = {
  // Create
  async addMember(data: CreateMemberDTO): Promise<string> {
    try {
      const customId = buildMemberId(data.nombre, data.apellido);
      const docRef = doc(collection(db, MEMBERS_COLLECTION), customId);
      await setDoc(docRef, {
        ...data,
        joinDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      add({ id: docRef.id, ...data });
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding member:', error);
      throw error;
    }
  },

  // Read single member (documento completo)
  async getMember(id: string): Promise<Member | null> {
    try {
      const docSnap = await getDoc(doc(db, MEMBERS_COLLECTION, id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Member) : null;
    } catch (error) {
      console.error('❌ Error getting member:', error);
      throw error;
    }
  },

  // Read all: sin filtros usa la caché compartida; con filtros consulta Firestore
  async getMembers(constraints?: QueryConstraint[], opts?: { force?: boolean }): Promise<Member[]> {
    try {
      if (constraints && constraints.length > 0) {
        const snapshot = await getDocs(query(collection(db, MEMBERS_COLLECTION), ...constraints));
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Member));
      }
      return (await getAll(opts)) as Member[];
    } catch (error) {
      console.error('❌ Error in getMembers:', error);
      throw error;
    }
  },

  refreshMembers(): Promise<Member[]> {
    return getAll({ force: true }) as Promise<Member[]>;
  },

  // Update: si cambia el nombre, renombra también en todos los genogramas
  async updateMember(id: string, data: Partial<Member>): Promise<void> {
    try {
      const d: any = data;
      const prev: any = peek()?.find((m: any) => m.id === id);
      const nameChanged = !!prev && (
        ('nombre' in d && norm(d.nombre) !== norm(prev.nombre)) ||
        ('apellido' in d && norm(d.apellido) !== norm(prev.apellido))
      );

      if (nameChanged) {
        const nombre = String(d.nombre ?? prev.nombre ?? '');
        const apellido = String(d.apellido ?? prev.apellido ?? '');
        try {
          const { changed } = await renameMemberCascade(id, nombre, apellido);
          patchMany(changed);
          const { nombre: _n, apellido: _a, nombreCompleto: _c, ...rest } = d;
          patch(id, {
            nombre, apellido,
            ...(prev.nombreCompleto ? { nombreCompleto: `${nombre} ${apellido}`.trim() } : {}),
          });
          if (Object.keys(rest).length) {
            await updateDoc(doc(db, MEMBERS_COLLECTION, id), { ...rest, updatedAt: Timestamp.now() });
            patch(id, rest);
          }
          return;
        } catch (e: any) {
          if (e?.code === 'functions/already-exists') throw new Error('Ya existe otro miembro con ese nombre.');
          console.warn('renameMemberCascade no disponible; se guarda sin actualizar genogramas', e);
        }
      }

      await updateDoc(doc(db, MEMBERS_COLLECTION, id), { ...data, updatedAt: Timestamp.now() });
      patch(id, data);
    } catch (error) {
      console.error('❌ Error updating member:', error);
      throw error;
    }
  },

  // Delete: quita también el nombre de los genogramas (salvo keepRelations)
  async deleteMember(id: string, opts: { keepRelations?: boolean } = {}): Promise<void> {
    try {
      try {
        const { changed } = await deleteMemberCascade(id, !!opts.keepRelations);
        patchMany(changed);
      } catch (e) {
        console.warn('deleteMemberCascade no disponible; borrado simple', e);
        await deleteDoc(doc(db, MEMBERS_COLLECTION, id));
      }
      remove(id);
    } catch (error) {
      console.error('❌ Error deleting member:', error);
      throw error;
    }
  },

  // Search
  async searchMembers(field: string, value: any): Promise<Member[]> {
    return this.getMembers([where(field, '==', value)]);
  },

  async getMemberById(id: string): Promise<Member> {
    try {
      const docSnap = await getDoc(doc(db, MEMBERS_COLLECTION, id));
      if (!docSnap.exists()) throw new Error('Member not found');
      return { id: docSnap.id, ...docSnap.data() } as Member;
    } catch (error) {
      console.error('❌ Error fetching member:', error);
      throw error;
    }
  },

  // ¿Ya hay datos en memoria? (lo usa el cargador inicial de App.jsx)
  async hasCache(): Promise<boolean> {
    return peek() !== null;
  },
};