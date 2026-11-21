import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Home, Users, ClipboardCheck, BarChart3, Cake, Network, History, FileText, Menu, X, LogOut,
} from 'lucide-react';

import MemberForm from './components/MemberForm';
import EditMemberPage from './pages/EditMemberPage';
import MembersListView from './components/MembersListView';
import ClassesAndAttendance from './components/ClassesAndAttendance';
import ClassHistoryView from './components/ClassHistoryView';
import AttendanceStatisticsView from './components/Statistics/AttendanceStatisticsView';
import Dashboard from './components/Dashboard';
import BirthdaysView from './components/BirthdaysView';
import SundaySchoolReportPage from './pages/SundaySchoolReportPage';
import PublicBirthdays from './pages/PublicBirthdays';
import ClassManagementView from './components/ClassManagementView';
import AttendanceSummaryView from './components/Attendance/AttendanceSummaryView';
import AttendanceHistoryView from './components/Attendance/AttendanceHistoryView';
import BulkAttendanceForm from './components/Attendance/BulkAttendanceForm';
import GenogramaView from './components/Genograma/GenogramaView';
import FamiliasView from './components/Genograma/FamiliasView';
import ClanesGraphView from './components/Genograma/ClanesGraphView';
import InstallPrompt from './components/InstallPrompt';
import AppLoader from './components/AppLoader';
import LoginView from './views/LoginView';
import { useAuth } from './context/AuthContext';
import { memberService } from './services/memberService';
import MembresiaIcon from './assets/membresia-icon.png';
import './App.css';

/* ── Navegación: una sola fuente de verdad ── */
const MENU = [
  { id: 'panel',              label: 'Inicio',         icon: Home,           tile: 't-blue' },
  { id: 'members',            label: 'Miembros',       icon: Users,          tile: 't-red' },
  { id: 'classes',            label: 'Asistencia',     icon: ClipboardCheck, tile: 't-green' },
  { id: 'statistics',         label: 'Estadísticas',   icon: BarChart3,      tile: 't-purple' },
  { id: 'cumpleanos',         label: 'Cumpleaños',     icon: Cake,           tile: 't-orange' },
  { id: 'clanes',             label: 'Familias',       icon: Network,        tile: 't-teal' },
  { id: 'attendance-history', label: 'Historial',      icon: History,        tile: 't-purple' },
  { id: 'bulk-attendance',    label: 'Ingreso masivo', icon: FileText,       tile: 't-green' },
];

const EXTRA_TITLES = {
  'add-member': 'Nuevo miembro', history: 'Reportes', 'attendance-summary': 'Resumen',
  escuelaDominicalReport: 'Informe dominical',
};

const pad = (el) => <div className="view-padding">{el}</div>;

const VIEWS = {
  panel:                  ({ go }) => <Dashboard onNavigate={go} />,
  members:                ({ go }) => <MembersListView onAddMember={() => go('add-member')} />,
  'add-member':           ({ go }) => <MemberForm onSuccess={() => go('members')} onCancel={() => go('members')} />,
  classes:                () => <ClassesAndAttendance />,
  statistics:             () => pad(<AttendanceStatisticsView />),
  'attendance-summary':   () => pad(<AttendanceSummaryView />),
  'attendance-history':   () => pad(<AttendanceHistoryView />),
  'bulk-attendance':      () => pad(<BulkAttendanceForm />),
  history:                () => pad(<ClassHistoryView />),
  cumpleanos:             ({ go }) => <BirthdaysView onNavigate={go} />,
  escuelaDominicalReport: () => pad(<SundaySchoolReportPage />),
  clanes:                 () => <FamiliasView />,
};

const titleOf = (id) => MENU.find((m) => m.id === id)?.label || EXTRA_TITLES[id] || '';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader message="Verificando sesión..." />;
  return user ? children : <Navigate to="/login" replace />;
}

/* ── Shell ── */
const AppLayout = () => {
  const [page, setPage] = useState('panel');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataPreloaded, setIsDataPreloaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparando tu panel Canaán...');
  const { user, logout, loading: authLoading } = useAuth();
  const username = user?.email?.split('@')[0] || 'Admin';

  // Precarga: llena la caché compartida una sola vez
  useEffect(() => {
    if (!user || isDataPreloaded) return;
    (async () => {
      try {
        const hasCache = await memberService.hasCache();
        setLoadingMessage(hasCache ? 'Cargando datos de memoria...' : 'Descargando datos...');
        await memberService.getMembers();
      } catch (error) {
        console.error('[App] Error pre-loading members:', error);
      } finally {
        setIsDataPreloaded(true);
      }
    })();
  }, [user, isDataPreloaded]);

  useEffect(() => {
    if (!authLoading && isDataPreloaded) setIsInitialLoading(false);
  }, [authLoading, isDataPreloaded]);

  if (authLoading || isInitialLoading) return <AppLoader message={loadingMessage} />;

  const go = (id) => { setPage(id); setMenuOpen(false); window.scrollTo(0, 0); };
  const View = VIEWS[page] || VIEWS.panel;

  return (
    <div className="app-shell">
      <header className="mt-appbar">
        <button className="mt-appbar__brand" onClick={() => go('panel')} aria-label="Ir al inicio">
          <img src={MembresiaIcon} alt="" />
          <div style={{ minWidth: 0 }}>
            <p className="mt-label" style={{ margin: 0 }}>IEDB Canaán</p>
            <h1 className="mt-appbar__title">{titleOf(page)}</h1>
          </div>
        </button>
        <button className="mt-btn mt-btn--icon" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
          <Menu size={28} />
        </button>
      </header>

      <nav className={`mt-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mt-menu__head">
          <p className="mt-label">Menú</p>
          <button className="mt-btn mt-btn--icon" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <X size={28} />
          </button>
        </div>

        <div className="mt-tiles">
          {MENU.map(({ id, label, icon: Icon, tile }) => (
            <button key={id} className={`mt-tile ${tile}`} onClick={() => go(id)}
                    aria-current={page === id ? 'page' : undefined}
                    style={page === id ? { outline: '3px solid #fff', outlineOffset: -3 } : undefined}>
              <Icon className="mt-tile__icon" size={32} />
              <span className="mt-tile__name">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-menu__user">
          <div>
            <p className="mt-label" style={{ margin: 0 }}>Sesión</p>
            <strong style={{ fontSize: '1.2rem', fontWeight: 300 }}>{username}</strong>
          </div>
          <button className="mt-btn mt-btn--accent" onClick={logout}><LogOut size={16} /> Salir</button>
        </div>
      </nav>

      <main className="main-content-area">
        <div className="view-transition-wrapper"><View go={go} /></div>
      </main>
    </div>
  );
};

/* ── Rutas ── */
const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
const isPublic = () => window.location.pathname.endsWith('/cumpleanos');

const App = () => (
  <BrowserRouter basename="/membresia">
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/cumpleanos" element={<PublicBirthdays />} />   {/* pública */}
      <Route path="/" element={guard(<AppLayout />)} />
      <Route path="/clases" element={guard(<ClassManagementView />)} />
      <Route path="/escuela-dominical/report" element={guard(<SundaySchoolReportPage />)} />
      <Route path="/members/:id/edit" element={guard(<EditMemberPage />)} />
      <Route path="/members/:id/genograma" element={guard(<GenogramaView />)} />
      <Route path="/clanes" element={guard(<FamiliasView />)} />
      <Route path="/constelacion" element={guard(<ClanesGraphView />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {!isPublic() && <InstallPrompt />}
  </BrowserRouter>
);

export default App;