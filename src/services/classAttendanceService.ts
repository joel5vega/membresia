import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { ClassAttendance } from '../types';

const CLASS_ATTENDANCE_COLLECTION = 'classAttendance';

// Crear registro de asistencia
export const createClassAttendance = async (attendance: Omit<ClassAttendance, 'id'>): Promise<string> => {
  try {
    const attendanceRef = collection(db, CLASS_ATTENDANCE_COLLECTION);
    const newAttendance = {
      ...attendance,
      fechaRegistro: Timestamp.now(),
    };
    const docRef = await addDoc(attendanceRef, newAttendance);
    return docRef.id;
  } catch (error) {
    console.error('Error creando asistencia de clase:', error);
    throw error;
  }
};

// Obtener asistencia de una clase
export const getClassAttendance = async (classId: string): Promise<ClassAttendance[]> => {
  try {
    const attendanceCol = collection(db, CLASS_ATTENDANCE_COLLECTION);
    const q = query(attendanceCol, where('classId', '==', classId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ClassAttendance));
  } catch (error) {
    console.error('Error obteniendo asistencia de clase:', error);
    throw error;
  }
};

// Obtener asistencia de un miembro en una clase específica
export const getMemberClassAttendance = async (classId: string, memberId: string): Promise<ClassAttendance | null> => {
  try {
    const attendanceCol = collection(db, CLASS_ATTENDANCE_COLLECTION);
    const q = query(
      attendanceCol,
      where('classId', '==', classId),
      where('memberId', '==', memberId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as ClassAttendance;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo asistencia del miembro:', error);
    throw error;
  }
};

// Actualizar asistencia
export const updateClassAttendance = async (attendanceId: string, updates: Partial<ClassAttendance>): Promise<void> => {
  try {
    const docRef = doc(db, CLASS_ATTENDANCE_COLLECTION, attendanceId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error actualizando asistencia:', error);
    throw error;
  }
};

// Crear múltiples registros de asistencia para una clase
export const createBatchClassAttendance = async (attendances: Omit<ClassAttendance, 'id'>[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const attendanceRef = collection(db, CLASS_ATTENDANCE_COLLECTION);
    
    for (const attendance of attendances) {
      const newDoc = doc(attendanceRef);
      batch.set(newDoc, {
        ...attendance,
        fechaRegistro: Timestamp.now(),
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error creando lote de asistencia:', error);
    throw error;
  }
};

// Obtener asistencia de un miembro en un rango de fechas
export const getMemberAttendanceByDateRange = async (memberId: string, startDate: Date, endDate: Date): Promise<ClassAttendance[]> => {
  try {
    const attendanceCol = collection(db, CLASS_ATTENDANCE_COLLECTION);
    const q = query(
      attendanceCol,
      where('memberId', '==', memberId),
      where('fechaRegistro', '>=', Timestamp.fromDate(startDate)),
      where('fechaRegistro', '<=', Timestamp.fromDate(endDate))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ClassAttendance));
  } catch (error) {
    console.error('Error obteniendo asistencia del miembro por fecha:', error);
    throw error;
  }
};

// Eliminar registro de asistencia
export const deleteClassAttendance = async (attendanceId: string): Promise<void> => {
  try {
    const docRef = doc(db, CLASS_ATTENDANCE_COLLECTION, attendanceId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error eliminando asistencia:', error);
    throw error;
  }
};

export default {
  createClassAttendance,
  getClassAttendance,
  getMemberClassAttendance,
  updateClassAttendance,
  createBatchClassAttendance,
  getMemberAttendanceByDateRange,
  deleteClassAttendance,
};