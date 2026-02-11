import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { Cake, Users, BookOpen, Calendar, TrendingUp, CheckCircle, XCircle, BarChart3, ClipboardList, Download } from 'lucide-react';
import { memberService } from '../services/memberService';
import { getWeeklyStatistics } from '../services/attendanceStatisticsService';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import { useInstallPrompt } from './InstallPrompt';

const Dashboard = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    baptizedCount: 0,
    maleCount: 0,
    femaleCount: 0,
    weeklyAttendance: 0,
    classesSummary: [],
    recentStats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInstallable, promptInstall } = useInstallPrompt();
const CLASS_ICONS = {
  'soldados': '🛡️ Jóvenes',
    'señoras': '🌸Señoras',
  'caballeros': '👔 Caballeros',
  'matrimonios': '💍 Matrimonios',
  'default': '👥',
  'joyitas': '💎 Joyitas',
   'estrellitas': '⭐ Estrellitas',
   'vencedores': '🏆 Vencedores',
   'jireh': '🐑 Jireh',
    'elohim': '🕊️ Elohim',
   'evangelio': '💡 Luz del evangelio',
    'camino': '🛣️ Jesús es el camino',
     'exploradores': '🧭 Exploradores','Inactive':'X'


   
};
const getIconForClass = (name) => {
  const lowerName = name.toLowerCase();
  const key = Object.keys(CLASS_ICONS).find(k => lowerName.includes(k));
  return CLASS_ICONS[key] || CLASS_ICONS['default'];
};
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  const icon = getIconForClass(name);

  return (
    <text x={x} y={y} fill="#4B5563" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="500">
      {`${icon} : ${(percent * 100).toFixed(0)}% (${value})`}
    </text>
  );
};
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Debe iniciar sesión.');
      return;
    }
    loadDashboardData();
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const members = await memberService.getMembers();
      const maleCount = members?.filter(m => m.sexo === 'M')?.length || 0;
      const femaleCount = members?.filter(m => m.sexo === 'F')?.length || 0;
      const baptized = members.filter(m => m.bautizado === 'Sí').length;

      let weeklyStats = null;
      try { weeklyStats = await getWeeklyStatistics(new Date()); } catch (e) {}

      const classesMap = new Map();
      members.forEach(member => {
        const className = member.clase || 'Sin Clase';
        if (!classesMap.has(className)) {
          classesMap.set(className, { name: className, value: 0, color: getClassColor(className) });
        }
        classesMap.get(className).value++;
      });

      const classesSummary = Array.from(classesMap.values())
        .map(cls => ({ ...cls, percentage: ((cls.value / members.length) * 100).toFixed(1) }))
        .sort((a, b) => b.value - a.value);

      setStats({
        totalMembers: members.length,
        baptizedCount: baptized,
        maleCount,
        femaleCount,
        weeklyAttendance: weeklyStats?.overallAttendanceRate || 0,
        classesSummary,
        recentStats: weeklyStats
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
const VIBRANT_COLORS = [
  '#A63232', // Rojo Canaán Intenso
  '#E68A3E', // Naranja Llama
  '#F2B705', // Oro Brillante
  '#0D9488', // Turquesa Profundo (Contraste)
  '#7C3AED', // Violeta Real (Acento)
  '#DB2777'  // Rosa Fucsia (Acento)
];
  const getClassColor = (name) => {
    const colors = { 'damas': '#A63232', 'caballeros': '#E68A3E', 'jóvenes': '#F2B705', 'niños': '#4A90E2' };
    const key = Object.keys(colors).find(k => name.toLowerCase().includes(k));
    return colors[key] || '#6b7280';
  };

  if (loading) return <div className="dashboard-loading"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>IEDB Canaán</h1>
      </div>

      {/* KPIs Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-label">Miembros</div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-value">{stats.maleCount}</div>
          <div className="stat-label">Varones</div>
        </div>
        <div className="stat-card stat-card-pink">
          <div className="stat-value">{stats.femaleCount}</div>
          <div className="stat-label">Mujeres</div>
        </div>
        {/* <div className="stat-card stat-card-success">
          <div className="stat-value">{stats.baptizedCount}</div>
          <div className="stat-label">Bautizados</div>
        </div> */}
      </div>

      {/* Gráfico de Dona y Resumen Semanal */}
      <div className="section-card chart-section">
         <div className="section-header">
    <h2>Distribución y Asistencia</h2>
  </div>
  
  <div className="chart-layout-wrapper">
    {/* Contenedor relativo para el gráfico y el texto central */}
<div style={{ position: 'relative', width: '100%', height: 300 }}>
  <ResponsiveContainer>
    <PieChart>
      <Tooltip 
    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
  />
   <Pie 
    data={stats.classesSummary} 
    innerRadius={70} 
    outerRadius={90} 
    dataKey="value"
    label={renderCustomizedLabel}
    stroke="none"
    /* Efecto de expansión opcional al hacer hover */
    paddingAngle={5}
  >
    {stats.classesSummary.map((entry, index) => (
      <Cell 
        key={index} 
        fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} 
        style={{ cursor: 'pointer', outline: 'none' }} // Mejora la interacción
      />
    ))}
  </Pie>
    </PieChart>
  </ResponsiveContainer>

  {/* Texto central absoluto */}
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none' // Para que no interfiera con el mouse en el gráfico
  }}>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#A63232' }}>
      {stats.totalMembers}
    </div>
    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
      Miembros
    </div>
  </div>
</div>


  </div>
      </div>

      <div className="section-card chart-section">
        {/* Resumen numérico integrado */}
        {stats.recentStats && (
          <div className="weekly-summary-grid">
            <div className="summary-item">
              <CheckCircle className="icon-present" />
              <div className="summary-value">{stats.recentStats.classesByClass.reduce((s, c) => s + c.totalAttendances, 0)}</div>
              <div className="summary-label">Presentes</div>
            </div>
            <div className="summary-item">
              <XCircle className="icon-absent" />
              <div className="summary-value">{stats.recentStats.classesByClass.reduce((s, c) => s + c.totalAbsences, 0)}</div>
              <div className="summary-label">Ausentes</div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acciones Rápidas */}
      <div className="section-card">
        <div className="section-header"><h2>Acciones Rápidas</h2></div>
        <div className="actions-grid">
          <button className="action-btn action-btn-primary" onClick={() => onNavigate('add-member')}><Users /><span>Nuevo Miembro</span></button>
          <button className="action-btn action-btn-success" onClick={() => onNavigate('classes')}><CheckCircle /><span>Asistencia</span></button>
          <button className="action-btn action-btn-info" onClick={() => onNavigate('statistics')}><TrendingUp /><span>Estadísticas</span></button>
          <button className="action-btn action-btn-warning" onClick={() => onNavigate('cumpleanos')}><Cake /><span>Cumpleaños</span></button>
          <button className="action-btn action-btn-primary" onClick={promptInstall} disabled={!isInstallable}><Download /><span>App</span></button>
          <button className="action-btn action-btn-info" onClick={() => onNavigate('history')}><BarChart3 /><span>Reportes</span></button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;