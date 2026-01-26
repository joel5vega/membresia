// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Cake, Users, BookOpen, Calendar, TrendingUp, CheckCircle, XCircle, BarChart3, User, UserCircle, ClipboardList } from 'lucide-react';
import { memberService } from '../services/memberService';
import { getWeeklyStatistics } from '../services/attendanceStatisticsService';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import ClassHistoryView from './ClassHistoryView';

const Dashboard = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    baptizedCount: 0,
    totalClasses: 0,
    escuelaDominicalCount: 0,
  escuelaDominicalPercentage: 0,
    weeklyAttendance: 0,
    classesSummary: [],
    recentStats: null,
          maleCount: 0,
      femaleCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError('Debe iniciar sesión para ver el dashboard.');
      return;
    }

    loadDashboardData();
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading dashboard data...');
      
      // Cargar miembros usando el servicio
      const members = await memberService.getMembers();
      console.log('Members loaded:', members?.length || 0);

      // Count males and females
      const maleCount = members?.filter(m => m.sexo === 'M')?.length || 0;
      const femaleCount = members?.filter(m => m.sexo === 'F')?.length || 0;

      // Estadísticas de la semana actual
      let weeklyStats = null;
      try {
        weeklyStats = await getWeeklyStatistics(new Date());
        console.log('Weekly stats loaded:', weeklyStats);
      } catch (err) {
        console.warn('Could not load weekly statistics:', err);
      }

      // Calcular bautizados
      const baptized = members.filter(m => m.bautizado === 'Sí').length;
      console.log('Baptized members:', baptized);
      // Calcular asistencia a Escuela Dominical
const attendEscuelaDominical = members.filter(m => m.escuelaDominical === 'Sí').length;
const escuelaDominicalPercentage = members.length > 0 
  ? ((attendEscuelaDominical / members.length) * 100).toFixed(1) 
  : 0;
console.log('Escuela Dominical attendance:', attendEscuelaDominical, 'Percentage:', escuelaDominicalPercentage);

      // Agrupar miembros por clase (usando el campo 'clase' de members)
      const classesMap = new Map();
      members.forEach(member => {
        const className = member.clase || 'Sin Clase';
        if (!classesMap.has(className)) {
          classesMap.set(className, {
            name: className,
            memberCount: 0,
            color: getClassColor(className)
          });
        }
        classesMap.get(className).memberCount++;
      });

      // Convertir a array y calcular porcentajes
      const classesSummary = Array.from(classesMap.values())
        .map(cls => ({
          ...cls,
          percentage: members.length > 0 
            ? ((cls.memberCount / members.length) * 100).toFixed(1) 
            : 0
        }))
        .filter(cls => cls.memberCount > 0)
        .sort((a, b) => b.memberCount - a.memberCount);

      console.log('Classes summary:', classesSummary);

      setStats({
        totalMembers: members.length,
        baptizedCount: baptized,
        escuelaDominicalCount: attendEscuelaDominical,
  escuelaDominicalPercentage: parseFloat(escuelaDominicalPercentage),
          maleCount: maleCount,
        femaleCount: femaleCount,
        totalClasses: classesMap.size,
        weeklyAttendance: weeklyStats?.overallAttendanceRate || 0,
        classesSummary,
        recentStats: weeklyStats
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(error.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getClassColor = (className) => {
    if (!className) return '#6b7280';
    
    const colors = {
      'soldados': '#3b82f6',
      'jóvenes': '#10b981',
      'jovenes': '#10b981',
      'adultos': '#f59e0b',
      'niños': '#ec4899',
      'ninos': '#ec4899',
      'damas': '#8b5cf6',
      'señoras': '#8b5cf6',
      'senoras': '#8b5cf6',
      'caballeros': '#06b6d4',
      'matrimonios': '#f97316',
      'prejuveniles': '#14b8a6',
      'exploradores': '#0ea5e9',
      'estrellitas': '#f472b6',
      'joyitas': '#a78bfa',
      'avanzada': '#84cc16'
    };
    
    const lowerName = className.toLowerCase();
    const key = Object.keys(colors).find(k => lowerName.includes(k));
    return colors[key] || '#6b7280';
  };

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando autenticación...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Sesión requerida</h2>
          <p>Debe iniciar sesión para ver el dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando panel general...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error al cargar el dashboard</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Panel General</h1>
        <p className="dashboard-subtitle">Sistema de Gestión de Membresía</p>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {/* Total Members */}
        <div className="stat-card stat-card-primary">
        
          <div className="stat-content">
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Miembros Totales</div>
          </div>
        </div>

        {/* Baptized */}
        <div className="stat-card stat-card-success">
          
          <div className="stat-content">
            <div className="stat-value">{stats.baptizedCount}</div>
            <div className="stat-label">Bautizados</div>
            {stats.totalMembers > 0 && (
              <div className="stat-detail">
                {((stats.baptizedCount / stats.totalMembers) * 100).toFixed(1)}% del total
              </div>
            )}
          </div>

                
        </div>
{/* Males */}
                <div className="stat-card stat-card-info">
                  {/* <div className="stat-icon-wrapper">
                    <User size={36} stroke="#000000" />
                  </div> */}
                  <div className="stat-content">
                    <div className="stat-value">{stats.maleCount}</div>
                    <div className="stat-label">Varones</div>
                  </div>
                </div>

                {/* Females */}
                <div className="stat-card stat-card-pink">
                  {/* <div className="stat-icon-wrapper">
                    <span style={{fontSize: '2rem'}}>👩</span>
                  </div> */}
                  <div className="stat-content">
                    <div className="stat-value">{stats.femaleCount}</div>
                    <div className="stat-label">Mujeres</div>
                  </div>
                </div>
        {/* Active Classes */}
        <div className="stat-card stat-card-info">
          {/* <div className="stat-icon-wrapper">
            <BookOpen size={36} />
          </div> */}
          <div className="stat-content">
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-label">Clases Activas</div>
          </div>
        </div>

        {/* Weekly Attendance */}
        <div className="stat-card stat-card-warning">
          {/* <div className="stat-icon-wrapper">
            <TrendingUp size={36} />
          </div> */}
          <div className="stat-content">
            <div className="stat-value">{stats.weeklyAttendance.toFixed(1)}%</div>
            <div className="stat-label">Asistencia Semanal</div>
          </div>
        </div>
          {/* NEW: Escuela Dominical */}
  <div className="stat-card stat-card-purple">
    {/* <div className="stat-icon-wrapper">
      <BookOpen size={36} />
    </div> */}
    <div className="stat-content">
      <div className="stat-value">{stats.escuelaDominicalPercentage}%</div>
      <div className="stat-label">Escuela Dominical</div>
      <div className="stat-detail">
        {stats.escuelaDominicalCount} de {stats.totalMembers} miembros
      </div>
    </div>
  </div>
      </div>

      {/* Classes Distribution */}
      {stats.classesSummary.length > 0 ? (
        <div className="section-card">
          <div className="section-header">
            <h2>Distribución por Clase</h2>
          </div>
          <div className="classes-grid">
            {stats.classesSummary.map((cls, index) => (
              <div 
                key={index} 
                className="class-card"
                style={{ '--class-color': cls.color }}
              >
                <div className="class-header">
                  <span className="class-name">{cls.name}</span>
                  <span className="class-badge">
                    {cls.memberCount}
                  </span>
                </div>
                <div className="class-progress-wrapper">
                  <div className="class-progress-bar">
                    <div 
                      className="class-progress-fill"
                      style={{ width: `${cls.percentage}%` }}
                    />
                  </div>
                  <span className="class-percentage">{cls.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="section-card">
          <p className="no-data">No hay clases con miembros asignados</p>
        </div>
      )}

      {/* Weekly Summary */}
      {stats.recentStats && stats.recentStats.classesByClass && stats.recentStats.classesByClass.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h2>Resumen de la Semana</h2>
          </div>
          <div className="weekly-summary-grid">
            <div className="summary-item">
              <CheckCircle size={24} className="icon-present" />
              <div>
                <div className="summary-value">
                  {stats.recentStats.classesByClass.reduce((sum, cls) => sum + cls.totalAttendances, 0)}
                </div>
                <div className="summary-label">Presentes</div>
              </div>
            </div>
            <div className="summary-item">
              <XCircle size={24} className="icon-absent" />
              <div>
                <div className="summary-value">
                  {stats.recentStats.classesByClass.reduce((sum, cls) => sum + cls.totalAbsences, 0)}
                </div>
                <div className="summary-label">Ausentes</div>
              </div>
            </div>
            <div className="summary-item">
              <Calendar size={24} className="icon-justified" />
              <div>
                <div className="summary-value">
                  {stats.recentStats.classesByClass.reduce((sum, cls) => sum + cls.totalJustified, 0)}
                </div>
                <div className="summary-label">Justificados</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2>Acciones Rápidas</h2>
        </div>
        <div className="actions-grid">
          <button 
            className="action-btn action-btn-primary"
            onClick={() => onNavigate && onNavigate('add-member')}
          >
            <Users size={24} />
            <span>Nuevo Miembro</span>
          </button>
          <button 
            className="action-btn action-btn-success"
            onClick={() => onNavigate && onNavigate('classes')}
          >
            <CheckCircle size={24} />
            <span>Tomar Asistencia</span>
          </button>
          <button 
            className="action-btn action-btn-info"
            onClick={() => onNavigate('statistics')}
          >
<TrendingUp size={24} />
            <span>Ver Estadísticas</span>

          </button>
                       
                    <button
          className="action-btn action-btn-success"
                      onClick={() => onNavigate('cumpleanos')}
        >
          <Cake size={24} />
          <span>Cumpleaños</span>
        </button>
        <button
              className="action-btn action-btn-info"
              onClick={() => onNavigate && onNavigate('attendance-summary')}
            >
              <ClipboardList size={24} />
              <span>Ver resumen de asistencia</span>
            </button>
          <button 
            className="action-btn action-btn-warning"
            onClick={() => onNavigate && onNavigate('members')}
          >
            <BookOpen size={24} />
            <span>Ver Miembros</span>
          </button>
          <button
  className="action-btn action-btn-warning"
  onClick={() => onNavigate('escuelaDominicalReport')}
>
  <BookOpen size={24} />
  <span>Informe Escuela Dominical</span>
</button>
 <button
              className="action-btn action-btn-warning"
                          onClick={() => onNavigate('history')}
            >
              <BarChart3 size={24} />
              <span> Reportes</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
