// src/components/Statistics/MemberStatsSection.jsx
import React from 'react';

// Icon component for different stat types
const StatIcon = ({ type }) => {
  const iconMap = {
    // Baptism
    'bautizado': '💧',
    'no-bautizado': '⭕',
    
    // Spiritual Gifts
    'evangelista': '📢',
    'servicio': '🤝',
    'enseñanza': '📚',
    'liderazgo': '👑',
    'ciencia': '🔬',
    'administración': '📋',
    'fe': '✨',
    'sabiduria': '🦉',
    'discernimiento': '👁️',
    'profecia': '💫',
    'sanidad': '🏥',
    
    // Marital Status
    'soltero': '👤',
    'casado': '💑',
    'divorciado': '💔',
    'viudo': '🕊️',
  };
  
  return (
    <span style={{
      fontSize: '32px',
      display: 'inline-block',
      marginBottom: '8px'
    }}>
      {iconMap[type] || '📊'}
    </span>
  );
};

// Simple card component for displaying statistics
const SimpleStatCard = ({ title, value, iconType }) => (
  <div style={{
    border: '1px solid #e5e7eb',
    padding: '16px 24px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    cursor: 'default'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06)';
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <StatIcon type={iconType} />
      <div style={{
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '12px',
        fontWeight: '500',
        lineHeight: '1.4'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '40px',
        fontWeight: 'bold',
        color: '#1f2937',
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {value}
      </div>
    </div>
  </div>
);

const formatMemberShortName = (memberName = '') => {
  const clean = memberName
    .replace(/^Member-/, '')
    .replace(/-\d+$/, '')
    .trim();

  const rawTokens = clean.includes(' ')
    ? clean.split(/\s+/)
    : clean.split(/(?=[A-Z])/);

  const tokens = rawTokens.filter(Boolean);
  if (tokens.length === 0) return '';

  const firstLastName = tokens[0];

  if (tokens.length >= 3) {
    const firstName = tokens[2];
    return `${firstName} ${firstLastName}`;
  }

  if (tokens.length === 2) {
    const firstName = tokens[1];
    return `${firstName} ${firstLastName}`;
  }

  return tokens[0];
};

const MemberStatsSection = ({
  statistics,
  memberStatsExtra,
  selectedClass,
  setSelectedClass,
}) => {
  // Get class stats from memberStatsExtra (has the additional fields we need)
  const classStats = selectedClass && memberStatsExtra?.byClass
    ? memberStatsExtra.byClass[selectedClass]
    : null;

  const baptizedStats = classStats
    ? {
        Bautizados: classStats.baptizedCount || 0,
        'No Bautizados': classStats.unBaptizedCount || 0,
      }
    : null;

  const giftStats = classStats?.donesEspirituales || null;
  const maritalStats = classStats?.estadoCivil || null;

  return (
    <div className="statistics-section">
      <h2>Estadísticas por Miembro</h2>

      {statistics.memberStats?.length > 0 ? (
        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr>
                <th>Miembro</th>
                <th className="col-presences">Presentes</th>
                <th className="col-absences">Ausentes</th>
                <th className="col-justified">Justificado</th>
                <th className="col-rate">% Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {statistics.memberStats.map((memberStat) => (
                <tr key={memberStat.memberId}>
                  <td className="member-name">
                    {formatMemberShortName(memberStat.memberName || '')}
                  </td>
                  <td className="present col-presences">
                    {memberStat.totalAttendances?.toLocaleString() || 0}
                  </td>
                  <td className="absent col-absences">
                    {memberStat.totalAbsences?.toLocaleString() || 0}
                  </td>
                  <td className="justified col-justified">
                    {memberStat.totalJustified?.toLocaleString() || 0}
                  </td>
                  <td className="attendance-rate col-rate">
                    <span className="percentage">
                      {memberStat.attendanceRate?.toFixed(1) || 0}%
                    </span>
                    <div className="mini-progress">
                      <div
                        className="mini-progress-fill"
                        style={{
                          width: `${Math.min(
                            memberStat.attendanceRate || 0,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Estadísticas adicionales */}
          <div className="members-statistics-section">
            <h2>Estadísticas Adicionales de Miembros</h2>

            <div className="class-selector">
              <label htmlFor="class-select">Seleccionar Clase: </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ padding: '8px', marginLeft: '10px' }}
              >
                {statistics &&
                  Object.keys(statistics.classesByName || {}).map(
                    (className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ),
                  )}
              </select>
            </div>

            {/* Debug block */}
            <div style={{ 
              background: '#e6f3ff', 
              padding: '10px', 
              margin: '15px 0',
              border: '1px solid #2563eb',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>Clase seleccionada:</strong> {selectedClass}
            </div>

            {selectedClass && (baptizedStats || giftStats || maritalStats) ? (
              <div
                className="member-stats-grid"
                style={{
                  display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginTop: '20px',
                }}
              >
                {/* Baptized Stats */}
                {baptizedStats && (
                  <>
                    <SimpleStatCard
                      title="Bautizados"
                      value={baptizedStats.Bautizados}
                      iconType="bautizado"
                    />
                    <SimpleStatCard
                      title="No Bautizados"
                      value={baptizedStats['No Bautizados']}
                      iconType="no-bautizado"
                    />
                  </>
                )}

                {/* Spiritual Gifts Stats */}
                {giftStats && Object.entries(giftStats).map(([gift, count]) => (
                  <SimpleStatCard
                    key={`gift-${gift}`}
                    title={`Don: ${gift}`}
                    value={count}
                    iconType={gift.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}
                  />
                ))}

                {/* Marital Status Stats */}
                {maritalStats && Object.entries(maritalStats).map(([status, count]) => {
                  const statusKey = status.toLowerCase().split('/')[0]; // "Soltero/a" -> "soltero"
                  return (
                    <SimpleStatCard
                      key={`marital-${status}`}
                      title={`Estado Civil: ${status}`}
                      value={count}
                      iconType={statusKey}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="no-data">
                {selectedClass 
                  ? 'No hay estadísticas adicionales para esta clase'
                  : 'Seleccione una clase para ver estadísticas adicionales'
                }
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="no-data">No hay datos de miembros para este período</p>
      )}
    </div>
  );
};

export default MemberStatsSection;