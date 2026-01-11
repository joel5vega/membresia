import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Member, CreateMemberDTO } from '../types';

const buildMemberId = (nombre: string, apellido: string) => {
  const random3 = Math.floor(100 + Math.random() * 900);
  const clean = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

  const firstName = clean(nombre).charAt(0).toUpperCase() + clean(nombre).slice(1);
  const lastName = clean(apellido).charAt(0).toUpperCase() + clean(apellido).slice(1);

  return `${lastName}${firstName}-${random3}`;
};

export const memberService = {
  // Create - Ahora requiere churchId
  async addMember(churchId: string, data: CreateMemberDTO): Promise<string> {
    try {
      if (!churchId) {
        throw new Error('churchId is required');
      }

      const customId = buildMemberId(data.nombre, data.apellido);
      const docRef = doc(collection(db, 'iglesias', churchId, 'miembros'), customId);

      await setDoc(docRef, {
        ...data,
        churchId, // Agregar referencia a la iglesia
        joinDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  },

  // Read - Obtener miembro específico
  async getMember(churchId: string, memberId: string): Promise<Member | null> {
    try {
      if (!churchId) {
        throw new Error('churchId is required');
      }

      const docRef = doc(db, 'iglesias', churchId, 'miembros', memberId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Member) : null;
    } catch (error) {
      console.error('Error getting member:', error);
      throw error;
    }
  },

  // Read - Obtener todos los miembros de una iglesia
  async getMembers(churchId: string, constraints?: QueryConstraint[]): Promise<Member[]> {
    try {
      if (!churchId) {
        throw new Error('churchId is required');
      }

      const membersRef = collection(db, 'iglesias', churchId, 'miembros');
      const q = constraints?.length ? query(membersRef, ...constraints) : membersRef;
      const querySnapshot = await getDocs(q);
      
      console.log('Firestore members snapshot size:', querySnapshot.size);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member));
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  },

  // Update
  async updateMember(churchId: string, memberId: string, data: Partial<Member>): Promise<void> {
    try {
      if (!churchId) {
        throw new Error('churchId is required');
      }

      const docRef = doc(db, 'iglesias', churchId, 'miembros', memberId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  // Delete
  async deleteMember(churchId: string, memberId: string): Promise<void> {
    try {
      if (!churchId) {
        throw new Error('churchId is required');
      }

      const docRef = doc(db, 'iglesias', churchId, 'miembros', memberId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  // Search
  async searchMembers(churchId: string, field: string, value: any): Promise<Member[]> {
    try {
      const constraints = [where(field, '==', value)];
      return await this.getMembers(churchId, constraints);
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  },

  async getMemberById(churchId: string, memberId: string): Promise<Member> {
    try {
      if (!churchId) {
        throw new Error('churchId is required');
      }

      const docRef = doc(db, 'iglesias', churchId, 'miembros', memberId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Member not found');
      return { id: docSnap.id, ...docSnap.data() } as Member;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },
};
