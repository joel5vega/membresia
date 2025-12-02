// Member types based on IEDB Canaán form
export interface Member {
  id: string;
  fullName: string; // Nombre Completo
  phone: string; // Celular
  zone: string; // ¿En qué zona vive?
  educationLevel: string; // Nivel máximo de educación alcanzado
  currentlyStudying: boolean; // ¿Actualmente estudia?
  incomeSource: string; // ¿Cómo obtiene sus ingresos?
  profession: string; // ¿Cuál es su profesión u oficio?
  playsInstrument: boolean; // ¿Sabe tocar algún instrumento musical?
  talents: string; // ¿Qué talento o habilidad tiene?
  class: string; // Clase/Curso ("ninos", "adolescentes", "adultos", "padres")
  // Additional fields
  email?: string;
  address?: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'visitor';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemberDTO {
  fullName: string;
  phone: string;
  zone: string;
  educationLevel: string;
  currentlyStudying: boolean;
  incomeSource: string;
  profession: string;
  playsInstrument: boolean;
  talents: string;
  class: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'visitor';
  notes?: string;
}
