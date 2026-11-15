// types/member.ts

export interface GenogramaPersona {
  key?: number;
  nombre: string;
  relacion: string;
  edad: string;
  viveConElMiembro: boolean;
}

export interface FamilyMember {
  id?: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  dateOfBirth?: string;
  inChurch?: boolean;
  notes?: string;
}

// ✅ Modelo REAL de Firestore (lo que tus docs tienen)
export interface Member {
  id: string;

  // Campos básicos (los que SÍ existen en Firestore)
  nombre?: string;
  apellido?: string;
  nombreCompleto?: string;   // opcional, se puede derivar
  fechaNacimiento?: string;
  celular?: string;
  zona?: string;
  clase?: string;
  sexo?: 'M' | 'F' | string;
  correo?: string;
  email?: string;
  address?: string;

  // ✅ Foto — el campo clave para lo que querés
  photoUrl?: string;

  // Formación
  nivelEducacion?: string;
  estudiaActualmente?: string;
  ingresos?: string;
  profesion?: string;
  instrumento?: string;
  talentosHabilidades?: string;

  // Situación económica
  ingresoDescripcion?: string;
  ingresoMonto?: number | string;
  egresoMonto?: number | string;

  // Habitabilidad
  tipoVivienda?: string;
  materialVivienda?: string;
  numHabitaciones?: number | string;
  numBanos?: number | string;
  numCocinas?: number | string;
  otrosAmbientes?: string;
  condicionHabitabilidad?: string;

  // Salud y familia
  enfermedadCronica?: string;
  estadoCivil?: string;
  padresCreyentes?: string;
  familiaAsiste?: string;
  relacion?: string;
  parejaCristiana?: string;
  nombrePareja?: string;
  numHijos?: string;
  genograma?: GenogramaPersona[];

  // Info eclesiástica
  aniosIglesia?: string;
  bautizado?: string;
  salvo?: string;
  aniosCristiano?: string;
  familia2doGrado?: string;
  escuelaDominical?: string;
  discipulado?: string;
  formacionTeologica?: string;
  estudiosBiblicos?: string;
  seminario?: string;
  iglesiaProcedencia?: string;
  tiempoConversion?: number | string;
  ministerios?: string;

  // Liderazgo
  areasInteres?: string[];
  donesEspirituales?: string[];
  liderazgo?: string;
  cargoPosible?: string;
  mejorIglesia?: string;
  cambiosIglesia?: string;

  // Metadatos
  joinDate?: Date | any;
  status?: 'active' | 'inactive' | 'visitor';
  notes?: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;

  // Extras
  baptismDate?: string;
  membershipDate?: string;
  familyRelationships?: FamilyMember[];
}

export interface CreateMemberDTO {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  celular: string;
  zona: string;
  clase: string;
  correo: string;
  sexo?: string;          // ← agrégalo, lo usás en la lista

  // ✅ Foto
  photoUrl?: string;

  // ... el resto igual que ya tenías
  nivelEducacion?: string;
  estudiaActualmente?: string;
  ingresos?: string;
  profesion?: string;
  instrumento?: string;
  talentosHabilidades?: string;
  ingresoDescripcion?: string;
  ingresoMonto?: number | string;
  egresoMonto?: number | string;
  tipoVivienda?: string;
  materialVivienda?: string;
  numHabitaciones?: number | string;
  numBanos?: number | string;
  numCocinas?: number | string;
  otrosAmbientes?: string;
  condicionHabitabilidad?: string;
  enfermedadCronica?: string;
  estadoCivil?: string;
  padresCreyentes?: string;
  familiaAsiste?: string;
  relacion?: string;
  parejaCristiana?: string;
  nombrePareja?: string;
  numHijos?: string;
  genograma?: GenogramaPersona[];
  aniosIglesia?: string;
  bautizado?: string;
  salvo?: string;
  aniosCristiano?: string;
  familia2doGrado?: string;
  escuelaDominical?: string;
  discipulado?: string;
  formacionTeologica?: string;
  estudiosBiblicos?: string;
  seminario?: string;
  iglesiaProcedencia?: string;
  tiempoConversion?: number | string;
  ministerios?: string;
  notasFamilia?: string;
  areasInteres: string[];
  donesEspirituales: string[];
  liderazgo?: string;
  cargoPosible?: string;
  mejorIglesia?: string;
  cambiosIglesia?: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'visitor';
  notes?: string;
  baptismDate?: string;
  membershipDate?: string;
  familyRelationships?: FamilyMember[];
}