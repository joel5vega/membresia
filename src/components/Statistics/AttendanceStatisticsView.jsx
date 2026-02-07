import React, { useState, useEffect } from 'react';
import { getWeeklyStatistics, getMonthlyStatistics, getQuarterlyStatistics, getYearlyStatistics } from '../../services/attendanceStatisticsService';
import { getMemberStatistics } from '../../services/memberStatisticsService';
import PeriodSelector from './PeriodSelector';
import SummarySection from './SummarySection';
import ClassStatsSection from './ClassStatsSection';
import MemberStatsSection from './MemberStatsSection';
import './AttendanceStatistics.css';

const AttendanceStatisticsView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statistics, setStatistics] = useState(null);
  const [memberStatsExtra, setMemberStatsExtra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let data;
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        if (selectedPeriod === 'weekly') data = await getWeeklyStatistics(selectedDate);
        else if (selectedPeriod === 'monthly') data = await getMonthlyStatistics(selectedDate);
        else if (selectedPeriod === 'quarterly') data = await getQuarterlyStatistics(year, month);
        else data = await getYearlyStatistics(year);
        setStatistics(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchStats();
  }, [selectedPeriod, selectedDate]);

  useEffect(() => {
    getMemberStatistics().then(setMemberStatsExtra).catch(console.error);
  }, []);

  if (loading || !statistics) return <div className="stats-loading">Cargando Analíticas...</div>;

  return (
    <div className="stats-container">
      <header className="stats-header">
        <h1>Analíticas Canaán</h1>
        <PeriodSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod} 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      </header>

      <SummarySection statistics={statistics} />
      
      <div className="stats-grid-main">
        <ClassStatsSection statistics={statistics} />
        <MemberStatsSection 
          statistics={statistics} 
          memberStatsExtra={memberStatsExtra}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
      </div>
    </div>
  );
};

export default AttendanceStatisticsView;