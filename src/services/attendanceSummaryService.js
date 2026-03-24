import {
  collection, query, where, getDocs, getDoc,
  doc, addDoc, updateDoc, Timestamp, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ─── LECTURA: asistencia individual por fecha (original intacta) ──────────────
export async function getAttendanceSummaryByDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  const startOfDay = Timestamp.fromDate(new Date(year, month - 1, day, 0, 0, 0));
  const endOfDay   = Timestamp.fromDate(new Date(year, month - 1, day, 23, 59, 59));

  const q = query(
    collection(db, 'attendance'),
    where('date', '>=', startOfDay),
    where('date', '<=', endOfDay)
  );

  const snapshot = await getDocs(q);
  const summaryMap = {};

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.status !== 'present') continue;

    const className = data.className || 'SIN_CLASE';
    const memberId  = data.memberId;

    if (!summaryMap[className]) {
      summaryMap[className] = { total: 0, men: 0, women: 0 };
    }

    try {
      const memberDoc = await getDoc(doc(db, 'members', memberId));
      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        const sexo = (memberData.sexo || '').toUpperCase();

        summaryMap[className].total += 1;
        if (sexo === 'M')      summaryMap[className].men   += 1;
        else if (sexo === 'F') summaryMap[className].women += 1;
      }
    } catch (err) {
      console.error(`Error al obtener miembro ${memberId}:`, err);
    }
  }

  return Object.entries(summaryMap).map(([className, stats]) => ({
    classId: className,
    ...stats,
  }));
}

// ─── HELPER: buscar documento existente ──────────────────────────────────────
const findExisting = async (conditions) => {
  const constraints = conditions.map(([field, value]) => where(field, '==', value));
  const q = query(collection(db, 'asistencias_totales'), ...constraints);
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ─── ESCRITURA: class_summary ─────────────────────────────────────────────────
export const saveClassSummary = async (data) => {
  const { date, uniqueClassId } = data;

  // Garantizar que todos los campos numéricos sean NUMBER
  const varones    = Number(data.varones)    || 0;
  const mujeres    = Number(data.mujeres)    || 0;
  const visitantes = Number(data.visitantes) || 0;
  const biblia     = Number(data.biblia)     || 0;

  const payload = {
    recordType:    'class_summary',
    date,
    clase:         data.clase,
    uniqueClassId,
    maestro:       data.maestro  || '',
    tema:          data.tema     || '',
    ofrenda:       data.ofrenda  || '',
    anuncios:      data.anuncios || '',
    varones,
    mujeres,
    visitantes,
    biblia,
    total:         varones + mujeres + visitantes,
    updatedAt:     serverTimestamp(),
  };

  const existing = await findExisting([
    ['recordType',    'class_summary'],
    ['date',          date],
    ['uniqueClassId', uniqueClassId],
  ]);

  if (existing) {
    await updateDoc(doc(db, 'asistencias_totales', existing.id), payload);
    return { id: existing.id, updated: true };
  }

  payload.createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, 'asistencias_totales'), payload);
  return { id: ref.id, updated: false };
};

// ─── LECTURA: class_summary ───────────────────────────────────────────────────
export const getClassSummary = async (date, uniqueClassId) => {
  return findExisting([
    ['recordType',    'class_summary'],
    ['date',          date],
    ['uniqueClassId', uniqueClassId],
  ]);
};

// ─── ESCRITURA: general_summary ───────────────────────────────────────────────
export const saveGeneralSummary = async (data) => {
  const { date } = data;

  const varones    = Number(data.total_varones_general)    || 0;
  const mujeres    = Number(data.total_mujeres_general)    || 0;
  const visitantes = Number(data.total_visitantes_general) || 0;
  const biblias    = Number(data.total_biblias_general)    || 0;

  const payload = {
    recordType:               'general_summary',
    date,
    predicador:               data.predicador      || '',
    tema_general:             data.tema_general    || '',
    total_varones_general:    varones,
    total_mujeres_general:    mujeres,
    total_visitantes_general: visitantes,
    total_overall:            varones + mujeres + visitantes,
    total_biblias_general:    biblias,
    ofrenda_general:          data.ofrenda_general || '',
    notas:                    data.notas           || '',
    updatedAt:                serverTimestamp(),
  };

  const existing = await findExisting([
    ['recordType', 'general_summary'],
    ['date',       date],
  ]);

  if (existing) {
    await updateDoc(doc(db, 'asistencias_totales', existing.id), payload);
    return { id: existing.id, updated: true };
  }

  payload.createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, 'asistencias_totales'), payload);
  return { id: ref.id, updated: false };
};

// ─── LECTURA: general_summary ─────────────────────────────────────────────────
export const getGeneralSummary = async (date) => {
  return findExisting([
    ['recordType', 'general_summary'],
    ['date',       date],
  ]);
};