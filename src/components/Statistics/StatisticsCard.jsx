// StatisticsCard.jsx
const StatisticsCard = ({ memberName, stats, period }) => {
  if (!stats) return null;

  const periodStats = stats[period];
  if (!periodStats) return null; // extra safety

  const { presente, ausente, tardio, total, percentage } = periodStats;

  return (
    <div className="statistics-card">
      <h4>{memberName}</h4>
      <div className="stats-info">
        <div className="stat-item">
          <span className="stat-label">Presente:</span>
          <span className="stat-value presente">{presente}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tardío:</span>
          <span className="stat-value tardio">{tardio}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ausente:</span>
          <span className="stat-value ausente">{ausente}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value total">{total}</span>
        </div>
      </div>
      <div className="attendance-percentage">
        <div className="percentage-bar">
          <div
            className="percentage-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="percentage-text">{percentage}% Asistencia</p>
      </div>
    </div>
  );
};

export default StatisticsCard;
