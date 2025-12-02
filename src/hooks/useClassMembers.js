import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const useClassMembers = (className) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, [className]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'members'),
        where('clase', '==', className)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { members, loading, error, refetch: fetchMembers };
};