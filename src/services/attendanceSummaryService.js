import { collection, query, where, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function getAttendanceSummaryByDate(dateString) {
  // Convertir el string de fecha a rango de Timestamps
  const [year, month, day] = dateString.split('-').map(Number);
  
  const startOfDay = Timestamp.fromDate(new Date(year, month - 1, day, 0, 0, 0));
  const endOfDay = Timestamp.fromDate(new Date(year, month - 1, day, 23, 59, 59));

  const q = query(
    collection(db, 'attendance'),
    where('date', '>=', startOfDay),
    where('date', '<=', endOfDay)
  );

  const snapshot = await getDocs(q);

  // Agrupar por clase y contar género
  const summaryMap = {};

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    
    // Solo contar si el status es "present"
    if (data.status !== 'present') continue;

    const className = data.className || 'SIN_CLASE';
    const memberId = data.memberId;

    // Inicializar contadores para esta clase si no existen
    if (!summaryMap[className]) {
      summaryMap[className] = { total: 0, men: 0, women: 0 };
    }

    // Obtener el género del miembro desde la colección members
    try {
      const memberDoc = await getDoc(doc(db, 'members', memberId));
      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        const sexo = (memberData.sexo || '').toUpperCase();

        summaryMap[className].total += 1;
        
        if (sexo === 'M') {
          summaryMap[className].men += 1;
        } else if (sexo === 'F') {
          summaryMap[className].women += 1;
        }
      }
    } catch (err) {
      console.error(`Error al obtener miembro ${memberId}:`, err);
    }
  }

  // Convertir el mapa a un array de objetos
  return Object.entries(summaryMap).map(([className, stats]) => ({
    classId: className,
    ...stats,
  }));
}