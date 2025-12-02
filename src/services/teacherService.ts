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
import { Teacher, CreateTeacherDTO } from '../types';

const TEACHERS_COLLECTION = 'teachers';

export const teacherService = {
  // Create
  async addTeacher(data: CreateTeacherDTO): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, TEACHERS_COLLECTION), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding teacher:', error);
      throw error;
    }
  },

  // Read
  async getTeacher(id: string): Promise<Teacher | null> {
    try {
      const docRef = doc(db, TEACHERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Teacher) : null;
    } catch (error) {
      console.error('Error getting teacher:', error);
      throw error;
    }
  },

  async getTeachers(constraints?: QueryConstraint[]): Promise<Teacher[]> {
    try {
      const q = constraints?.length ? query(collection(db, TEACHERS_COLLECTION), ...constraints) : collection(db, TEACHERS_COLLECTION);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Teacher));
    } catch (error) {
      console.error('Error getting teachers:', error);
      throw error;
    }
  },

  async getTeachersByEmail(email: string): Promise<Teacher[]> {
    try {
      const constraints = [where('email', '==', email)];
      return await this.getTeachers(constraints);
    } catch (error) {
      console.error('Error getting teachers by email:', error);
      throw error;
    }
  },

  // Update
  async updateTeacher(id: string, data: Partial<Teacher>): Promise<void> {
    try {
      const docRef = doc(db, TEACHERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  // Delete
  async deleteTeacher(id: string): Promise<void> {
    try {
      const docRef = doc(db, TEACHERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },

  // Search
  async searchTeachers(field: string, value: any): Promise<Teacher[]> {
    try {
      const constraints = [where(field, '==', value)];
      return await this.getTeachers(constraints);
    } catch (error) {
      console.error('Error searching teachers:', error);
      throw error;
    }
  },
};
