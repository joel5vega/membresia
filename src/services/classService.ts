import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Class, ClassAttendance } from '../types';
// import { cacheClasses, getCachedClasses, isClassesCacheValid } from './dataCache';


// Crear o actualizar una clase
export const createOrUpdateClass = async (classData: Omit<Class, 'id'> & { id?: string }): Promise<string> => {
  try {
    const classRef = collection(db, 'classes');
    if (classData.id) {
      // Actualizar clase existente
      const docRef = doc(db, 'classes', classData.id);
      await updateDoc(docRef, {
        ...classData,
        actualizadoEn: Timestamp.now(),
      });
      return classData.id;
    } else {
      // Crear nueva clase
      const newClass = {
        ...classData,
        creadoEn: Timestamp.now(),
        actualizadoEn: Timestamp.now(),
      };
      const docRef = await addDoc(classRef, newClass);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creando/actualizando clase:', error);
    throw error;
  }
};

// Obtener todas las clases
export const getClasses = async (): Promise<Class[]> => {
  try {
        // Check cache first
            const { classes, timestamp } = await getCachedClasses();
                if (classes.length > 0 && isCacheValid(timestamp)) {
                        console.log('✓ Using cached classes');
                              return classes;
                                  }

                                      console.log('→ Fetching classes from Firebase');
    const classesCol = collection(db, 'classes');
    const classesSnapshot = await getDocs(classesCol);
                  
// Cache the fetched data
const classesToCache = classesSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data(),
} as Class));

await cacheClasses(classesToCache);
return classesToCache;
  } catch (error) {
    console.error('Error obteniendo clases:', error);
    throw error;
  }
};

// Obtener una clase por ID
export const getClassById = async (classId: string): Promise<Class | null> => {
  try {
    const docRef = doc(db, 'classes', classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Class;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo clase:', error);
    throw error;
  }
};

// Obtener clases por rango de fechas
export const getClassesByDateRange = async (startDate: Date, endDate: Date): Promise<Class[]> => {
  try {
    const classesCol = collection(db, 'classes');
    const q = query(
      classesCol,
      where('fecha', '>=', Timestamp.fromDate(startDate)),
      where('fecha', '<=', Timestamp.fromDate(endDate))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Class));
  } catch (error) {
    console.error('Error obteniendo clases por fecha:', error);
    throw error;
  }
};

// Obtener clases por maestro
export const getClassesByTeacher = async (maestroId: string): Promise<Class[]> => {
  try {
    const classesCol = collection(db, 'classes');
    const q = query(classesCol, where('maestroId', '==', maestroId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Class));
  } catch (error) {
    console.error('Error obteniendo clases por maestro:', error);
    throw error;
  }
};

// Eliminar una clase
export const deleteClass = async (classId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'classes', classId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error eliminando clase:', error);
    throw error;
  }
};

export default {
  createOrUpdateClass,
  getClasses,
  getClassById,
  getClassesByDateRange,
  getClassesByTeacher,
  deleteClass,
};