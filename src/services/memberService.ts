import {
  collection,
  addDoc,
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

export const memberService = {
  // Create
  async addMember(data: CreateMemberDTO): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
        ...data,
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
};
