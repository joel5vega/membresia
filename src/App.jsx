import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MemberForm from './components/MemberForm';
import MembersListView from './components/MembersListView';
import ClassesAndAttendance from './components/ClassesAndAttendance';
import ClassHistoryView from './components/ClassHistoryView';
import AttendanceStatisticsView from './components/Statistics/AttendanceStatisticsView';  // ← IMPORTAR
import Dashboard from './components/Dashboard';
import LoginView from './views/LoginView';
import { useAuth } from './context/AuthContext';
import MembresiaIcon from './assets/membresia-icon.png';
import BirthdaysView from './components/BirthdaysView'
import SundaySchoolReportPage from "./pages/SundaySchoolReportPage";
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando autenticación...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('panel');
  const { user, logout } = useAuth();
  const username = user?.email ? user.email.split('@')[0] : ''; 

  const buttonStyle = (isActive) => ({
    backgroundColor: isActive ? '#1e40af' : '#1e3a8a',
    color: 'white',
    border: '1px solid white',
    padding: '8px 16px',
    cursor: 'pointer',
    marginRight: '8px',
    borderRadius: '4px',
    fontSize: '14px',
  });

  const navStyle = {
    backgroundColor: '#1e3a8a',
    color: 'white',
    padding: '12px 20px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const leftNavStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const rightNavStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const contentStyle = {
    padding: '0',
    flex: 1,
    overflow: 'auto',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  };

  return (
    <div style={containerStyle}>
      {/* Navigation Bar */}
      <nav style={navStyle}>
        <div style={leftNavStyle}>
          <button
            onClick={() => setCurrentPage('panel')}
            style={{
              ...buttonStyle(currentPage === 'panel'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            aria-label="Panel de miembros"
          >
            <img
              src={MembresiaIcon}
              alt=""
              style={{ height: '32px', width: '32px', display: 'block' }}
            />
          </button>

          <button
            onClick={() => setCurrentPage('members')}
            style={buttonStyle(currentPage === 'members')}
          >
            Miembros
          </button>

          <button
            onClick={() => setCurrentPage('classes')}
            style={buttonStyle(currentPage === 'classes')}
          >
            Clases
          </button>

          {/* ← NUEVO BOTÓN DE ESTADÍSTICAS
          <button
            onClick={() => setCurrentPage('statistics')}
            style={buttonStyle(currentPage === 'statistics')}
          >
            Estadísticas
          </button> */}
        </div>

        {/* info de usuario y logout */}
        <div style={rightNavStyle}>
          <span>{username}</span>
          <button
            onClick={logout}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <span style={{ fontSize: '18px' }}>⏏️</span>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <div style={contentStyle}>
        {/* Panel Principal con Dashboard */}
        {currentPage === 'panel' && <Dashboard onNavigate={setCurrentPage} />}
        
        {/* Miembros */}
        {currentPage === 'members' && (
          <MembersListView
            onAddMember={() => setCurrentPage('add-member')}
          />
        )}
        
        {/* Agregar Miembro */}
        {currentPage === 'add-member' && (
          <MemberForm
            onSuccess={() => setCurrentPage('members')}
            onCancel={() => setCurrentPage('members')}
          />
        )}
        
        {/* Clases y Asistencia */}
        {currentPage === 'classes' && <ClassesAndAttendance />}
        
        {/* ← NUEVA PÁGINA DE ESTADÍSTICAS */}
        {currentPage === 'statistics' && (
          <div style={{ padding: '20px' }}>
            <AttendanceStatisticsView />
          </div>
        )}
        {/* Historiales y Reportes */}
        {currentPage === 'history' && (
          <div style={{ padding: '20px' }}>
            <ClassHistoryView />
          </div>
        )}
                {/* Cumpleaños */}
        {currentPage === 'cumpleanos' && (
          <BirthdaysView onNavigate={setCurrentPage} />
        )}
       
       {/* Informe Escuela Dominical */}
{currentPage === 'escuelaDominicalReport' && (
  <div style={{ padding: '20px' }}>
    <SundaySchoolReportPage />
  </div>
)}

      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter basename="/membresia">
      <Routes>
        {/* Login público */}
        <Route path="/login" element={<LoginView />} />

        {/* Todo el "panel" protegido */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
<Route path="/escuela-dominical/report" element={<SundaySchoolReportPage />} />
        {/* Cualquier otra ruta redirige al panel (protegido) */}
        <Route path="*" element={<Navigate to="/" replace />} />

        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
