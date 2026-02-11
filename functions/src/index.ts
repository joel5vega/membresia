import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const membersBaseQuery = () => db.collection("members");

// ---------- getMembersFiltered (la de siempre) ----------
export const getMembersFiltered = onCall(async (request) => {
  const { filters } = request.data as { filters?: Record<string, any> };

  let query: FirebaseFirestore.Query = membersBaseQuery();

  if (filters) {
    Object.entries(filters).forEach(([field, value]) => {
      query = query.where(field, "==", value);
    });
  }

  const snapshot = await query
    .select(
      "apellido",
      "bautizado",
      "clase",
      "correo",
      "estadoCivil",
      "fechaNacimiento",
      "nombre",
      "zona",
      "profesion",
      "discipulado",
      "sexo",
      "photoUrl"
    )
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
});

// ---------- auxiliar edad ----------
function calcularEdadDesdeFecha(fecha: any): number | null {
  if (!fecha) return null;

  let date: Date;
  if (fecha.toDate) {
    date = fecha.toDate();
  } else {
    date = new Date(fecha);
    if (isNaN(date.getTime())) return null;
  }

  const hoy = new Date();
  let edad = hoy.getFullYear() - date.getFullYear();
  const m = hoy.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < date.getDate())) {
    edad--;
  }
  return edad;
}

// ---------- ageStatsByDecade ahora como callable ----------
export const ageStatsByDecade = onCall(async (request) => {
  const snapshot = await membersBaseQuery().get();

  const stats: Record<string, number> = {};
  let withoutBirthdate = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const edad = calcularEdadDesdeFecha(data.fechaNacimiento);

    if (edad == null || edad < 0) {
      withoutBirthdate++;
      return;
    }

    const decadeStart = Math.floor(edad / 10) * 10;
    const label = `${decadeStart}-${decadeStart + 9}`;
    stats[label] = (stats[label] ?? 0) + 1;
  });

  const result = Object.entries(stats)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([decade, count]) => ({ decade, count }));

  const totalWithBirthdate = result.reduce((s, d) => s + d.count, 0);

  return {
    byDecade: result,
    totalWithBirthdate,
    totalWithoutBirthdate: withoutBirthdate,
    generatedAt: new Date().toISOString(),
  };
});
