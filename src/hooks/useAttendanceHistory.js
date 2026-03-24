import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const parseDate = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue?.toDate) return dateValue.toDate();
  if (typeof dateValue === 'string') {
    const p = dateValue.split('-');
    if (p.length === 3) return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  }
  return new Date(dateValue);
};

export const useAttendanceHistory = (className) => {
  const [sessions, setSessions] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [monthlyAvg, setMonthlyAvg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!className) {
      setSessions([]);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'attendance'),
          where('clase', '==', className)
        );
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Agrupar por fecha → sesión
        const byDate = {};
        records.forEach(r => {
          const date = typeof r.date === 'string' ? r.date : r.date?.toDate?.()?.toISOString().split('T')[0];
          if (!date) return;
          if (!byDate[date]) byDate[date] = { date, presente: 0, total: 0, capacity: r.capacity || 50 };
          byDate[date].total++;
          if (String(r.status).toLowerCase().trim() === 'presente') byDate[date].presente++;
        });

        // Ordenar por fecha desc
        const sorted = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
        const sessionsFormatted = sorted.map(s => ({
          ...s,
          percentage: s.total > 0 ? Math.round((s.presente / s.capacity) * 100) : 0,
          label: formatDateLabel(s.date),
        }));

        setSessions(sessionsFormatted);

        // Tendencia semanal (últimos 7 días)
        const now = new Date();
        const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const trend = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now);
          d.setDate(now.getDate() - (6 - i));
          const key = d.toISOString().split('T')[0];
          return {
            day: days[d.getDay()],
            isToday: i === 6,
            percentage: byDate[key] ? Math.round((byDate[key].presente / (byDate[key].capacity || byDate[key].total)) * 100) : 0,
          };
        });
        setWeeklyTrend(trend);

        // Promedio mensual
        const now2 = new Date();
        const monthly = sessionsFormatted.filter(s => {
          const d = parseDate(s.date);
          return d && d.getMonth() === now2.getMonth() && d.getFullYear() === now2.getFullYear();
        });
        const avg = monthly.length > 0
          ? Math.round(monthly.reduce((acc, s) => acc + s.percentage, 0) / monthly.length)
          : 0;
        setMonthlyAvg(avg);

      } catch (err) {
        console.error('Error fetching attendance history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [className]);

  return { sessions, weeklyTrend, monthlyAvg, loading, error };
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
};