import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classService';
import { getClassAttendance } from '../services/classAttendanceService';

const ClassReportView = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    maestroId: '',
  });
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
      setFilteredClasses(data);
    } catch (err) {
      setError('Error cargando clases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...classes];

    if (filters.startDate) {
      filtered = filtered.filter(c => new Date(c.fecha) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(c => new Date(c.fecha) <= new Date(filters.endDate));
    }
    if (filters.maestroId) {
      filtered = filtered.filter(c => c.maestroId === filters.maestroId);
    }

    setFilteredClasses(filtered);
  };

  const exportToCSV = () => {
    if (filteredClasses.length === 0) return;
    const headers = 'Fecha,Maestro,Tema,Asistentes,Porcentaje,Ofrendas';
    const rows = filteredClasses.map(c => `${new Date(c.fecha).toLocaleDateString()},${c.maestroNombre},${c.tema},${c.numTotal},${c.asistenciaTotalPorcentaje}%,${c.ofrendas}`);
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="class-report-container">
      <h2>Reporte de Clases</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} placeholder="Desde" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} placeholder="Hasta" />
        <input type="text" name="maestroId" value={filters.maestroId} onChange={handleFilterChange} placeholder="ID Maestro" />
        <button onClick={applyFilters}>Filtrar</button>
        <button onClick={exportToCSV}>Exportar CSV</button>
      </div>

      <div className="classes-list">
        {filteredClasses.length === 0 ? (
          <p>No hay clases</p>
        ) : (
          filteredClasses.map(c => (
            <div key={c.id} className="class-item" onClick={() => setSelectedClass(c)}>
              <h4>{c.tema}</h4>
              <p>{new Date(c.fecha).toLocaleDateString()} - {c.maestroNombre}</p>
              <p>Asistentes: {c.numTotal} ({c.asistenciaTotalPorcentaje}%)</p>
            </div>
          ))
        )}
      </div>

      {selectedClass && (
        <div className="class-details">
          <h3>{selectedClass.tema}</h3>
          <p><strong>Fecha:</strong> {new Date(selectedClass.fecha).toLocaleDateString()}</p>
          <p><strong>Maestro:</strong> {selectedClass.maestroNombre}</p>
          <p><strong>Asistentes:</strong> {selectedClass.numTotal} ({selectedClass.asistenciaTotalPorcentaje}%)</p>
          <p><strong>Ofrendas:</strong> ${selectedClass.ofrendas}</p>
          <p><strong>Biblias:</strong> {selectedClass.biblias}</p>
          <p><strong>Registrado por:</strong> {selectedClass.registradoPorNombre}</p>
        </div>
      )}
    </div>
  );
};

export default ClassReportView;