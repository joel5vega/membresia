import React, { useState } from 'react';
import ClassManagement from './Classes/ClassManagement';
import ClassAttendance from './ClassAttendance';
import AttendanceStatisticsView from './Statistics/AttendanceStatisticsView';

const ClassesAndAttendance = () => {
  const [activeTab, setActiveTab] = useState('classes');

  const tabStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '10px',
  };

  const buttonStyle = (isActive) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#1e3a8a' : '#f0f0f0',
    color: isActive ? '#fff' : '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestion de Clases y Asistencia</h1>
      
      <div style={tabStyle}>
        {/* <button
          style={buttonStyle(activeTab === 'classes')}
          onClick={() => setActiveTab('classes')}
        >
          Gestionar Clases
        </button> */}
        <button
          style={buttonStyle(activeTab === 'attendance')}
          onClick={() => setActiveTab('attendance')}
        >
          Registrar Asistencia
        </button>
                <button
          style={buttonStyle(activeTab === 'statistics')}
          onClick={() => setActiveTab('statistics')}
        >
          Estadísticas
        </button>
      </div>

      <div>
        {activeTab === 'classes' && <ClassManagement />}
        {activeTab === 'attendance' && <ClassAttendance />}
                {activeTab === 'statistics' && <AttendanceStatisticsView />}
      </div>
    </div>
  );
};

export default ClassesAndAttendance;