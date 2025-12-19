import { useState, useEffect } from 'react';

import PeriodSelector from './PeriodSelector';
import { getClassStatistics, getDonesEspirituales, getEstadoCivil } from '../../services/memberStatisticsService';
import  StatisticsCard from './StatisticsCard';

export const StatisticsView = ({ classStats, loading, error }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [memberStats, setMemberStats] = useState(null);
  const [baptizedStats, setBaptizedStats] = useState(null);
  const [giftStats, setGiftStats] = useState(null);
  const [maritalStats, setMaritalStats] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (selectedClass) {
      getClassStatistics(selectedClass).then(stats => {
        setBaptizedStats(stats.bautizado || {});
      }).catch(err => console.error(err));

      getDoneEspirituales(selectedClass).then(stats => {
        setGiftStats(stats.donesEspirituales || {});
      }).catch(err => console.error(err));

      getEstadoCivil(selectedClass).then(stats => {
        setMaritalStats(stats.estadoCivil || {});
      }).catch(err => console.error(err));
    }
  }, [selectedClass]);


  if (loading) return <div className="loading">Cargando estadísticas...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="statistics-view">
      <h2>Estadísticas de Asistencia</h2>
      
      <div className="controls">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      <div className="statistics-grid">
        {Object.keys(classStats).length === 0 ? (
          <p>No hay datos de asistencia disponibles</p>
        ) : (
          Object.values(classStats).map((memberStats) => (
            <StatisticsCard
              key={memberStats.memberId}
              memberName={memberStats.memberName}
              stats={memberStats}
              period={selectedPeriod}
            />
          ))
        )}

      {/* Miembro Estadísticas Section */}
      <div className="members-statistics">
        <h2>Estadísticas de Miembros</h2>
        <div className="class-selector">
          <label>Seleccionar Clase: </label>
          <select value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">--Todas las clases--</option>
            {Object.keys(classStats || {}).map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>
        
        {selectedClass && (
          <>
            <div className="member-stats-grid">
              {baptizedStats && (
                <StatisticsCard
                  title="Bautizados"
                  value={Object.values(baptizedStats).reduce((a, b) => a + (b || 0), 0)}
                  stats={baptizedStats}
                />
              )}
              {giftStats && (
                <StatisticsCard
                  title="Dones Espirituales"
                  value={Object.keys(giftStats).length}
                  stats={giftStats}
                />
              )}
              {maritalStats && (
                <StatisticsCard
                  title="Estado Civil"
                  value={Object.keys(maritalStats).length}
                  stats={maritalStats}
                />
              )}
            </div>
          </>
        )}
      </div>

      </div>
    </div>
  );
};
