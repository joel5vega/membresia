import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

// Helper function to get week number from date
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Helper function to get year and quarter from date
const getQuarter = (date) => {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return { year: date.getFullYear(), quarter: q };
};

export const useAttendanceStats = (className) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!className) return;
      
      setLoading(true);
      setError(null);
      try {
        // Get all attendance records for the class
        const q = query(
          collection(db, 'attendance'),
          where('clase', '==', className)
        );
        const snapshot = await getDocs(q);
        const attendanceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate statistics by member
        const statsByMember = {};
        
        attendanceData.forEach(record => {
          const memberId = record.memberId;
          if (!statsByMember[memberId]) {
            statsByMember[memberId] = {
              memberId,
              memberName: record.memberName,
              weekly: { presente: 0, ausente: 0, tardio: 0, total: 0 },
              monthly: { presente: 0, ausente: 0, tardio: 0, total: 0 },
              quarterly: { presente: 0, ausente: 0, tardio: 0, total: 0 },
              yearly: { presente: 0, ausente: 0, tardio: 0, total: 0 }
            };
          }

          const date = new Date(record.date);
          const status = record.status.toLowerCase();
          const statusKey = status === 'presente' ? 'presente' : 
                           status === 'tardío' || status === 'tardio' ? 'tardio' : 'ausente';

          // Weekly (last 7 days)
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (date >= sevenDaysAgo) {
            statsByMember[memberId].weekly[statusKey]++;
            statsByMember[memberId].weekly.total++;
          }

          // Monthly (current month)
          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            statsByMember[memberId].monthly[statusKey]++;
            statsByMember[memberId].monthly.total++;
          }

          // Quarterly
          const currentQuarter = getQuarter(now);
          const recordQuarter = getQuarter(date);
          if (currentQuarter.quarter === recordQuarter.quarter && 
              currentQuarter.year === recordQuarter.year) {
            statsByMember[memberId].quarterly[statusKey]++;
            statsByMember[memberId].quarterly.total++;
          }

          // Yearly
          if (date.getFullYear() === now.getFullYear()) {
            statsByMember[memberId].yearly[statusKey]++;
            statsByMember[memberId].yearly.total++;
          }
        });

        // Calculate percentages
        Object.keys(statsByMember).forEach(memberId => {
          ['weekly', 'monthly', 'quarterly', 'yearly'].forEach(period => {
            const total = statsByMember[memberId][period].total;
            const presente = statsByMember[memberId][period].presente;
            statsByMember[memberId][period].percentage = total > 0 ? Math.round((presente / total) * 100) : 0;
          });
        });

        setStats(statsByMember);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceStats();
  }, [className]);

  return { stats, loading, error };
};
