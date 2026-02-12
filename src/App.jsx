// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  BarChart3,
  Cake,
  Menu,
  X,
} from 'lucide-react';

import MemberForm from './components/MemberForm';
import EditMemberPage from './pages/EditMemberPage';
import MembersListView from './components/MembersListView';
import ClassesAndAttendance from './components/ClassesAndAttendance';
import ClassHistoryView from './components/ClassHistoryView';
import AttendanceStatisticsView from './components/Statistics/AttendanceStatisticsView';
import Dashboard from './components/Dashboard';
import LoginView from './views/LoginView';
import { useAuth } from './context/AuthContext';
import MembresiaIcon from './assets/membresia-icon.png';
import BirthdaysView from './components/BirthdaysView';
import SundaySchoolReportPage from './pages/SundaySchoolReportPage';
import ClassManagementView from './components/ClassManagementView';
import AttendanceSummaryView from './components/Attendance/AttendanceSummaryView';
import InstallPrompt from './components/InstallPrompt';
import { memberService } from './services/memberService';
import AppLoader from './components/AppLoader';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <AppLoader message="Verificando sesión..." />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('panel');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataPreloaded, setIsDataPreloaded] = useState(false);

  const { user, logout, loading: authLoading } = useAuth();
  const username = user?.email?.split('@')[0] || 'Admin';

  // Pre‑cargar miembros
  useEffect(() => {
    const preloadMembers = async () => {
      try {
        await memberService.getMembers();
        setIsDataPreloaded(true);
      } catch (error) {
        console.error('Error pre-loading members:', error);
        setIsDataPreloaded(true);
      }
    };

    if (user && !isDataPreloaded) {
      preloadMembers();
    }
  }, [user, isDataPreloaded]);

  // Ocultar loader cuando auth + datos estén listos
  useEffect(() => {
    if (!authLoading && isDataPreloaded) {
      setIsInitialLoading(false);
    }
  }, [authLoading, isDataPreloaded]);

  if (authLoading || isInitialLoading) {
    return <AppLoader message="Preparando tu panel Canaán..." />;
  }

  const menuItems = [
    { id: 'members', label: 'Miembros', icon: <Users size={22} /> },
    { id: 'classes', label: 'Asistencia', icon: <ClipboardCheck size={22} /> },
    { id: 'statistics', label: 'Estadísticas', icon: <BarChart3 size={22} /> },
    { id: 'cumpleanos', label: 'Cumpleaños', icon: <Cake size={22} /> },
  ];

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Header superior (logo + nombre) */}
      <header className="mobile-header">
        <button
          className="header-brand"
          onClick={() => handleNavigate('panel')}
          aria-label="Ir al Dashboard"
        >
          <img src={MembresiaIcon} alt="Canaán" />
          <span>IEDB CANAÁN</span>
        </button>

        <div className="header-right">
          <button
            className="menu-toggle-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* Menú inmersivo pantalla completa */}
      <div className={`immersive-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <span className="menu-brand-text">MENÚ PRINCIPAL</span>
          <button
            className="close-menu-btn"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={30} />
          </button>
        </div>

        <div className="menu-links-container">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-link-item ${
                currentPage === item.id ? 'active' : ''
              }`}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-text">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="menu-footer">
          <div className="menu-user-profile">
            <div className="user-initial">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{username}</span>
              <button
                className="menu-logout-action"
                onClick={logout}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Área de contenido */}
      <main className="main-content-area">
        <div className="view-transition-wrapper">
          {currentPage === 'panel' && (
            <Dashboard onNavigate={setCurrentPage} />
          )}

          {currentPage === 'members' && (
            <MembersListView onAddMember={() => setCurrentPage('add-member')} />
          )}

          {currentPage === 'add-member' && (
            <MemberForm
              onSuccess={() => setCurrentPage('members')}
              onCancel={() => setCurrentPage('members')}
            />
          )}

          {currentPage === 'classes' && <ClassesAndAttendance />}

          {currentPage === 'statistics' && (
            <div className="view-padding">
              <AttendanceStatisticsView />
            </div>
          )}

          {currentPage === 'attendance-summary' && (
            <div className="view-padding">
              <AttendanceSummaryView />
            </div>
          )}

          {currentPage === 'history' && (
            <div className="view-padding">
              <ClassHistoryView />
            </div>
          )}

          {currentPage === 'cumpleanos' && (
            <BirthdaysView onNavigate={setCurrentPage} />
          )}

          {currentPage === 'escuelaDominicalReport' && (
            <div className="view-padding">
              <SundaySchoolReportPage />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter basename="/membresia">
      <Routes>
        {/* Login público */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/clases" element={<ClassManagementView />} />

        {/* Panel protegido */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/escuela-dominical/report"
          element={<SundaySchoolReportPage />}
        />

        <Route path="/members/:id/edit" element={<EditMemberPage />} />

        {/* Cualquier otra ruta redirige al panel */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <InstallPrompt />
    </BrowserRouter>
  );
};

export default App;
