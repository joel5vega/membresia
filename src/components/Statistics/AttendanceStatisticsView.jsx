// src/components/Statistics/AttendanceStatisticsView.jsx
import React, { useState, useEffect } from 'react';
import {
  getWeeklyStatistics,
  getMonthlyStatistics,
  getQuarterlyStatistics,
  getYearlyStatistics,
} from '../../services/attendanceStatisticsService';
import { getMemberStatistics } from '../../services/memberStatisticsService';

import PeriodSelector from './PeriodSelector';
import SummarySection from './SummarySection';
import ClassStatsSection from './ClassStatsSection';
import MemberStatsSection from './MemberStatsSection';
import './AttendanceStatisticsView.css';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const AttendanceStatisticsView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statistics, setStatistics] = useState(null);
  const [memberStatsExtra, setMemberStatsExtra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClass, setSelectedClass] = useState('');

  // estadísticas de asistencia
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        let data;
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        switch (selectedPeriod) {
          case 'weekly':
            data = await getWeeklyStatistics(selectedDate);
            break;
          case 'monthly':
            data = await getMonthlyStatistics(selectedDate);
            break;
          case 'quarterly':
            data = await getQuarterlyStatistics(year, month);
            break;
          case 'yearly':
            data = await getYearlyStatistics(year);
            break;
          default:
            throw new Error('Período no válido');
        }

        setStatistics(data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Error cargando estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedPeriod, selectedDate]);

  // estadísticas extra de miembros (byClass, dones, estado civil)
  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const stats = await getMemberStatistics();
        console.log('Member Statistics:', stats);
        setMemberStatsExtra(stats);
      } catch (err) {
        console.error('Error fetching member statistics:', err);
      }
    };

    fetchMemberStats();
  }, []);

  // seleccionar clase por defecto usando los nombres
  useEffect(() => {
    if (!statistics || !statistics.classesByName) return;
    const names = Object.keys(statistics.classesByName); // ya son nombres legibles
    if (names.length > 0 && !selectedClass) {
      setSelectedClass(names[0]);
    }
  }, [statistics, selectedClass]);

  const handlePeriodChange = (period) => setSelectedPeriod(period);
  const handleDateChange = (date) => setSelectedDate(date);

  if (loading && !statistics) {
    return (
      <div className="attendance-stats-container">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-stats-container error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="attendance-stats-container">
        <div className="no-data">No hay datos disponibles</div>
      </div>
    );
  }

  const getPeriodLabel = () => {
    if (selectedPeriod === 'weekly') {
      return `Semana del ${formatDate(statistics.startDate)} al ${formatDate(
        statistics.endDate,
      )}`;
    }
    if (selectedPeriod === 'monthly') {
      const month = new Date(statistics.startDate).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
      return `Mes de ${month}`;
    }
    if (selectedPeriod === 'quarterly') {
      return `Trimestre ${
        statistics.quarter || 'Actual'
      } ${statistics.year || selectedDate.getFullYear()}`;
    }
    return `Año ${statistics.year || selectedDate.getFullYear()}`;
  };

  console.log('STATISTICS keys', Object.keys(statistics));
  console.log('byClass in extra?', !!memberStatsExtra?.byClass);

  return (
    <div className="attendance-stats-container">
      <h1>Estadísticas de Asistencia</h1>

      <div className="period-selector-wrapper">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="period-label">{getPeriodLabel()}</div>

      <SummarySection statistics={statistics} />

      <ClassStatsSection statistics={statistics} />

      <MemberStatsSection
        statistics={statistics}
        memberStatsExtra={memberStatsExtra}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />
    </div>
  );
};

export default AttendanceStatisticsView;
