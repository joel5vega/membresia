import { useState } from 'react';
import PeriodSelector from './PeriodSelector';
import  StatisticsCard from './StatisticsCard';

export const StatisticsView = ({ classStats, loading, error }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

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
      </div>
    </div>
  );
};
