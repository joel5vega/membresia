import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getMembersFiltered = onCall(async (request) => {
  const { filters } = request.data;
  
  let query = admin.firestore().collection("members");
  
  if (filters) {
    Object.entries(filters).forEach(([field, value]) => {
      query = query.where(field, "==", value) as any;
    });
  }
  
  const snapshot = await query.select(
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
  ).get();
  
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
});
