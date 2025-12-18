// PeriodSelector.jsx
const PERIODS = [
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensual' },
  { id: 'quarterly', label: 'Trimestral' },
  { id: 'yearly', label: 'Anual' }
];

const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <div className="period-selector">
      <label htmlFor="period-select">Período:</label>
      <select
        id="period-select"
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="period-select"
      >
        {PERIODS.map((period) => (
          <option key={period.id} value={period.id}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;
