// src/services/firestoreInit.js

import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config'; // Ajusta la ruta según tu configuración

/**
 * Crea datos de ejemplo para miembros de la iglesia
 */
export async function createSampleMembers() {
  console.log('Creando miembros de ejemplo...');
  
  const members = [
    {
      id: 'member_001',
      firstName: 'Juan',
      lastName: 'Pérez García',
      fullName: 'Juan Pérez García',
      gender: 'M',
      birthDate: Timestamp.fromDate(new Date('1985-03-15')),
      civilStatus: 'Casado(a)',
      phone: '+591 70123456',
      email: 'juan.perez@ejemplo.com',
      address: 'Av. Busch #123, La Paz',
      baptismDate: Timestamp.fromDate(new Date('2010-06-20')),
      conversionDate: Timestamp.fromDate(new Date('2009-12-25')),
      membershipStatus: 'activo',
      kardexSummary: {
        totalEntries: 0,
        lastUpdate: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'member_002',
      firstName: 'María',
      lastName: 'Quispe Mamani',
      fullName: 'María Quispe Mamani',
      gender: 'F',
      birthDate: Timestamp.fromDate(new Date('1990-07-22')),
      civilStatus: 'Soltera(o)',
      phone: '+591 71234567',
      email: 'maria.quispe@ejemplo.com',
      address: 'Calle Murillo #456, La Paz',
      baptismDate: Timestamp.fromDate(new Date('2015-08-15')),
      conversionDate: Timestamp.fromDate(new Date('2014-11-10')),
      membershipStatus: 'activo',
      kardexSummary: {
        totalEntries: 0,
        lastUpdate: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'member_003',
      firstName: 'Carlos',
      lastName: 'Martínez Flores',
      fullName: 'Carlos Martínez Flores',
      gender: 'M',
      birthDate: Timestamp.fromDate(new Date('2002-11-05')),
      civilStatus: 'Soltero(a)',
      phone: '+591 72345678',
      email: 'carlos.martinez@ejemplo.com',
      address: 'Zona Sur, Calle 21 #789, La Paz',
      baptismDate: Timestamp.fromDate(new Date('2020-01-12')),
      conversionDate: Timestamp.fromDate(new Date('2019-05-18')),
      membershipStatus: 'activo',
      kardexSummary: {
        totalEntries: 0,
        lastUpdate: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'member_004',
      firstName: 'Ana',
      lastName: 'Condori López',
      fullName: 'Ana Condori López',
      gender: 'F',
      birthDate: Timestamp.fromDate(new Date('1978-09-30')),
      civilStatus: 'Casada(o)',
      phone: '+591 73456789',
      email: 'ana.condori@ejemplo.com',
      address: 'Villa Fátima, Calle 5 #234, La Paz',
      baptismDate: Timestamp.fromDate(new Date('2005-04-10')),
      conversionDate: Timestamp.fromDate(new Date('2004-12-24')),
      membershipStatus: 'activo',
      kardexSummary: {
        totalEntries: 0,
        lastUpdate: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  // Crear documentos en Firestore
  for (const member of members) {
    const memberRef = doc(db, 'members', member.id);
    await setDoc(memberRef, member);
    console.log(`✓ Miembro creado: ${member.fullName}`);
  }

  return members;
}

/**
 * Crea clases de escuela dominical
 * Emanuel y Shaddai son dos clases independientes del grupo adultos
 */
export async function createSampleClasses() {
  console.log('Creando clases de escuela dominical...');

  const classes = [
    {
      id: 'emanuel',
      name: 'Emanuel',
      ageGroup: 'adultos',
      teachers: ['Pastor Miguel'],
      active: true,
      createdAt: serverTimestamp()
    },
    {
      id: 'shaddai',
      name: 'Shaddai',
      ageGroup: 'adultos',
      teachers: ['Hermana Rosa'],
      active: true,
      createdAt: serverTimestamp()
    },
    {
      id: 'juveniles',
      name: 'Juveniles',
      ageGroup: 'juveniles',
      teachers: ['Pastor Roberto'],
      active: true,
      createdAt: serverTimestamp()
    },
    {
      id: 'ninos',
      name: 'Niños',
      ageGroup: 'ninos',
      teachers: ['Hermana Ana', 'Hermana Lucía'],
      active: true,
      createdAt: serverTimestamp()
    }
  ];

  for (const classData of classes) {
    const classRef = doc(db, 'classes', classData.id);
    await setDoc(classRef, classData);
    console.log(`✓ Clase creada: ${classData.name} (${classData.ageGroup})`);
  }

  return classes;
}

/**
 * Crea sesiones de ejemplo para las clases Emanuel y Shaddai
 */
export async function createSampleSessions() {
  console.log('Creando sesiones de ejemplo...');

  const sessions = [
    {
      classId: 'emanuel',
      date: Timestamp.fromDate(new Date('2025-11-24')),
      topic: 'El fruto del Espíritu: Amor y Gozo',
      teacherId: 'Pastor Miguel',
      notes: 'Clase con mucha participación. Se usó Gálatas 5:22-23',
      createdAt: serverTimestamp()
    },
    {
      classId: 'shaddai',
      date: Timestamp.fromDate(new Date('2025-11-24')),
      topic: 'La oración eficaz del justo',
      teacherId: 'Hermana Rosa',
      notes: 'Estudio profundo de Santiago 5:16',
      createdAt: serverTimestamp()
    }
  ];

  const sessionIds = [];
  for (const sessionData of sessions) {
    const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
    sessionIds.push({ id: sessionRef.id, classId: sessionData.classId });
    console.log(`✓ Sesión creada para clase ${sessionData.classId}: ${sessionRef.id}`);
  }

  return sessionIds;
}

/**
 * Crea registros de asistencia para las sesiones
 */
export async function createSampleAttendances(sessions) {
  console.log('Creando registros de asistencia...');

  // Asistencias para clase Emanuel
  const emanuelAttendances = [
    {
      memberId: 'member_001',
      classId: 'emanuel',
      date: Timestamp.fromDate(new Date('2025-11-24')),
      status: 'present',
      notes: '',
      checkedBy: 'admin_user_id',
      createdAt: serverTimestamp()
    },
    {
      memberId: 'member_002',
      classId: 'emanuel',
      date: Timestamp.fromDate(new Date('2025-11-24')),
      status: 'present',
      notes: '',
      checkedBy: 'admin_user_id',
      createdAt: serverTimestamp()
    }
  ];

  // Asistencias para clase Shaddai
  const shaddaiAttendances = [
    {
      memberId: 'member_003',
      classId: 'shaddai',
      date: Timestamp.fromDate(new Date('2025-11-24')),
      status: 'absent',
      notes: 'Viaje familiar',
      checkedBy: 'admin_user_id',
      createdAt: serverTimestamp()
    },
    {
      memberId: 'member_004',
      classId: 'shaddai',
      date: Timestamp.fromDate(new Date('2025-11-24')),
      status: 'present',
      notes: '',
      checkedBy: 'admin_user_id',
      createdAt: serverTimestamp()
    }
  ];

  // Crear asistencias para Emanuel
  const emanuelSession = sessions.find(s => s.classId === 'emanuel');
  for (const attendance of emanuelAttendances) {
    await addDoc(collection(db, 'sessions', emanuelSession.id, 'attendances'), attendance);
  }
  console.log(`✓ ${emanuelAttendances.length} asistencias creadas para Emanuel`);

  // Crear asistencias para Shaddai
  const shaddaiSession = sessions.find(s => s.classId === 'shaddai');
  for (const attendance of shaddaiAttendances) {
    await addDoc(collection(db, 'sessions', shaddaiSession.id, 'attendances'), attendance);
  }
  console.log(`✓ ${shaddaiAttendances.length} asistencias creadas para Shaddai`);
}

/**
 * Crea registros kardex de ejemplo
 */
export async function createSampleKardexEntries() {
  console.log('Creando entradas de kardex de ejemplo...');

  const kardexEntries = [
    {
      memberId: 'member_001',
      entry: {
        date: Timestamp.fromDate(new Date('2025-01-15')),
        type: 'servicio',
        description: 'Participó como líder de alabanza en el culto dominical',
        observations: 'Excelente disposición para servir',
        createdBy: 'admin_user_id',
        createdAt: serverTimestamp()
      }
    },
    {
      memberId: 'member_002',
      entry: {
        date: Timestamp.fromDate(new Date('2025-02-10')),
        type: 'notaPastoral',
        description: 'Visitada por enfermedad. Se oró por su recuperación',
        observations: 'Familia necesita apoyo continuo',
        createdBy: 'admin_user_id',
        createdAt: serverTimestamp()
      }
    }
  ];

  for (const { memberId, entry } of kardexEntries) {
    await addDoc(collection(db, 'members', memberId, 'kardexEntries'), entry);
    console.log(`✓ Entrada kardex creada para ${memberId}`);
  }
}

/**
 * Función principal: Inicializa toda la estructura de datos
 */
export async function initializeFirestoreData() {
  try {
    console.log('🚀 Iniciando creación de datos en Firestore...\n');

    // 1. Crear miembros
    await createSampleMembers();
    console.log('');

    // 2. Crear clases (Emanuel, Shaddai, Juveniles, Niños)
    await createSampleClasses();
    console.log('');

    // 3. Crear sesiones para Emanuel y Shaddai
    const sessions = await createSampleSessions();
    console.log('');

    // 4. Crear asistencias para ambas sesiones
    await createSampleAttendances(sessions);
    console.log('');

    // 5. Crear entradas kardex
    await createSampleKardexEntries();
    console.log('');

    console.log('✅ Inicialización completada exitosamente!');
    console.log('\nResumen:');
    console.log('- 4 miembros creados');
    console.log('- 4 clases creadas (Emanuel, Shaddai, Juveniles, Niños)');
    console.log('- 2 sesiones creadas (Emanuel y Shaddai)');
    console.log('- 4 registros de asistencia creados');
    console.log('- 2 entradas kardex creadas');

  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
    throw error;
  }
}
