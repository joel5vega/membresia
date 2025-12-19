// src/components/Statistics/SummarySection.jsx
import React from 'react';

const SummarySection = ({ statistics }) => (
  <div className="stats-summary">
    <div className="summary-card overall">
      <h3>Resumen General</h3>
      <div className="summary-stats">
        <div className="stat-item">
          <span className="label">Sesiones:</span>
          <span className="value">
            {statistics.totalSessions?.toLocaleString() || 0}
          </span>
        </div>
        <div className="stat-item">
          <span className="label">% Asistencia:</span>
          <span className="value percentage">
            {statistics.overallAttendanceRate?.toFixed(1) || 0}%
          </span>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(statistics.overallAttendanceRate || 0, 100)}%`,
          }}
        ></div>
      </div>
    </div>
  </div>
);

export default SummarySection;
