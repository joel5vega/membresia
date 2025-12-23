export interface ClassAttendance {
  maestro: string;
  varones: number;
  mujeres: number;
  bebes: number;
  total: number;
  biblias: number;
  ofrendas: number;
}

export interface EconomicReport {
  diezmos: number;
  ofrendas: number;
  ofrendaEspecial: number;
  otros: number;
  total: number;
}

export interface Predicacion {
  pastor: string;
  tema: string;
  textoBiblico: string;
}

export interface DirectorDia {
  fecha: string;
  director: string;
  voces: string;
  ministerio: string;
}

export interface Actividad {
  nombre: string;
  fecha: string;
  hora: string;
  participantes: string;
  responsable: string;
}

export interface SundaySchoolReport {
  logoText?: string;
  logoUrl?: string;
  churchName: string;
  reportTitle: string;
  reportDate: string;
  serviceName: string;
  location: string;
  adultos: ClassAttendance;
  jovCasados: ClassAttendance;
  jovenes: ClassAttendance;
  prejuveniles: ClassAttendance;
  exploradores: ClassAttendance;
  estrellitas: ClassAttendance;
  joyitas: ClassAttendance;
  subtotal: {
    maestros: number;
    varones: number;
    mujeres: number;
    bebes: number;
    total: number;
    biblias: number;
    ofrendas: number;
  };
  numeroVisitas: number;
  asistenciaFinal: number;
  nuevosConvertidos: string;
  hermanosConPermiso: string;
  economico: EconomicReport;
  limpieza: string[];
  predica: Predicacion;
  jueves: DirectorDia;
  domingo1: DirectorDia;
  domingo2: DirectorDia;
  actividades: Actividad[];
  observaciones: string;
}
