import { Member } from '../types';

/**
 * Converts a Firestore member document to a form data object
 * for use in React components. Provides fallback values for null/undefined fields.
 */
export function dbMemberToFormData(member: any): any {
  return {
    // Personal Information
    nombre: member.nombre || '',
    apellido: member.apellido || '',
    ci: member.ci || '',
    sexo: member.sexo || '',
    celular: member.celular || '',
    correo: member.correo || '',
    zona: member.zona || '',
    fechaNacimiento: member.fechaNacimiento || '',

    // Education & Employment
    nivelEducacion: member.nivelEducacion || '',
    estudiaActualmente: member.estudiaActualmente || '',
    profesion: member.profesion || '',
    ingresos: member.ingresos || '',
    ingresoMonto: member.ingresoMonto || '',
    ingresoDescripcion: member.ingresoDescripcion || '',
    egresoMonto: member.egresoMonto || '',

    // Housing
    tipoVivienda: member.tipoVivienda || '',
    materialVivienda: member.materialVivienda || '',
    numHabitaciones: member.numHabitaciones || '',
    numBanos: member.numBanos || '',
    numCocinas: member.numCocinas || '',
    otrosAmbientes: member.otrosAmbientes || '',
    condicionHabitabilidad: member.condicionHabitabilidad || '',

    // Health
    enfermedadCronica: member.enfermedadCronica || '',

    // Marital & Family
    estadoCivil: member.estadoCivil || '',
    padresCreyentes: member.padresCreyentes || '',
    familiaAsiste: member.familiaAsiste || '',
    relacion: member.relacion || '',
    parejaCristiana: member.parejaCristiana || '',
    nombrePareja: member.nombrePareja || '',
    numHijos: member.numHijos || '',
    notasFamilia: member.notasFamilia || '',
    genograma: member.genograma || [
      { nombre: '', relacion: '', edad: '', viveConElMiembro: false },
    ],
    familia2doGrado: member.familia2doGrado || '',

    // Spiritual Journey
    aniosIglesia: member.aniosIglesia || '',
    bautizado: member.bautizado || '',
    salvo: member.salvo || '',
    aniosCristiano: member.aniosCristiano || '',
    escuelaDominical: member.escuelaDominical || '',
    discipulado: member.discipulado || '',
    formacionTeologica: member.formacionTeologica || '',
    estudiosBiblicos: member.estudiosBiblicos || '',
    seminario: member.seminario || '',
    tiempoConversion: member.tiempoConversion || '',

    // Ministry & Gifts
    clase: member.clase || '',
    cargos: member.cargos || '',
    ministerios: member.ministerios || '',
    areasInteres: member.areasInteres || [],
    donesEspirituales: member.donesEspirituales || [],
    liderazgo: member.liderazgo || '',
    cargoPosible: member.cargoPosible || '',
    talentosHabilidades: member.talentosHabilidades || '',
    instrumento: member.instrumento || '',

    // Church History
    iglesiaProcedencia: member.iglesiaProcedencia || '',
    mejorIglesia: member.mejorIglesia || '',
    cambiosIglesia: member.cambiosIglesia || '',
  };
}
