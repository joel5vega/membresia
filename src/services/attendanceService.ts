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
  and,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Attendance, CreateAttendanceDTO, AttendanceReport } from '../types';

const ATTENDANCE_COLLECTION = 'attendance';

export const attendanceService = {
  // Create
  async addAttendance(data: CreateAttendanceDTO): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  },

  // Read
  async getAttendance(id: string): Promise<Attendance | null> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Attendance) : null;
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw error;
    }
  },

  async getAttendances(constraints?: QueryConstraint[]): Promise<Attendance[]> {
    try {
      const q = constraints?.length ? query(collection(db, ATTENDANCE_COLLECTION), ...constraints) : collection(db, ATTENDANCE_COLLECTION);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      } as Attendance));
    } catch (error) {
      console.error('Error getting attendances:', error);
      throw error;
    }
  },

  // Get attendance by member and date
  async getAttendanceByMemberAndDate(memberId: string, date: Date): Promise<Attendance | null> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const constraints = [
        where('memberId', '==', memberId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
      ];

      const attendances = await this.getAttendances(constraints);
      return attendances.length > 0 ? attendances[0] : null;
    } catch (error) {
      console.error('Error getting attendance by member and date:', error);
      throw error;
    }
  },

  // Get attendance by class and date
  async getAttendanceByClassAndDate(classValue: string, date: Date): Promise<Attendance[]> {
    try {
      // This will need to be joined with members in the application layer
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const constraints = [
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
              where('className', '==', classValue),
      ];

      return await this.getAttendances(constraints);
    } catch (error) {
      console.error('Error getting attendance by class and date:', error);
      throw error;
    }
  },

  // Update
  async updateAttendance(id: string, data: Partial<Attendance>): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  // Delete
  async deleteAttendance(id: string): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },

  // Get attendance report for a member
  async getAttendanceReport(memberId: string, memberName: string, startDate: Date, endDate: Date): Promise<AttendanceReport> {
    try {
      const constraints = [
        where('memberId', '==', memberId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
      ];

      const attendances = await this.getAttendances(constraints);

      const present = attendances.filter(a => a.status === 'present').length;
      const absent = attendances.filter(a => a.status === 'absent').length;
      const late = attendances.filter(a => a.status === 'late').length;
      const total = attendances.length;

      return {
        memberId,
        memberName,
        totalSundays: total,
        present,
        absent,
        late,
        attendancePercentage: total > 0 ? (present / total) * 100 : 0,
      };
    } catch (error) {
      console.error('Error generating attendance report:', error);
      throw error;
    }
  },
};
