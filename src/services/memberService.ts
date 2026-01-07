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

const MEMBERS_COLLECTION = 'members';


const buildMemberId = (nombre: string, apellido: string) => {
  const random3 = Math.floor(100 + Math.random() * 900); // 100–999
  const clean = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // sin tildes
      .replace(/\s+/g, ''); // sin espacios

  const firstName = clean(nombre).charAt(0).toUpperCase() + clean(nombre).slice(1);
  const lastName = clean(apellido).charAt(0).toUpperCase() + clean(apellido).slice(1);

  return `${lastName}${firstName}-${random3}`; // Ej: VegaJoel-123
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

      return docRef.id; // ApellidoNombre-123
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  },


  // Read
  async getMember(id: string): Promise<Member | null> {
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Member) : null;
    } catch (error) {
      console.error('Error getting member:', error);
      throw error;
    }
  },

  async getMembers(constraints?: QueryConstraint[]): Promise<Member[]> {
    try {
      const q = constraints?.length ? query(collection(db, MEMBERS_COLLECTION), ...constraints) : collection(db, MEMBERS_COLLECTION);
      const querySnapshot = await getDocs(q);
          console.log('Firestore members snapshot size:', querySnapshot.size, 'docs:', querySnapshot.docs);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member));
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  },

  // Update
  async updateMember(id: string, data: Partial<Member>): Promise<void> {
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
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
  async deleteMember(id: string): Promise<void> {
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  // Search
  async searchMembers(field: string, value: any): Promise<Member[]> {
    try {
      const constraints = [where(field, '==', value)];
      return await this.getMembers(constraints);
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
      },

  async getMemberById(id: string): Promise<Member> {
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Member not found');
      return { id: docSnap.id, ...docSnap.data() } as Member;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },



};
