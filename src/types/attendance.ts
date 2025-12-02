export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Attendance {
  id: string;
  memberId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttendanceDTO {
  memberId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceReport {
  memberId: string;
  memberName: string;
  totalSundays: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
}
