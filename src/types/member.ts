// Member types based on IEDB Canaán form

// Genograma
export interface GenogramaPersona {
  key?: number;
  nombre: string;
  relacion: string;
  edad: string;
  viveConElMiembro: boolean;
}

// Family Member Information
export interface FamilyMember {
  id?: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  dateOfBirth?: string;
  inChurch?: boolean;
  notes?: string;
}

// Modelo interno de Firestore (lo que realmente se guarda)
export interface Member {
  id: string;

  // Página 1
  nombreCompleto: string;
  fechaNacimiento?: string;
  celular?: string;
  zona?: string;
  clase?: string;
  sexo?:string;
  // Página 2 - Formación
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

  // Condiciones de habitabilidad
  tipoVivienda?: string;
  materialVivienda?: string;
  numHabitaciones?: number | string;
  numBanos?: number | string;
  numCocinas?: number | string;
  otrosAmbientes?: string;
  condicionHabitabilidad?: string;

  // Página 3 - Salud y familia
  enfermedadCronica?: string;
  estadoCivil?: string;
  padresCreyentes?: string;
  familiaAsiste?: string;
  relacion?: string;
  parejaCristiana?: string;
  nombrePareja?: string;
  numHijos?: string;

  // Genograma
  genograma?: GenogramaPersona[];

  // Página 4 - Información eclesiástica
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

  // Página 5 - Liderazgo
  areasInteres: string[];
  donesEspirituales: string[];
  liderazgo?: string;
  cargoPosible?: string;
  mejorIglesia?: string;
  cambiosIglesia?: string;

  // Metadatos generales
  email?: string;
  address?: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'visitor';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para crear (lo que manda el MemberForm)
// Puedes mantenerlo cercano al shape del form para no hacer mapping extra.
export interface CreateMemberDTO {
  // Página 1
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  celular: string;
  zona: string;
  clase: string;
  correo:string;
  // Página 2
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

  // Página 3
  enfermedadCronica?: string;
  estadoCivil?: string;
  padresCreyentes?: string;
  familiaAsiste?: string;
  relacion?: string;
  parejaCristiana?: string;
  nombrePareja?: string;
  numHijos?: string;
  genograma?: GenogramaPersona[];

  // Página 4
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
  // Página 5
  areasInteres: string[];
  donesEspirituales: string[];
  liderazgo?: string;
  cargoPosible?: string;
  mejorIglesia?: string;
  cambiosIglesia?: string;

  // Metadatos opcionales al crear
  email?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'visitor';
  notes?: string;
    // Photo and Membership Information
  photoUrl?: string;
  baptismDate?: string;
  membershipDate?: string;
  familyRelationships?: FamilyMember[];
}
