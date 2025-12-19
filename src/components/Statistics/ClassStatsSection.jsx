// src/components/Statistics/ClassStatsSection.jsx
import React from 'react';

const ClassStatsSection = ({ statistics }) => (
  <div className="statistics-section">
    <h2>Estadísticas por Clase</h2>
    {statistics?.classesByName ? (
      <div className="stats-grid">
        {Object.entries(statistics.classesByName).map(
          ([className, classStats]) => (
            <div key={className} className="class-card">
              <div className="class-card-header">
                <span className="class-name">{className}</span>
                <span className="class-rate">
                  {classStats.attendanceRate.toFixed(1)}%
                </span>
              </div>
              <div className="class-card-body">
                <div className="class-stat-item">
                  <span className="label">Sesiones</span>
                  <span className="value">{classStats.totalSessions}</span>
                </div>
                <div className="class-stat-item">
                  <span className="label">Presentes</span>
                  <span className="value">{classStats.totalAttendances}</span>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    ) : (
      <p className="no-data">
        Las estadísticas por clase se están procesando para este período
      </p>
    )}
  </div>
);

export default ClassStatsSection;
