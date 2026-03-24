import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const getQuarter = (date) => {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return { year: date.getFullYear(), quarter: q };
};

const parseRecordDate = (dateValue) => {
  if (!dateValue) return null;
  // Firebase Timestamp
  if (dateValue?.toDate) return dateValue.toDate();
  // String "YYYY-MM-DD"
  if (typeof dateValue === 'string') {
    const parts = dateValue.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }
  return new Date(dateValue);
};

export const useAttendanceStats = (className) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!className) {
        setStats({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, 'attendance'),
          where('clase', '==', className)
        );
        const snapshot = await getDocs(q);
        const attendanceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const statsByMember = {};
        const now = new Date();
        // Normalizar "ahora" al final del día
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        attendanceData.forEach(record => {
          const memberId = record.memberId;
          if (!memberId) return;

          if (!statsByMember[memberId]) {
            statsByMember[memberId] = {
              memberId,
              memberName: record.memberName || 'Desconocido',
              weekly:    { presente: 0, ausente: 0, tardio: 0, total: 0, percentage: 0 },
              monthly:   { presente: 0, ausente: 0, tardio: 0, total: 0, percentage: 0 },
              quarterly: { presente: 0, ausente: 0, tardio: 0, total: 0, percentage: 0 },
              yearly:    { presente: 0, ausente: 0, tardio: 0, total: 0, percentage: 0 },
            };
          }

          const recordDate = parseRecordDate(record.date);
          if (!recordDate) return;

          const rawStatus = String(record.status || '').toLowerCase().trim();
          const statusKey =
            rawStatus === 'presente' ? 'presente' :
            rawStatus === 'tardío' || rawStatus === 'tardio' ? 'tardio' :
            'ausente';

          const m = statsByMember[memberId];

          // Últimos 7 días
          if (recordDate >= sevenDaysAgo && recordDate <= endOfToday) {
            m.weekly[statusKey]++;
            m.weekly.total++;
          }
          // Mes actual
          if (recordDate.getMonth() === now.getMonth() &&
              recordDate.getFullYear() === now.getFullYear()) {
            m.monthly[statusKey]++;
            m.monthly.total++;
          }
          // Trimestre actual
          const cq = getQuarter(now);
          const rq = getQuarter(recordDate);
          if (cq.quarter === rq.quarter && cq.year === rq.year) {
            m.quarterly[statusKey]++;
            m.quarterly.total++;
          }
          // Año actual
          if (recordDate.getFullYear() === now.getFullYear()) {
            m.yearly[statusKey]++;
            m.yearly.total++;
          }
        });

        // Calcular porcentajes
        Object.values(statsByMember).forEach(member => {
          ['weekly', 'monthly', 'quarterly', 'yearly'].forEach(period => {
            const { total, presente } = member[period];
            member[period].percentage = total > 0 ? Math.round((presente / total) * 100) : 0;
          });
        });

        setStats(statsByMember);
      } catch (err) {
        console.error('Error fetching attendance stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceStats();
  }, [className]);

  return { stats, loading, error };
};