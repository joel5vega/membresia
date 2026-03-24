import React, { useState } from 'react';
import { useAttendanceHistory } from '../../hooks/useAttendanceHistory';
import './AttendanceHistoryView.css';

const CLASSES = ['Sociedad de Jóvenes', 'Adultos Mayores', 'Escuela Dominical'];

const AttendanceHistoryView = () => {
  const [selectedClass, setSelectedClass] = useState('Sociedad de Jóvenes');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { sessions, weeklyTrend, monthlyAvg, loading, error } = useAttendanceHistory(selectedClass);

  const todaySession = sessions[0] || null;
  const todayAbsent = todaySession
    ? (todaySession.capacity || 50) - todaySession.presente
    : 0;

  const prevMonthAvg = 72; // podrías calcularlo si tienes datos históricos
  const diff = monthlyAvg - prevMonthAvg;

  return (
    <div className="attendance-history">
      {/* Header */}
      <div className="ah-header">
        <div>
          <p className="ah-label">Métricas</p>
          <h2 className="ah-title">Asistencia</h2>
        </div>
        <div className="ah-filter-wrapper">
          <button className="ah-filter-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>{selectedClass}</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
          {dropdownOpen && (
            <div className="ah-dropdown">
              <div className="ah-dropdown-header">Filtrar por Clase</div>
              <div className="ah-dropdown-list">
                {['Todas las Clases', ...CLASSES].map(cls => (
                  <button
                    key={cls}
                    className={`ah-dropdown-item ${selectedClass === cls ? 'active' : ''}`}
                    onClick={() => { setSelectedClass(cls); setDropdownOpen(false); }}
                  >
                    <span>{cls}</span>
                    {selectedClass === cls && (
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="ah-loading">Cargando datos...</p>}
      {error && <p className="ah-error">Error: {error}</p>}

      {/* Cards resumen */}
      <div className="ah-summary-grid">
        <div className="ah-card-primary">
          <p className="ah-card-label">Promedio Mensual</p>
          <h3 className="ah-card-big">{monthlyAvg}%</h3>
          <div className="ah-badge">
            <span className="material-symbols-outlined">
              {diff >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span>{diff >= 0 ? '+' : ''}{diff}% vs mes anterior</span>
          </div>
        </div>
        <div className="ah-card-small">
          <p className="ah-card-label-sm">Total Hoy</p>
          <h4 className="ah-card-num ah-tertiary">{todaySession?.presente ?? '—'}</h4>
        </div>
        <div className="ah-card-small">
          <p className="ah-card-label-sm">Faltas</p>
          <h4 className="ah-card-num ah-secondary">{todaySession ? todayAbsent : '—'}</h4>
        </div>
      </div>

      {/* Gráfica semanal */}
      <div className="ah-chart-card">
        <div className="ah-chart-header">
          <h3>Tendencia Semanal</h3>
          <span className="ah-badge-filter">Filtro Activo</span>
        </div>
        <div className="ah-bar-chart">
          {weeklyTrend.map((item, i) => (
            <div key={i} className="ah-bar-col">
              <div className="ah-bar-track">
                <div
                  className={`ah-bar-fill ${item.isToday ? 'today' : ''}`}
                  style={{ height: `${item.percentage}%` }}
                />
              </div>
              <span className={`ah-bar-label ${item.isToday ? 'today' : ''}`}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de sesiones recientes */}
      <h3 className="ah-section-title">Sesiones Recientes</h3>
      <div className="ah-sessions-list">
        {sessions.length === 0 && !loading && (
          <p className="ah-empty">No hay sesiones registradas.</p>
        )}
        {sessions.slice(0, 10).map((session, i) => (
          <div key={session.date} className={`ah-session-item ${i > 1 ? 'dimmed' : ''}`}>
            <div className="ah-session-icon">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div className="ah-session-info">
              <h5>{session.label}</h5>
              <p>Clase: {selectedClass}</p>
            </div>
            <div className="ah-session-stats">
              <p className="ah-stat-primary">{session.presente}/{session.capacity || 50}</p>
              <p className="ah-stat-secondary">Capacidad: {session.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceHistoryView;