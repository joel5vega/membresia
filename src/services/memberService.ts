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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from './firebaseConfig';
import { Member, CreateMemberDTO } from '../types';
import { cacheMembers, getCachedMembers, isCacheValid } from './dataCache';

const MEMBERS_COLLECTION = 'members';

// Inicializar Cloud Functions
const functions = getFunctions();
const getMembersFilteredFn = httpsCallable(functions, 'getMembersFiltered');

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
  // Create
  async addMember(data: CreateMemberDTO): Promise<string> {
    console.log('🔵 memberService.addMember called');
    try {
      const customId = buildMemberId(data.nombre, data.apellido);
      const docRef = doc(collection(db, MEMBERS_COLLECTION), customId);

      await setDoc(docRef, {
        ...data,
        joinDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Member added:', customId);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding member:', error);
      throw error;
    }
  },

  // Read single member
  async getMember(id: string): Promise<Member | null> {
    console.log('🔵 memberService.getMember called for id:', id);
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      console.log('✅ Single member fetched:', id);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Member) : null;
    } catch (error) {
      console.error('❌ Error getting member:', error);
      throw error;
    }
  },

  // Read all members
  async getMembers(constraints?: QueryConstraint[]): Promise<Member[]> {
    console.log('🔵 memberService.getMembers called');
    console.log('   Constraints:', constraints ? `${constraints.length} constraint(s)` : 'none');
    
    try {
      // Verificar cache primero si no hay constraints
      if (!constraints || constraints.length === 0) {
        console.log('🔍 Checking cache...');
        const { members, timestamp } = await getCachedMembers();
        
        if (members.length > 0) {
          console.log(`   Cache has ${members.length} members`);
          const isValid = isCacheValid(timestamp);
          console.log(`   Cache valid: ${isValid}`);
          
          if (isValid) {
            console.log('✅ Using cached members (no API call)');
            return members;
          } else {
            console.log('⚠️  Cache expired, fetching fresh data');
          }
        } else {
          console.log('⚠️  Cache is empty');
        }
      }

      // Si hay constraints, usar Firestore directo
      if (constraints && constraints.length > 0) {
        console.log('⚠️  Using Firestore DIRECT query (has constraints)');
        const q = query(collection(db, MEMBERS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);
        console.log(`✅ Fetched ${querySnapshot.size} members from Firestore`);
        return querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Member));
      }

      // Sin constraints, usar Cloud Function
      console.log('🚀 Calling Cloud Function: getMembersFiltered');
      const result = await getMembersFilteredFn({ filters: null });
      const members = result.data as Member[];
      console.log(`✅ Cloud Function returned ${members.length} members`);
      
      // Cachear los resultados
      console.log('💾 Caching members...');
      await cacheMembers(members);
      console.log('✅ Members cached successfully');
      
      return members;
    } catch (error) {
      console.error('❌ Error in getMembers:', error);
      throw error;
    }
  },

  // Update
  async updateMember(id: string, data: Partial<Member>): Promise<void> {
    console.log('🔵 memberService.updateMember called for:', id);
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Member updated:', id);
    } catch (error) {
      console.error('❌ Error updating member:', error);
      throw error;
    }
  },

  // Delete
  async deleteMember(id: string): Promise<void> {
    console.log('🔵 memberService.deleteMember called for:', id);
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);

      await deleteDoc(docRef);
      console.log('✅ Member deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting member:', error);
      throw error;
    }
  },

  // Search
  async searchMembers(field: string, value: any): Promise<Member[]> {
    console.log('🔵 memberService.searchMembers called');
    console.log(`   Field: ${field}, Value: ${value}`);
    try {
      const constraints = [where(field, '==', value)];
      return await this.getMembers(constraints);
    } catch (error) {
      console.error('❌ Error searching members:', error);
      throw error;
    }
  },

  async getMemberById(id: string): Promise<Member> {
    console.log('🔵 memberService.getMemberById called for:', id);
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Member not found');
      console.log('✅ Member by ID fetched:', id);
      return { id: docSnap.id, ...docSnap.data() } as Member;
    } catch (error) {
      console.error('❌ Error fetching member:', error);
      throw error;
    }
  },

  // Check if cache exists
  async hasCache(): Promise<boolean> {
    try {
      const { members } = await getCachedMembers();
      return members.length > 0;
    } catch (error) {
      console.error('❌ Error checking cache:', error);
      return false;
    }
  }
};
