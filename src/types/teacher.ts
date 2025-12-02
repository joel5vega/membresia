export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  specialties: string[]; // Áreas de enseñanza
  yearsExperience: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeacherDTO {
  fullName: string;
  phone: string;
  email?: string;
  specialties: string[];
  yearsExperience: number;
  notes?: string;
}
