import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ref = doc(db, 'settings', 'constellation');

export async function getHidden() {
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().hidden || [] : [];
}
export const saveHidden = (hidden) => setDoc(ref, { hidden }, { merge: true });