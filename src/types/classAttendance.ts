export interface ClassAttendance {
  id: string;
  classId: string;
  memberId: string;
  memberName: string;
  presente: boolean;
  fechaRegistro: Date | string;
  observaciones?: string;
}