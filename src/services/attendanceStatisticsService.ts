import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  classId: string;
  className: string;
  date: Timestamp | Date;
  status: 'present' | 'absent' | 'justified';
}

export interface ClassStats {
  className: string;
  classId: string;
  totalSessions: number;
  totalAttendances: number;
  totalAbsences: number;
  totalJustified: number;
  attendanceRate: number;
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  totalAttendances: number;
  totalAbsences: number;
  totalJustified: number;
  attendanceRate: number;
}

export interface PeriodStatistics {
  period: string; // 'week' or 'month'
  startDate: Date;
  endDate: Date;
  totalSessions: number;
  classesByName: { [key: string]: ClassStats };
  classesByClass: ClassStats[];
  memberStats: MemberStats[];
  overallAttendanceRate: number;
}

// Helper to get week start and end dates
function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const currentDate = new Date(date);
  const first = currentDate.getDate() - currentDate.getDay();
  const start = new Date(currentDate.setDate(first));
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

// Helper to get month start and end dates
function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Fetch attendance records for a date range
export async function getAttendanceRecords(
  startDate: Date,
  endDate: Date
): Promise<AttendanceRecord[]> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const attendanceCol = collection(db, 'attendance');
        const q = query(
      attendanceCol,
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date', 'desc')
    );
    
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        date: doc.data().date instanceof Timestamp
          ? doc.data().date.toDate()
          : doc.data().date,
        memberName: doc.data().memberName || `Member-${doc.data().memberId}`,
        className: doc.data().className || 'Sin Clase',
      })) as AttendanceRecord[];
          }

 catch (error: unknown) {
      console.error('Error fetching attendance records:', error);
          return [];
            }
              }

// Calculate statistics for classes in a period
function calculateClassStats(records: AttendanceRecord[]): { [key: string]: ClassStats } {
  const classMap: { [key: string]: ClassStats } = {};
  
  records.forEach((record) => {
        console.log('Processing record for class:', record.className, 'All records count:', records.length);
    const key = record.className;
    if (!classMap[key]) {
      classMap[key] = {
        classId: record.classId,
        className: record.className,
        totalSessions: 0,
        totalAttendances: 0,
        totalAbsences: 0,
        totalJustified: 0,
        attendanceRate: 0,
      };
    }
    
    classMap[key].totalSessions++;
    if (record.status === 'present') {
      classMap[key].totalAttendances++;
    } else if (record.status === 'absent') {
      classMap[key].totalAbsences++;
    } else if (record.status === 'justified') {
      classMap[key].totalJustified++;
    }
  });
  
  // Calculate attendance rates
  Object.values(classMap).forEach((stats) => {
    if (stats.totalSessions > 0) {
      stats.attendanceRate = (stats.totalAttendances / stats.totalSessions) * 100;
    }
  });
  
    console.log('Final classMap:', classMap, 'Keys:', Object.keys(classMap));
  return classMap;
}

// Calculate statistics for members in a period
function calculateMemberStats(records: AttendanceRecord[]): MemberStats[] {
  const memberMap: { [key: string]: MemberStats } = {};
  
  records.forEach((record) => {
    const key = record.memberId;
    if (!memberMap[key]) {
      memberMap[key] = {
        memberId: record.memberId,
        memberName: record.memberName,
        totalAttendances: 0,
        totalAbsences: 0,
        totalJustified: 0,
        attendanceRate: 0,
      };
    }
    
    if (record.status === 'present') {
      memberMap[key].totalAttendances++;
    } else if (record.status === 'absent') {
      memberMap[key].totalAbsences++;
    } else if (record.status === 'justified') {
      memberMap[key].totalJustified++;
    }
  });
  
  // Calculate attendance rates and convert to array
  const memberStats = Object.values(memberMap).map((stats) => {
    const total = stats.totalAttendances + stats.totalAbsences + stats.totalJustified;
    if (total > 0) {
      stats.attendanceRate = (stats.totalAttendances / total) * 100;
    }
    return stats;
  });
  
  return memberStats.sort((a, b) => b.attendanceRate - a.attendanceRate);
}

// Get weekly attendance statistics
export async function getWeeklyStatistics(date?: Date): Promise<PeriodStatistics> {
  const { start, end } = getWeekRange(date);
  const records = await getAttendanceRecords(start, end);
  
  const classStatsByClass = calculateClassStats(records);
  let classStatsList = Object.values(classStatsByClass);
  
  // Calculate overall attendance rate
  const totalAttendances = classStatsList.reduce((sum, cs) => sum + cs.totalAttendances, 0);
  const totalSessions = classStatsList.reduce((sum, cs) => sum + cs.totalSessions, 0);
  const overallAttendanceRate = totalSessions > 0 ? (totalAttendances / totalSessions) * 100 : 0;
    const memberStats = calculateMemberStats(records);
  
  return {
    period: 'week',
    startDate: start,
    endDate: end,
    totalSessions,
    classesByName: classStatsByClass,
    classesByClass: classStatsList.sort((a, b) => b.attendanceRate - a.attendanceRate),
    memberStats,
    overallAttendanceRate,
  };
}

// Get monthly attendance statistics
export async function getMonthlyStatistics(date?: Date): Promise<PeriodStatistics> {
  const { start, end } = getMonthRange(date);
  const records = await getAttendanceRecords(start, end);
  
  const classStatsByClass = calculateClassStats(records);
  const classStatsList = Object.values(classStatsByClass);
  const memberStats = calculateMemberStats(records);
  
  // Calculate overall attendance rate
  const totalAttendances = classStatsList.reduce((sum, cs) => sum + cs.totalAttendances, 0);
  const totalSessions = classStatsList.reduce((sum, cs) => sum + cs.totalSessions, 0);
  const overallAttendanceRate = totalSessions > 0 ? (totalAttendances / totalSessions) * 100 : 0;
  
  return {
    period: 'month',
    startDate: start,
    endDate: end,
    totalSessions,
    classesByName: classStatsByClass,
    classesByClass: classStatsList.sort((a, b) => b.attendanceRate - a.attendanceRate),
    memberStats,
    overallAttendanceRate,
  };
}

// Helper to get quarter start and end dates
function getQuarterRange(date: Date = new Date()): { start: Date; end: Date } {
    const currentDate = new Date(date);
  const currentQuarter = Math.floor((currentDate.getMonth()) / 3);
  const start = new Date(currentDate.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0);
  const end = new Date(currentDate.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
  return { start, end };
}

// Helper to get year start and end dates
function getYearRange(date: Date = new Date()): { start: Date; end: Date } {
    const currentDate = new Date(date);
  const start = new Date(currentDate.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

// Get quarterly attendance statistics
export async function getQuarterlyStatistics(date?: Date): Promise<PeriodStatistics> {
  const { start, end } = getQuarterRange(date);
  const records = await getAttendanceRecords(start, end);

  const classStatsByClass = calculateClassStats(records);
  const classStatsList = Object.values(classStatsByClass);
  const memberStats = calculateMemberStats(records);

  // Calculate overall attendance rate
  const totalAttendances = classStatsList.reduce((sum, cs) => sum + cs.totalAttendances, 0);
  const totalSessions = classStatsList.reduce((sum, cs) => sum + cs.totalSessions, 0);
  const overallAttendanceRate = totalSessions > 0 ? (totalAttendances / totalSessions) * 100 : 0;

  return {
    period: 'quarter',
    startDate: start,
    endDate: end,
    totalSessions,
    classesByName: classStatsByClass,
    classesByClass: classStatsList.sort((a, b) => b.attendanceRate - a.attendanceRate),
    memberStats,
    overallAttendanceRate,
  };
}

// Get yearly attendance statistics
export async function getYearlyStatistics(date?: Date): Promise<PeriodStatistics> {
  const { start, end } = getYearRange(date);
  const records = await getAttendanceRecords(start, end);

  const classStatsByClass = calculateClassStats(records);
  const classStatsList = Object.values(classStatsByClass);
  const memberStats = calculateMemberStats(records);

  // Calculate overall attendance rate
  const totalAttendances = classStatsList.reduce((sum, cs) => sum + cs.totalAttendances, 0);
  const totalSessions = classStatsList.reduce((sum, cs) => sum + cs.totalSessions, 0);
  const overallAttendanceRate = totalSessions > 0 ? (totalAttendances / totalSessions) * 100 : 0;

  return {
    period: 'year',
    startDate: start,
    endDate: end,
    totalSessions,
    classesByName: classStatsByClass,
    classesByClass: classStatsList.sort((a, b) => b.attendanceRate - a.attendanceRate),
    memberStats,
    overallAttendanceRate,
  };
}
