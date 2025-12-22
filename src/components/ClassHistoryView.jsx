import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classService';
import { getClassAttendance } from '../services/classAttendanceService';
import { memberService } from '../services/memberService';
const ClassHistoryView = () => {
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const classesData = await getClasses();
      const membersData = await memberService.getMembers([]);
      setClasses(classesData);
      setMembers(membersData);
      calculateStats(classesData, membersData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (classesData, membersData) => {
    const totalAssistances = classesData.reduce((sum, c) => sum + (c.numTotal || 0), 0);
    const totalOfferings = classesData.reduce((sum, c) => sum + (c.ofrendas || 0), 0);
    const avgAttendance = classesData.length > 0 ? Math.round(totalAssistances / classesData.length) : 0;
    const avgPercentage = classesData.length > 0
      ? Math.round(classesData.reduce((sum, c) => sum + (c.asistenciaTotalPorcentaje || 0), 0) / classesData.length)
      : 0;

    setStats({
      totalClasses: classesData.length,
      totalMembers: membersData.length,
      totalAssistances,
      totalOfferings,
      avgAttendance,
      avgPercentage,
    });
  };

  const handleSelectClass = async (classData) => {
    setSelectedClass(classData);
    try {
      const attendanceData = await getClassAttendance(classData.id);
      setAttendance({
        [classData.id]: attendanceData
      });
    } catch (err) {
      console.error('Error cargando asistencia:', err);
    }
  };

  const exportToCSV = () => {
    if (classes.length === 0) return;
    const headers = 'Fecha,Maestro,Tema,Asistentes,Porcentaje,Ofrendas,Biblias,Registrado Por';
    const rows = classes.map(c => `${new Date(c.fecha).toLocaleDateString()},${c.maestroNombre},${c.tema},${c.numTotal},${c.asistenciaTotalPorcentaje}%,${c.ofrendas},${c.biblias},${c.registradoPorNombre}`);
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-clases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="loading">Cargando datos...</div>;

  return (
    <div className="class-history-container">
      <h2>Historial de Clases y Estadísticas</h2>

      {/* Estadísticas Generales */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Clases Totales</h3>
          <p className="stat-value">{stats.totalClasses}</p>
        </div>
        <div className="stat-card">
          <h3>Miembros Registrados</h3>
          <p className="stat-value">{stats.totalMembers}</p>
        </div>
        <div className="stat-card">
          <h3>Asistencias Totales</h3>
          <p className="stat-value">{stats.totalAssistances}</p>
        </div>
        <div className="stat-card">
          <h3>Promedio Asistencia</h3>
          <p className="stat-value">{stats.avgAttendance}</p>
        </div>
        <div className="stat-card">
          <h3>Porcentaje Promedio</h3>
          <p className="stat-value">{stats.avgPercentage}%</p>
        </div>
        <div className="stat-card">
          <h3>Ofrendas Totales</h3>
          <p className="stat-value">${stats.totalOfferings}</p>
        </div>
      </div>

      <div className="actions">
        <button onClick={loadData} className="btn-refresh">Actualizar Datos</button>
        <button onClick={exportToCSV} className="btn-export">Descargar CSV</button>
      </div>

      {/* Lista de Clases */}
      <div className="classes-section">
        <h3>Listado de Clases</h3>
        {classes.length === 0 ? (
          <p>No hay clases registradas</p>
        ) : (
          <div className="classes-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Maestro</th>
                  <th>Tema</th>
                  <th>Asistentes</th>
                  <th>Asistencia %</th>
                  <th>Ofrendas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id} className={selectedClass?.id === c.id ? 'selected' : ''}>
                    <td>{new Date(c.fecha).toLocaleDateString()}</td>
                    <td>{c.maestroNombre}</td>
                    <td>{c.tema}</td>
                    <td>{c.numTotal}</td>
                    <td>{c.asistenciaTotalPorcentaje}%</td>
                    <td>${c.ofrendas}</td>
                    <td>
                      <button onClick={() => handleSelectClass(c)} className="btn-view">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalles de Clase Seleccionada */}
      {selectedClass && (
        <div className="class-details-section">
          <h3>Detalles de Clase: {selectedClass.tema}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Fecha:</label>
              <p>{new Date(selectedClass.fecha).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
              <label>Maestro:</label>
              <p>{selectedClass.maestroNombre}</p>
            </div>
            <div className="detail-item">
              <label>Total Asistentes:</label>
              <p>{selectedClass.numTotal}</p>
            </div>
            <div className="detail-item">
              <label>Hombres:</label>
              <p>{selectedClass.numVarones}</p>
            </div>
            <div className="detail-item">
              <label>Mujeres:</label>
              <p>{selectedClass.numTotal - selectedClass.numVarones}</p>
            </div>
            <div className="detail-item">
              <label>Porcentaje Asistencia:</label>
              <p>{selectedClass.asistenciaTotalPorcentaje}%</p>
            </div>
            <div className="detail-item">
              <label>Ofrendas:</label>
              <p>${selectedClass.ofrendas}</p>
            </div>
            <div className="detail-item">
              <label>Biblias:</label>
              <p>{selectedClass.biblias}</p>
            </div>
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>Anuncios:</label>
              <p>{selectedClass.anuncios || 'Sin anuncios'}</p>
            </div>
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>Registrado por:</label>
              <p>{selectedClass.registradoPorNombre}</p>
            </div>
          </div>

          {/* Asistencia Detallada */}
          {attendance[selectedClass.id] && attendance[selectedClass.id].length > 0 && (
            <div className="attendance-detail">
              <h4>Miembros Presentes</h4>
              <ul>
                {attendance[selectedClass.id].map(a => (
                  <li key={a.id}>{a.memberName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassHistoryView;