import React, { useState } from 'react';
import MemberAttendance from './MemberAttendance';
import TotalsAttendanceForm from './TotalsAttendanceForm';
import AttendanceStatisticsView from './Statistics/AttendanceStatisticsView';
import ClassForm from './ClassForm';
import { useAuth } from '../context/AuthContext';
import './Attendance.css'; // Asegúrate de haber creado este archivo con el CSS que te pasé

const ClassesAndAttendance = () => {
  // Ahora manejamos 3 estados principales de pestañas
  const [activeTab, setActiveTab] = useState('member-att'); 
  const { user } = useAuth();

  // Estados compartidos para sincronizar la clase y la fecha entre pestañas
  const [selectedClass, setSelectedClass] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const classOptions = [
    'Sociedad de Caballeros "Emanuel"',
    'Sociedad de Señoras "Shaddai"',
    'Sociedad de Matrimonios jóvenes "Ebenezer"',
    'Sociedad de Jóvenes "Soldados de la Fe"',
    'Sociedad de prejuveniles "Vencedores"',
    'Clase de Exploradores',
    'Clase de Estrellitas',
    'Clase de joyitas',
    'Av. Jireh', 'Av. Luz del evangelio', 'Av. Elohim', 'Av. Jesús es el camino'    
  ];

  return (
    <div className="attendance-view">
      <div className="dashboard-header">
        <h1 className="section-title">Gestión de Clases y Asistencia</h1>
      </div>

      {/* Selector Global de Clase y Fecha - Siempre visible para dar contexto */}
      <div className="form-card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Seleccionar Clase</label>
            <select 
              className="form-control"
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Seleccione una clase...</option>
              {classOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Fecha de Registro</label>
            <input 
              className="form-control"
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      {/* Navegación por Pestañas (Chips Estilizados) */}
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
          className={`chip ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Estadísticas
        </button>
      </div>

      {/* Renderizado Condicional de los Componentes */}
      <div className="tab-content">
        {!selectedClass && activeTab !== 'statistics' ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666' }}>Por favor, selecciona una clase y fecha para comenzar el registro.</p>
          </div>
        ) : (
          <>
            {/* 1. Pestaña de Asistencia Individual (Simplificada) */}
            {activeTab === 'member-att' && (
              <MemberAttendance 
                selectedClass={selectedClass} 
                date={fecha} 
              />
            )}

            {/* 2. Pestaña de Totales, Tema, Ofrenda, etc. */}
            {activeTab === 'totals-att' && (
              <TotalsAttendanceForm 
                selectedClass={selectedClass} 
                date={fecha} 
              />
            )}

            {/* 3. Pestaña de Estadísticas */}
            {activeTab === 'statistics' && <AttendanceStatisticsView />}
            
            {/* Pestaña opcional de gestión si decides habilitarla luego */}
            {activeTab === 'classes' && <ClassForm />}
          </>
        )}
      </div>
    </div>
  );
};

export default ClassesAndAttendance;