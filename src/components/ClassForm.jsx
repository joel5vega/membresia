import React, { useState, useEffect } from 'react';
import { createOrUpdateClass } from '../services/classService';
import { createBatchClassAttendance } from '../services/classAttendanceService';

const ClassForm = ({ onClassCreated }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    maestroId: '',
    maestroNombre: '',
    tema: '',
    numVarones: 0,
    numTotal: 0,
    asistenciaTotalPorcentaje: 0,
    ofrendas: 0,
    biblias: 0,
    anuncios: '',
    registradoPorUserId: '',
    registradoPorNombre: '',
    notas: '',
  });

  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['numVarones', 'numTotal', 'ofrendas', 'biblias'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleAttendanceChange = (memberId) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const presentCount = Object.values(attendance).filter(v => v).length;
      const classData = {
        ...formData,
        numTotal: presentCount,
        asistenciaTotalPorcentaje: presentCount,
      };

      const classId = await createOrUpdateClass(classData);

      const attendanceRecords = Object.entries(attendance)
        .filter(([_, present]) => present)
        .map(([memberId]) => ({
          classId,
          memberId,
          memberName: '',
          presente: true,
        }));

      if (attendanceRecords.length > 0) {
        await createBatchClassAttendance(attendanceRecords);
      }

      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        maestroId: '',
        maestroNombre: '',
        tema: '',
        numVarones: 0,
        numTotal: 0,
        asistenciaTotalPorcentaje: 0,
        ofrendas: 0,
        biblias: 0,
        anuncios: '',
        registradoPorUserId: '',
        registradoPorNombre: '',
        notas: '',
      });
      setAttendance({});

      if (onClassCreated) onClassCreated();
      alert('Clase registrada exitosamente');
    } catch (err) {
      setError('Error al registrar la clase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="class-form-container">
      <h2>Registrar Nueva Clase</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Datos de la Clase</legend>

          <div className="form-group">
            <label>Fecha:</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Maestro ID:</label>
            <input type="text" name="maestroId" value={formData.maestroId} onChange={handleInputChange} placeholder="ID del maestro" required />
          </div>

          <div className="form-group">
            <label>Nombre del Maestro:</label>
            <input type="text" name="maestroNombre" value={formData.maestroNombre} onChange={handleInputChange} placeholder="Nombre completo" required />
          </div>

          <div className="form-group">
            <label>Tema:</label>
            <input type="text" name="tema" value={formData.tema} onChange={handleInputChange} placeholder="Tema de la clase" required />
          </div>

          <div className="form-group">
            <label>Ofrendas ($):</label>
            <input type="number" name="ofrendas" value={formData.ofrendas} onChange={handleInputChange} min="0" step="0.01" />
          </div>

          <div className="form-group">
            <label>Número de Biblias:</label>
            <input type="number" name="biblias" value={formData.biblias} onChange={handleInputChange} min="0" />
          </div>

          <div className="form-group">
            <label>Anuncios:</label>
            <textarea name="anuncios" value={formData.anuncios} onChange={handleInputChange} placeholder="Anuncios importantes" rows="3"></textarea>
          </div>

          <div className="form-group">
            <label>Registrado por (User ID):</label>
            <input type="text" name="registradoPorUserId" value={formData.registradoPorUserId} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Registrado por (Nombre):</label>
            <input type="text" name="registradoPorNombre" value={formData.registradoPorNombre} onChange={handleInputChange} />
          </div>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar Clase'}
        </button>
      </form>
    </div>
  );
};

export default ClassForm;