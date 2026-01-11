import { db } from './firebaseConfig';
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
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

// Types for Genogram
export interface GenogramPerson {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: Date;
  deathDate?: Date;
  healthConditions?: string[];
  role?: 'parent' | 'child' | 'sibling' | 'spouse';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GenogramRelationship {
  id: string;
  familyId: string;
  personId1: string;
  personId2: string;
  type: 'marriage' | 'parent-child' | 'sibling' | 'connection';
  status?: 'active' | 'divorced' | 'deceased' | 'estranged';
  startDate?: Date;
  endDate?: Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Family {
  id: string;
  name: string;
  churchId: string;
  description?: string;
  rootPersonId: string;
  memberCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
}

// Family Service
export const familyService = {
  async createFamily(
    churchId: string,
    name: string,
    rootPersonId: string,
    description?: string
  ): Promise<Family> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'families'), {
      churchId,
      name,
      rootPersonId,
      description,
      memberCount: 1,
      createdAt: now,
      updatedAt: now,
      tags: ['new'],
    });
    return { id: docRef.id, churchId, name, rootPersonId, memberCount: 1, createdAt: now, updatedAt: now } as Family;
  },

 async getFamiliesByChurch(churchId: string): Promise<Family[]> {
  // FIX: Usar la ruta correcta con subcollection
  const familiesRef = collection(db, 'iglesias', churchId, 'families');
  const querySnapshot = await getDocs(familiesRef);
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Family));
},
  async getFamilyById(familyId: string): Promise<Family | null> {
    const docSnap = await getDoc(doc(db, 'families', familyId));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Family) : null;
  },

  async updateFamily(familyId: string, updates: Partial<Family>): Promise<void> {
    await updateDoc(doc(db, 'families', familyId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteFamily(familyId: string): Promise<void> {
    const people = await genogramService.getPersonsByFamily(familyId);
    for (const person of people) {
      await genogramService.deletePerson(person.id);
    }
    await deleteDoc(doc(db, 'families', familyId));
  },
};

// Genogram Service
export const genogramService = {
  async addPerson(
    familyId: string,
    memberId: string,
    firstName: string,
    lastName: string,
    gender: 'male' | 'female' | 'other'
  ): Promise<GenogramPerson> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'genogramPersons'), {
      familyId,
      memberId,
      firstName,
      lastName,
      gender,
      healthConditions: [],
      createdAt: now,
      updatedAt: now,
    });

    const family = await familyService.getFamilyById(familyId);
    if (family) {
      await familyService.updateFamily(familyId, {
        memberCount: (family.memberCount || 0) + 1,
      });
    }

    return {
      id: docRef.id,
      familyId,
      memberId,
      firstName,
      lastName,
      gender,
      createdAt: now,
      updatedAt: now,
    } as GenogramPerson;
  },

  async getPersonsByFamily(familyId: string): Promise<GenogramPerson[]> {
    const q = query(collection(db, 'genogramPersons'), where('familyId', '==', familyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GenogramPerson));
  },

  async updatePerson(personId: string, updates: Partial<GenogramPerson>): Promise<void> {
    await updateDoc(doc(db, 'genogramPersons', personId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deletePerson(personId: string): Promise<void> {
    const relationships = await genogramService.getRelationshipsForPerson(personId);
    for (const rel of relationships) {
      await deleteDoc(doc(db, 'genogramRelationships', rel.id));
    }
    await deleteDoc(doc(db, 'genogramPersons', personId));
  },

  async addRelationship(
    familyId: string,
    personId1: string,
    personId2: string,
    type: 'marriage' | 'parent-child' | 'sibling' | 'connection'
  ): Promise<GenogramRelationship> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'genogramRelationships'), {
      familyId,
      personId1,
      personId2,
      type,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      familyId,
      personId1,
      personId2,
      type,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    } as GenogramRelationship;
  },

  async getRelationshipsForPerson(personId: string): Promise<GenogramRelationship[]> {
    const q1 = query(collection(db, 'genogramRelationships'), where('personId1', '==', personId));
    const q2 = query(collection(db, 'genogramRelationships'), where('personId2', '==', personId));
    const snap1 = await getDocs(q1);
    const snap2 = await getDocs(q2);
    const results = [
      ...snap1.docs.map((d) => ({ id: d.id, ...d.data() } as GenogramRelationship)),
      ...snap2.docs.map((d) => ({ id: d.id, ...d.data() } as GenogramRelationship)),
    ];
    return results;
  },

  async getRelationshipsByFamily(familyId: string): Promise<GenogramRelationship[]> {
    const q = query(collection(db, 'genogramRelationships'), where('familyId', '==', familyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GenogramRelationship));
  },

  async updateRelationship(relationshipId: string, updates: Partial<GenogramRelationship>): Promise<void> {
    await updateDoc(doc(db, 'genogramRelationships', relationshipId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteRelationship(relationshipId: string): Promise<void> {
    await deleteDoc(doc(db, 'genogramRelationships', relationshipId));
  },
};

// Church-wide Genogram Network Service
export const genogramNetworkService = {
  async getChurchGenogramNetwork(churchId: string) {
    const families = await familyService.getFamiliesByChurch(churchId);
    const networkNodes: any[] = [];
    const networkLinks: any[] = [];

    for (const family of families) {
      const people = await genogramService.getPersonsByFamily(family.id);
      const relationships = await genogramService.getRelationshipsByFamily(family.id);

      networkNodes.push({
        id: family.id,
        label: family.name,
        type: 'family',
        size: people.length,
      });

      for (const person of people) {
        networkNodes.push({
          id: person.id,
          label: `${person.firstName} ${person.lastName}`,
          type: 'person',
          gender: person.gender,
          familyId: family.id,
        });

        networkLinks.push({
          source: family.id,
          target: person.id,
          type: 'membership',
        });
      }

      for (const rel of relationships) {
        networkLinks.push({
          source: rel.personId1,
          target: rel.personId2,
          type: rel.type,
          status: rel.status,
        });
      }
    }

    return { nodes: networkNodes, links: networkLinks };
  },

  async findInterFamilyConnections(churchId: string): Promise<any[]> {
    const families = await familyService.getFamiliesByChurch(churchId);
    const connections: any[] = [];

    for (let i = 0; i < families.length; i++) {
      for (let j = i + 1; j < families.length; j++) {
        const people1 = await genogramService.getPersonsByFamily(families[i].id);
        const people2 = await genogramService.getPersonsByFamily(families[j].id);

        for (const p1 of people1) {
          for (const p2 of people2) {
            const rels = await genogramService.getRelationshipsForPerson(p1.id);
            const hasConnection = rels.some(
              (r) => (r.personId1 === p2.id || r.personId2 === p2.id) && r.type !== 'parent-child'
            );
            if (hasConnection) {
              connections.push({
                family1: families[i].name,
                family2: families[j].name,
                person1: `${p1.firstName} ${p1.lastName}`,
                person2: `${p2.firstName} ${p2.lastName}`,
              });
            }
          }
        }
      }
    }

    return connections;
  },
};

// Create families from existing church members
export const familyCreationService = {
  async getMembersForFamilyCreation(churchId: string): Promise<any[]> {
    try {
      // Validate churchId
      if (!churchId || typeof churchId !== 'string') {
        throw new Error('Invalid churchId: must be a non-empty string');
      }

      const membersRef = collection(db, 'iglesias', String(churchId), 'miembros');
      const querySnapshot = await getDocs(membersRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },
async createFamily(
  churchId: string,
  name: string,
  rootPersonId: string,
  description?: string
): Promise<Family> {
  const now = Timestamp.now();
  // FIX: Usar la ruta correcta con subcollection
  const docRef = await addDoc(collection(db, 'iglesias', churchId, 'families'), {
    churchId,
    name,
    rootPersonId,
    description,
    memberCount: 1,
    createdAt: now,
    updatedAt: now,
    tags: ['new'],
  });
  return { id: docRef.id, churchId, name, rootPersonId, memberCount: 1, createdAt: now, updatedAt: now } as Family;
},

  async createFamilyFromMembers(
    churchId: string,
    familyName: string,
    memberIds: string[],
    autoDetectRelationships: boolean = true
  ): Promise<string> {
    // Validate inputs
    if (!churchId || typeof churchId !== 'string') {
      throw new Error('Invalid churchId: must be a non-empty string');
    }
    
    if (!familyName || typeof familyName !== 'string') {
      throw new Error('Invalid familyName: must be a non-empty string');
    }
    
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      throw new Error('Invalid memberIds: must be a non-empty array');
    }

    try {
      // Ensure churchId is string and create family document
      const churchIdStr = String(churchId);
      const familiesCollectionRef = collection(db, 'iglesias', churchIdStr, 'families');
      
      const familyRef = await addDoc(familiesCollectionRef, {
        name: familyName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        memberCount: memberIds.length
      });

      // Add each member to genogramPersons
      for (const memberId of memberIds) {
        // Ensure memberId is string
        const memberIdStr = String(memberId);
        const memberDocRef = doc(db, 'iglesias', churchIdStr, 'miembros', memberIdStr);
        const memberDoc = await getDoc(memberDocRef);
        const memberData = memberDoc.exists() ? memberDoc.data() : null;
        
        if (memberData) {
          const genogramPersonsRef = collection(db, 'iglesias', churchIdStr, 'genogramPersons');
          await addDoc(genogramPersonsRef, {
            familyId: familyRef.id, // This is already a string from Firestore
            memberId: memberIdStr,
            firstName: memberData.firstName || '',
            lastName: memberData.lastName || '',
            gender: memberData.gender || 'other',
            birthDate: memberData.birthDate,
            role: 'other',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
      }
      
      return familyRef.id;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  },

  async getFamilyTree(churchId: string, familyId: string): Promise<any> {
    try {
      // Validate inputs
      if (!churchId || typeof churchId !== 'string') {
        throw new Error('Invalid churchId: must be a non-empty string');
      }
      
      if (!familyId || typeof familyId !== 'string') {
        throw new Error('Invalid familyId: must be a non-empty string');
      }

      const churchIdStr = String(churchId);
      const familyIdStr = String(familyId);
      
      const personsRef = collection(db, 'iglesias', churchIdStr, 'genogramPersons');
      const q = query(personsRef, where('familyId', '==', familyIdStr));
      const querySnapshot = await getDocs(q);
      const persons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        all: persons,
        parents: persons.filter((p: any) => p.role === 'parent'),
        children: persons.filter((p: any) => p.role === 'child'),
        siblings: persons.filter((p: any) => p.role === 'sibling'),
        spouse: persons.filter((p: any) => p.role === 'spouse')
      };
    } catch (error) {
      console.error('Error getting family tree:', error);
      throw error;
    }
  }
};

export default {
  familyService,
  genogramService,
  genogramNetworkService,
  familyCreationService,
};
