import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
};

const applyPeriodFilter = (records, period) => {
  const now = new Date();
  return records.filter(r => {
    const [y, m] = r.date.split('-').map(Number);
    switch (period) {
      case 'mes':
        return m - 1 === now.getMonth() && y === now.getFullYear();
      case 'trimestre': {
        const currentQ = Math.floor(now.getMonth() / 3);
        const recordQ  = Math.floor((m - 1) / 3);
        return recordQ === currentQ && y === now.getFullYear();
      }
      case 'año':
        return y === now.getFullYear();
      default:
        return true;
    }
  });
};

const buildWeeklyTrend = (records) => {
  const byDate = {};
  records.forEach(r => { byDate[r.date] = r; });
  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return {
      day:     days[d.getDay()],
      isToday: i === 6,
      total:   byDate[key]?.total || 0,
    };
  });
};

const buildStats = (filtered) => {
  if (filtered.length === 0) return { avg: 0, max: 0, min: 0, totalSum: 0 };
  const totals = filtered.map(r => r.total ?? 0);
  return {
    avg:      Math.round(totals.reduce((a, b) => a + b, 0) / totals.length),
    max:      Math.max(...totals),
    min:      Math.min(...totals),
    totalSum: totals.reduce((a, b) => a + b, 0),
  };
};

// Normaliza cualquier documento al campo `total`
const normalizeRecord = (raw) => {
  const r = { id: raw.id, ...raw };
  r.total = r.asistencia_final > 0
    ? r.asistencia_final
    : (r.total_overall ?? r.total ?? 0);
  return r;
};

// ─── Hook general (quick_summary + general_summary) ──────────────────────────
export const useQuickSummaryHistory = (period = 'total') => {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'asistencias_totales'),
          where('recordType', 'in', ['quick_summary', 'general_summary'])
        );
        const snap = await getDocs(q);
        const data = snap.docs
          .map(d => normalizeRecord({ id: d.id, ...d.data() }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(r => ({ ...r, label: formatDateLabel(r.date) }));
        setAllRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const records     = useMemo(() => applyPeriodFilter(allRecords, period), [allRecords, period]);
  const stats       = useMemo(() => buildStats(records), [records]);
  const weeklyTrend = useMemo(() => buildWeeklyTrend(allRecords), [allRecords]);

  return { records, allRecords, loading, error, stats, weeklyTrend };
};

// ─── Hook class_summary (por clase) ──────────────────────────────────────────
export const useClassSummaryHistory = (className, period = 'total') => {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!className || className === 'Todas las Clases') {
      setAllRecords([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'asistencias_totales'),
          where('recordType', '==', 'class_summary'),
          where('clase', '==', className)
        );
        const snap = await getDocs(q);
        const data = snap.docs
          .map(d => normalizeRecord({ id: d.id, ...d.data() }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(r => ({ ...r, label: formatDateLabel(r.date) }));
        setAllRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [className]);

  const records     = useMemo(() => applyPeriodFilter(allRecords, period), [allRecords, period]);
  const stats       = useMemo(() => buildStats(records), [records]);
  const weeklyTrend = useMemo(() => buildWeeklyTrend(allRecords), [allRecords]);

  return { records, allRecords, loading, error, stats, weeklyTrend };
};