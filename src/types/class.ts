export interface Class {
  id: string;
  fecha: Date | string;
  maestroId: string;
  maestroNombre: string;
  tema: string;
  numVarones: number;
  numTotal: number;
  asistenciaTotalPorcentaje: number;
  ofrendas: number;
  biblias: number;
  anuncios: string;
  registradoPorUserId: string;
  registradoPorNombre: string;
  creadoEn: Date | string;
  actualizadoEn: Date | string;
  notas?: string;
}