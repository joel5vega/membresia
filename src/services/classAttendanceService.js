import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig.ts';

const DEFAULT_CHURCH_ID = 'IEDB_Canaan';

const getAsistenciasCollection = (churchId = DEFAULT_CHURCH_ID) =>
  collection(db, 'iglesias', churchId, 'asistencias');

export const classAttendanceService = {
  // Create
  async addAttendance(data, churchId) {
    try {
      const colRef = getAsistenciasCollection(churchId);
      const docRef = await addDoc(colRef, data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  },

  // Read: por mes
  async getAttendanceByMonth(periodoMes, churchId) {
    try {
      const colRef = getAsistenciasCollection(churchId);
      const qRef = query(
        colRef,
        where('periodo_mes', '==', periodoMes),
        orderBy('fecha', 'asc')
      );
      const snap = await getDocs(qRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting attendance by month:', error);
      throw error;
    }
  },

  // Update
  async updateAttendance(id, data, churchId) {
    try {
      const colRef = getAsistenciasCollection(churchId);
      const docRef = doc(colRef, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  // Delete
  async deleteAttendance(id, churchId) {
    try {
      const colRef = getAsistenciasCollection(churchId);
      const docRef = doc(colRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },

    // Create batch
  async createBatchClassAttendance(attendanceRecords, churchId) {
    try {
      const colRef = getAsistenciasCollection(churchId);
      const promises = attendanceRecords.map(record => addDoc(colRef, record));
      const results = await Promise.all(promises);
      return results.map((docRef, index) => ({ id: docRef.id, ...attendanceRecords[index] }));
    } catch (error) {
      console.error('Error creating batch attendance:', error);
      throw error;
    }
  },
  // Get class attendance (for history view)
  async getClassAttendance(churchId = DEFAULT_CHURCH_ID) {
    try {
      const colRef = getAsistenciasCollection(churchId);
      const qRef = query(colRef, orderBy('fecha', 'desc'));
      const snapshot = await getDocs(qRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting class attendance:', error);
      throw error;
    }
  },

};

// Export as named export for direct import
export const getClassAttendance = classAttendanceService.getClassAttendance.bind(classAttendanceService);
export const createBatchClassAttendance = classAttendanceService.createBatchClassAttendance.bind(classAttendanceService);
