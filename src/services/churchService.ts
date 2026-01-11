import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Church {
  id: string;
  name: string;
  ownerId: string; // UID del usuario administrador
  ownerEmail: string;
  address?: string;
  phone?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChurchMember {
  userId: string;
  email: string;
  role: 'admin' | 'pastor' | 'member';
  addedAt: Timestamp;
}

export const churchService = {
  // Crear una nueva iglesia
  async createChurch(
    ownerId: string,
    ownerEmail: string,
    churchData: {
      name: string;
      address?: string;
      phone?: string;
      description?: string;
    }
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      
      // Crear el documento de la iglesia
      const churchRef = await addDoc(collection(db, 'iglesias'), {
        name: churchData.name,
        ownerId,
        ownerEmail,
        address: churchData.address || '',
        phone: churchData.phone || '',
        description: churchData.description || '',
        createdAt: now,
        updatedAt: now,
      });

      // Crear el perfil del usuario en la subcolección de miembros de la iglesia
      await setDoc(doc(db, 'iglesias', churchRef.id, 'churchMembers', ownerId), {
        userId: ownerId,
        email: ownerEmail,
        role: 'admin',
        addedAt: now,
      });

      // Crear el documento del usuario en la colección de usuarios
      await setDoc(doc(db, 'users', ownerId), {
        email: ownerEmail,
        churchId: churchRef.id,
        churchName: churchData.name,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      });

      return churchRef.id;
    } catch (error) {
      console.error('Error creating church:', error);
      throw error;
    }
  },

  // Obtener iglesia por ID
  async getChurch(churchId: string): Promise<Church | null> {
    try {
      const docRef = doc(db, 'iglesias', churchId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return { id: docSnap.id, ...docSnap.data() } as Church;
    } catch (error) {
      console.error('Error getting church:', error);
      throw error;
    }
  },

  // Obtener iglesias del usuario
  async getUserChurches(userId: string): Promise<Church[]> {
    try {
      const q = query(collection(db, 'iglesias'), where('ownerId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Church[];
    } catch (error) {
      console.error('Error getting user churches:', error);
      throw error;
    }
  },

  // Obtener el perfil del usuario
  async getUserProfile(userId: string): Promise<any> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Actualizar iglesia
  async updateChurch(churchId: string, updates: Partial<Church>): Promise<void> {
    try {
      const docRef = doc(db, 'iglesias', churchId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating church:', error);
      throw error;
    }
  },

  // Agregar miembro a la iglesia
  async addChurchMember(
    churchId: string,
    userId: string,
    email: string,
    role: 'admin' | 'pastor' | 'member' = 'member'
  ): Promise<void> {
    try {
      const now = Timestamp.now();
      
      await setDoc(doc(db, 'iglesias', churchId, 'churchMembers', userId), {
        userId,
        email,
        role,
        addedAt: now,
      });

      // Actualizar el perfil del usuario
      await setDoc(doc(db, 'users', userId), {
        email,
        churchId,
        role,
        updatedAt: now,
      }, { merge: true });
    } catch (error) {
      console.error('Error adding church member:', error);
      throw error;
    }
  },

  // Obtener miembros de la iglesia
  async getChurchMembers(churchId: string): Promise<ChurchMember[]> {
    try {
      const membersRef = collection(db, 'iglesias', churchId, 'churchMembers');
      const querySnapshot = await getDocs(membersRef);
      
      return querySnapshot.docs.map((doc) => doc.data() as ChurchMember);
    } catch (error) {
      console.error('Error getting church members:', error);
      throw error;
    }
  },
};
