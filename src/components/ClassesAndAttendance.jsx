import React, { useState, useEffect } from 'react';
import MemberAttendance from './MemberAttendance';
import TotalsAttendanceForm from './TotalsAttendanceForm';
import AttendanceStatisticsView from './Statistics/AttendanceStatisticsView';
import FidelityAnalytics from './Statistics/FidelityAnalytics';
import ClassForm from './ClassForm';
import ClassSummaryModal from './Attendance/ClassSummaryModal';
import GeneralSummaryModal from './Attendance/GeneralSummaryModal';
import { useAuth } from '../context/AuthContext';
import { getFidelityStatistics } from '../services/memberStatisticsService';
import './Attendance.css';
import QuickAttendanceModal from './Attendance/QuickAttendanceModal';
export const CLASS_IDS = {
  'Sociedad de Caballeros "Emanuel"':           'caballeros-emanuel',
  'Sociedad de Señoras "Shaddai"':              'senoras-shaddai',
  'Sociedad de Matrimonios jóvenes "Ebenezer"': 'matrimonios-ebenezer',
  'Sociedad de Jóvenes "Soldados de la Fe"':    'SyMu34o00g7c2jawU7XG',
  'Sociedad de prejuveniles "Vencedores"':      'prejuveniles-vencedores',
  'Clase de Exploradores':                      'exploradores',
  'Clase de Estrellitas':                       'estrellitas',
  'Clase de joyitas':                           'joyitas',
  'Av. Jireh':                                  'av-jireh',
  'Av. Luz del evangelio':                      'av-luz',
  'Av. Elohim':                                 'av-elohim',
  'Av. Jesús es el camino':                     'av-jesus',
};

const classOptions = Object.keys(CLASS_IDS).concat(['Inactive']);

const ClassesAndAttendance = () => {
  const [activeTab, setActiveTab]           = useState('member-att');
  const { user }                            = useAuth();
  const [selectedClass, setSelectedClass]   = useState('');
  const [fecha, setFecha]                   = useState(new Date().toISOString().split('T')[0]);
  const [fidelityData, setFidelityData]     = useState(null);
  const [loadingFidelity, setLoadingFidelity] = useState(false);
  const [showClassModal, setShowClassModal]   = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
const [showQuick, setShowQuick] = useState(false);
  useEffect(() => {
    if (!selectedClass) { setFidelityData(null); return; }
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
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
  <button
    className="att-action-btn att-action-btn--quick"
    onClick={() => setShowQuick(true)}
  >
    <span className="material-symbols-outlined">bolt</span>
    Registro Rápido
  </button>
</div>

<QuickAttendanceModal
  isOpen={showQuick}
  onClose={() => setShowQuick(false)}
/>
      {/* Selector global */}
      <div className="form-card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Clase</label>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Seleccione una clase...</option>
              {classOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
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
      {selectedClass && (
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
          <button
            className={`chip ${activeTab === 'fidelity' ? 'active' : ''}`}
            onClick={() => setActiveTab('fidelity')}
          >
            Fidelidad
          </button>
        </div>
      )}

      {/* Contenido */}
      <div className="tab-content">
        {!selectedClass &&
        (activeTab === 'member-att' || activeTab === 'totals-att' || activeTab === 'fidelity') ? (
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
              <div>
                {/* Botones modales */}
                <div className="att-action-buttons">
                  <button
                    className="att-action-btn att-action-btn--class"
                    onClick={() => setShowClassModal(true)}
                  >
                    <span className="material-symbols-outlined">school</span>
                    Resumen de Clase
                  </button>
                  <button
                    className="att-action-btn att-action-btn--general"
                    onClick={() => setShowGeneralModal(true)}
                  >
                    <span className="material-symbols-outlined">church</span>
                    Resumen General
                  </button>
                </div>

                {/* Formulario inline (mismo servicio, misma data) */}
                <TotalsAttendanceForm selectedClass={selectedClass} date={fecha} />
              </div>
            )}

            {activeTab === 'statistics' && (
              <AttendanceStatisticsView selectedClass={selectedClass} date={fecha} />
            )}

            {activeTab === 'fidelity' && (
              loadingFidelity ? (
                <div className="section-card" style={{ padding: '40px' }}>
                  Cargando fidelidad...
                </div>
              ) : (
                <FidelityAnalytics
                  attendanceData={fidelityData?.fidelityStats || []}
                  membersRawList={fidelityData?.memberStats   || []}
                />
              )
            )}

            {activeTab === 'classes' && <ClassForm />}
          </>
        )}
      </div>

      {/* Modales */}
      <ClassSummaryModal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        selectedClass={selectedClass}
        uniqueClassId={CLASS_IDS[selectedClass] || selectedClass}
        date={fecha}
      />

      <GeneralSummaryModal
        isOpen={showGeneralModal}
        onClose={() => setShowGeneralModal(false)}
        date={fecha}
      />
    </div>
  );
};

export default ClassesAndAttendance;