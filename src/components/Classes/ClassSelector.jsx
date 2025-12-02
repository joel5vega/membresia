import { CLASSES } from '../../constants/classes';

export const ClassSelector = ({ selectedClass, onClassChange }) => {
  return (
    <div className="class-selector">
      <label htmlFor="class-select">Seleccionar Clase:</label>
      <select
        id="class-select"
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
        className="class-select"
      >
        <option value="">-- Seleccione una clase --</option>
        {CLASSES.map((className) => (
          <option key={className} value={className}>
            {className}
          </option>
        ))}
      </select>
    </div>
  );
};
