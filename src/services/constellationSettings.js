import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ref = doc(db, 'settings', 'constellation');
const read = async () => ((await getDoc(ref)).data() || {});

export const getHidden = async () => (await read()).hidden || [];
export const saveHidden = (hidden) => setDoc(ref, { hidden }, { merge: true });

/** { "nombre normalizado": 'fallecido' | 'no-asiste' } */
export async function getStatus() {
  const d = await read();
  const map = {};
  (d.inactive || []).forEach((k) => { map[k] = 'no-asiste'; });
  (d.deceased || []).forEach((k) => { map[k] = 'fallecido'; });
  return map;
}

export const saveStatus = (map) =>
  setDoc(ref, {
    deceased: Object.keys(map).filter((k) => map[k] === 'fallecido'),
    inactive: Object.keys(map).filter((k) => map[k] === 'no-asiste'),
  }, { merge: true });