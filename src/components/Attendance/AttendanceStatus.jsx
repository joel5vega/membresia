import { ATTENDANCE_STATUS } from '../../constants/classes';

export const AttendanceStatus = ({ memberId, status, onStatusChange }) => {
  const statusOptions = Object.keys(ATTENDANCE_STATUS);

  return (
    <div className="attendance-status">
      <select
        value={status}
        onChange={(e) => onStatusChange(memberId, e.target.value)}
        className="status-select"
      >
        <option value="">-- Seleccione estado --</option>
        {statusOptions.map((statusKey) => (
          <option key={statusKey} value={statusKey}>
            {ATTENDANCE_STATUS[statusKey]}
          </option>
        ))}
      </select>
    </div>
  );
};
