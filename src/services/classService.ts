// src/services/classService.ts
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Interfaces
export interface Class {
  id?: string;
  name: string;
  date: Timestamp;
  instructor: string;
  maxParticipants?: number;
  attendedCount: number;
  description?: string;
}

export interface AttendanceRecord {
  id?: string;
  memberId: string;
  attended: boolean;
  attendedAt?: Timestamp;
}

// Funciones para Clases
export const getClasses = async (): Promise<Class[]> => {
  const classesCol = collection(db, 'classes');
  const classSnapshot = await getDocs(classesCol);
  return classSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Class }));
};

export const getClass = async (classId: string): Promise<Class | null> => {
  const classDocRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classDocRef);
  if (classSnap.exists()) {
    return { id: classSnap.id, ...classSnap.data() as Class };
  }
  return null;
};

export const addClass = async (classData: Omit<Class, 'id' | 'attendedCount'>): Promise<string> => {
  const classesCol = collection(db, 'classes');
  const newClassRef = await addDoc(classesCol, { ...classData, attendedCount: 0 });
  return newClassRef.id;
};

// Funciones para Asistencia
export const getAttendanceForClass = async (classId: string): Promise<AttendanceRecord[]> => {
  const attendanceCol = collection(db, 'classes', classId, 'attendance');
  const attendanceSnapshot = await getDocs(attendanceCol);
  return attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as AttendanceRecord }));
};

export const getMemberAttendanceInClass = async (classId: string, memberId: string): Promise<AttendanceRecord | null> => {
  const attendanceDocRef = doc(db, 'classes', classId, 'attendance', memberId);
  const attendanceSnap = await getDoc(attendanceDocRef);
  if (attendanceSnap.exists()) {
    return { id: attendanceSnap.id, ...attendanceSnap.data() as AttendanceRecord };
  }
  return null;
};

export const createOrUpdateAttendance = async (classId: string, memberId: string, attended: boolean): Promise<void> => {
  const attendanceDocRef = doc(db, 'classes', classId, 'attendance', memberId);
  await updateDoc(attendanceDocRef, {
    memberId: memberId,
    attended: attended,
    attendedAt: Timestamp.now(),
  });
};

export const classService = {
  getClasses,
  getClass,
  addClass,
  getAttendanceForClass,
  getMemberAttendanceInClass,
  createOrUpdateAttendance
};
