import React, { useState, useEffect } from 'react';
import MemberAttendance from './MemberAttendance';
import TotalsAttendanceForm from './TotalsAttendanceForm';
import AttendanceStatisticsView from './Statistics/AttendanceStatisticsView';
import FidelityAnalytics from './Statistics/FidelityAnalytics';
import ClassForm from './ClassForm';
import { useAuth } from '../context/AuthContext';
import { getFidelityStatistics } from '../services/memberStatisticsService';
import './Attendance.css';

const ClassesAndAttendance = () => {
  const [activeTab, setActiveTab] = useState('member-att');
  const { user } = useAuth();

  const [selectedClass, setSelectedClass] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Datos para pestaña de Fidelidad
  const [fidelityData, setFidelityData] = useState(null);
  const [loadingFidelity, setLoadingFidelity] = useState(false);

  const classOptions = [
    'Sociedad de Caballeros "Emanuel"',
    'Sociedad de Señoras "Shaddai"',
    'Sociedad de Matrimonios jóvenes "Ebenezer"',
    'Sociedad de Jóvenes "Soldados de la Fe"',
    'Sociedad de prejuveniles "Vencedores"',
    'Clase de Exploradores',
    'Clase de Estrellitas',
    'Clase de joyitas',
    'Av. Jireh',
    'Av. Luz del evangelio',
    'Av. Elohim',
    'Av. Jesús es el camino',
    'Inactive',
  ];

  // Cargar fidelidad cuando haya clase seleccionada
  useEffect(() => {
    if (!selectedClass) {
      setFidelityData(null);
      return;
    }

    const fetchFidelity = async () => {
      try {
        setLoadingFidelity(true);
        const data = await getFidelityStatistics(selectedClass);
        setFidelityData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFidelity(false);
      }
    };

    fetchFidelity();
  }, [selectedClass]);

  return (
    <div className="attendance-view">
      <div className="dashboard-header">
        <h1 className="section-title">Clases y Asistencia</h1>
      </div>

      {/* Selector global */}
      <div className="form-card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label> Clase</label>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Seleccione una clase...</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Fecha</label>
            <input
              className="form-control"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      {selectedClass&&
      <div className="filter-chips" style={{ marginBottom: '20px', borderBottom: 'none' }}>
        <button
          className={`chip ${activeTab === 'member-att' ? 'active' : ''}`}
          onClick={() => setActiveTab('member-att')}
        >
          Lista
        </button>
        <button
          className={`chip ${activeTab === 'totals-att' ? 'active' : ''}`}
          onClick={() => setActiveTab('totals-att')}
        >
          Asistencia total
        </button>
        {/* <button
          className={`chip ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Estadísticas
        </button> */}
        <button
          className={`chip ${activeTab === 'fidelity' ? 'active' : ''}`}
          onClick={() => setActiveTab('fidelity')}
        >
          Fidelidad
        </button>
      </div>
}
      {/* Contenido */}
      <div className="tab-content">
        {!selectedClass &&
        (activeTab === 'member-att' ||
          activeTab === 'totals-att' ||
          activeTab === 'fidelity') ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666' }}>
              Por favor, selecciona una clase y fecha para comenzar el registro.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'member-att' && (
              <MemberAttendance selectedClass={selectedClass} date={fecha} />
            )}

            {activeTab === 'totals-att' && (
              <TotalsAttendanceForm selectedClass={selectedClass} date={fecha} />
            )}

            {activeTab === 'statistics' && (
              <AttendanceStatisticsView
                selectedClass={selectedClass}
                date={fecha}
              />
            )}

            {activeTab === 'fidelity' && (
              loadingFidelity ? (
                <div className="section-card" style={{ padding: '40px' }}>
                  Cargando fidelidad...
                </div>
              ) : (
                <FidelityAnalytics
                  attendanceData={fidelityData?.fidelityStats || []}
                  membersRawList={fidelityData?.memberStats || []}
                />
              )
            )}

            {activeTab === 'classes' && <ClassForm />}
          </>
        )}
      </div>
    </div>
  );
};

export default ClassesAndAttendance;
