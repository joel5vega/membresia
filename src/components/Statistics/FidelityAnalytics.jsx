import React, { useMemo, useState } from 'react';
import { Flame, Trophy, Filter } from 'lucide-react';
import './FidelityAnalytics.css';

const CLASS_LIST = [
  'Sociedad de Caballeros "Emanuel"',
  'Sociedad de Señoras "Shaddai"',
  'Sociedad de Matrimonios jóvenes "Ebenezer"',
  'Sociedad de Jóvenes "Soldados de la Fe"',
  'Sociedad de prejuveniles "Vencedores"',
  'Clase de Exploradores',
  'Clase de Estrellitas',
  'Clase de joyitas',
  'Av. Jireh',
  'Av. Luz del evangelio',
  'Av. Elohim',
  'Av. Jesús es el camino',
  'Inactive',
];

const CLASS_COLORS = {
  'Sociedad de Caballeros "Emanuel"': '#A63232',
  'Sociedad de Señoras "Shaddai"': '#E68A3E',
  'Sociedad de Matrimonios jóvenes "Ebenezer"': '#3b82f6',
  'Sociedad de Jóvenes "Soldados de la Fe"': '#10b981',
  'Sociedad de prejuveniles "Vencedores"': '#6366f1',
  'Clase de Exploradores': '#8b5cf6',
  'Clase de Estrellitas': '#f97316',
  'Clase de joyitas': '#ec4899',
  'Av. Jireh': '#22c55e',
  'Av. Luz del evangelio': '#0ea5e9',
  'Av. Elohim': '#14b8a6',
  'Av. Jesús es el camino': '#f59e0b',
  Inactive: '#9ca3af',
};

const FidelityAnalytics = ({ attendanceData = [], membersRawList = [] }) => {
  const [selectedFilter, setSelectedFilter] = useState('TODAS');

  const memberCache = useMemo(() => {
    const cache = {};
    if (!membersRawList || membersRawList.length === 0) return cache;

    membersRawList.forEach((m) => {
      const cleanName =
        m.nombreCompleto ||
        (m.nombre && m.apellido
          ? `${m.nombre} ${m.apellido}`
          : m.memberName?.replace(/^Member-/, '').replace(/-\d+$/, ''));

      cache[m.id || m.memberId] = {
        name: cleanName || 'Miembro',
        photo: m.photoUrl,
        class: m.clase || m.className, // aquí debe venir exactamente uno de CLASS_LIST
      };
    });

    return cache;
  }, [membersRawList]);

  const filteredAttendance = useMemo(() => {
    if (selectedFilter === 'TODAS') return attendanceData;

    return attendanceData.filter((att) => {
      const info = memberCache[att.memberId];
      return info?.class === selectedFilter;
    });
  }, [attendanceData, selectedFilter, memberCache]);

  return (
    <div className="fidelity-container">
      <header className="fidelity-header">
        
        <h1>Panel de Honor</h1>
      </header>

      {/* Selector de Clases (Chips Horizontales) */}
      {/* <section className="analytics-section">
  <div className="filter-header">
    <Filter size={14} className="filter-icon" />
    <h2 className="section-label">FILTRAR POR SOCIEDAD</h2>
  </div>

  <div className="class-filter-dropdown">
    <select
      value={selectedFilter}
      onChange={(e) => setSelectedFilter(e.target.value)}
    >
      <option value="TODAS">Todas</option>
      {CLASS_LIST.map((cls) => (
        <option key={cls} value={cls}>
          {cls}
        </option>
      ))}
    </select>

  </div>
</section> */}



      {/* Cuadrícula de Avatares Filtrada */}
      <section className="analytics-section">
        <div className="results-info">
          <span>Mostrando {filteredAttendance.length} miembros</span>
        </div>
        <div className="fidelity-avatar-grid">
          {filteredAttendance.map((att) => {
            const memberInfo =
              memberCache[att.memberId] || { name: '...', photo: null, class: '' };
            const level = (att.level || 'BRONCE').toLowerCase();

            return (
              <div key={att.memberId} className={`avatar-wrapper level-${level}`}>
                <div className="avatar-frame">
                  {memberInfo.photo ? (
                    <img src={memberInfo.photo} alt="m" />
                  ) : (
                    <div className="no-photo">👤</div>
                  )}
                  {att.streak > 2 && <span className="streak-dot">🔥{att.streak}</span>}
                </div>

                <div className="avatar-tooltip">
                  <div className="tooltip-content">
                    <h4>{memberInfo.name}</h4>
                    <p>{memberInfo.class}</p>
                    <div className="tooltip-stats">
                      <span>
                        <Trophy size={12} /> Nivel {att.level}
                      </span>
                      <span>{att.percent}% Compromiso</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FidelityAnalytics;
