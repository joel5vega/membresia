import React, { useState, useEffect } from 'react';
import { getAttendanceSummaryByDate } from '../../services/attendanceSummaryService';

const AttendanceSummaryView = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
    // Estado para biblias y ofrendas editables por clase
  const [additionalData, setAdditionalData] = useState({}); // { className: { biblias: 0, ofrendas: 0 } }

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAttendanceSummaryByDate(selectedDate);
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el resumen de asistencia');
      } finally {
        setLoading(false);
      }
    };

  // Handler para actualizar biblias/ofrendas
  const handleDataChange = (className, field, value) => {
    setAdditionalData((prev) => ({
      ...prev,
      [className]: {
        ...prev[className],
        [field]: parseInt(value) || 0,
      },
    }));
  };

    fetchSummary();
  }, [selectedDate]);


  return (
    <div style={{ padding: '16px' }}>
      <h2>Resumen de asistencia</h2>

      <div style={{ margin: '12px 0' }}>
        <label style={{ marginRight: 8 }}>Fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading && <p>Cargando resumen...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && summary.length === 0 && (
        <p>No hay registros de asistencia para esta fecha.</p>
      )}

      {!loading && summary.length > 0 && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left', padding: 8 }}>
                Clase
              </th>
              <th style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'right', padding: 8 }}>
                Varones
              </th>
              <th style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'right', padding: 8 }}>
                Mujeres
              </th>
              <th style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'right', padding: 8 }}>
                Total
              </th>
            <th style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'right', padding: 8 }}>
              Biblias
            </th>
            <th style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'right', padding: 8 }}>
              Ofrendas
            </th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.classId}>
                <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}>
                  {row.classId}
                </td>
                <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8, textAlign: 'right' }}>
                  {row.men}
                </td>
                <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8, textAlign: 'right' }}>
                  {row.women}
                </td>
                <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8, textAlign: 'right' }}>
                  {row.total}
                </td>
            <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8, textAlign: 'right' }}>
              <input
                type="number"
                min="0"
                value={additionalData[row.classId]?.biblias || 0}
                onChange={(e) => handleDataChange(row.classId, 'biblias', e.target.value)}
                style={{ width: '60px', textAlign: 'right', padding: '4px' }}
              />
            </td>
            <td style={{ borderBottom: '1px solid #f3f4f6', padding: 8, textAlign: 'right' }}>
              <input
                type="number"
                min="0"
                value={additionalData[row.classId]?.ofrendas || 0}
                onChange={(e) => handleDataChange(row.classId, 'ofrendas', e.target.value)}
                style={{ width: '60px', textAlign: 'right', padding: '4px' }}
              />
            </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceSummaryView;
