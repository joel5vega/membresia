import React from 'react';
import { TrendingUp, Users, BookOpen, Calendar } from 'lucide-react';

const SummarySection = ({ statistics }) => {
  // Verificamos que existan las estadísticas para evitar errores de renderizado
  if (!statistics) return null;

  const kpis = [
    { 
      label: 'Asistencia Global', 
      value: `${(statistics.overallAttendanceRate || 0).toFixed(1)}%`, 
      icon: <TrendingUp size={24} />, 
      color: '#A63232' 
    },
    { 
      label: 'Total Sesiones', 
      value: statistics.totalSessions || 0, 
      icon: <Calendar size={24} />, 
      color: '#E68A3E' 
    },
    { 
      label: 'Presentes Total', 
      value: statistics.totalAttendances || 0, 
      icon: <Users size={24} />, 
      color: '#0D9488' 
    },
    { 
      label: 'Biblias Promedio', 
      value: (statistics.averageBibles || 0).toFixed(1), 
      icon: <BookOpen size={24} />, 
      color: '#7C3AED' 
    }
  ];

  return (
    <div className="summary-grid">
      {kpis.map((kpi, i) => (
        <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${kpi.color}` }}>
          <div className="kpi-icon" style={{ color: kpi.color }}>
            {kpi.icon}
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{kpi.value}</span>
            <span className="kpi-label">{kpi.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummarySection;