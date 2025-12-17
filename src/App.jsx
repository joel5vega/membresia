import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MemberForm from './components/MemberForm';
import MembersListView from './components/MembersListView';
import ClassesAndAttendance from './components/ClassesAndAttendance';
import LoginView from './views/LoginView';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando autenticación...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('panel');
  const { user, logout } = useAuth();

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
    padding: '20px',
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
            style={buttonStyle(currentPage === 'panel')}
          >
            Panel
          </button>
          <button
            onClick={() => setCurrentPage('members')}
            style={buttonStyle(currentPage === 'members')}
          >
            Miembros
          </button>
          <button
            onClick={() => setCurrentPage('add-member')}
            style={buttonStyle(currentPage === 'add-member')}
          >
            Nuevo Miembro
          </button>
          <button
            onClick={() => setCurrentPage('classes')}
            style={buttonStyle(currentPage === 'classes')}
          >
            Clases
          </button>
          <button
            onClick={() => setCurrentPage('attendance')}
            style={buttonStyle(currentPage === 'attendance')}
          >
            Asistencia
          </button>
        </div>

        {/* info de usuario y logout */}
        <div style={rightNavStyle}>
          <span>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <div style={contentStyle}>
        {currentPage === 'panel' && (
          <div>
            <h1>Panel Principal</h1>
            <p>Bienvenido a IglesiaFlow - Gestión de Iglesia</p>
            <p>Selecciona una opción del menú superior para comenzar.</p>
          </div>
        )}
        {currentPage === 'members' && <MembersListView />}
        {currentPage === 'add-member' && (
          <MemberForm
            onSuccess={() => setCurrentPage('panel')}
            onCancel={() => setCurrentPage('panel')}
          />
        )}
        {currentPage === 'classes' && <ClassesAndAttendance />}
        {currentPage === 'attendance' && (
          <div>
            <h1>Registro de Asistencia</h1>
            <p>Aquí se puede registrar la asistencia de los miembros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
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

        {/* Cualquier otra ruta redirige al panel (protegido) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;