import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Cake, Users, TrendingUp, CheckCircle, BarChart3, Download } from "lucide-react";
import { memberService } from "../services/memberService";
import { getWeeklyStatistics } from "../services/attendanceStatisticsService";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import { useInstallPrompt } from "./InstallPrompt";
import { ageStatsService } from "../services/ageStatsService";
import AgeDemographicsSection from "./AgeDemographicsSection";

const CLASS_ICONS = {
  soldados: "🛡️", señoras: "🌸", caballeros: "👔", matrimonios: "💍",
  default: "👥", joyitas: "💎", estrellitas: "⭐", vencedores: "🏆",
  jireh: "🐑", elohim: "🕊️", evangelio: "💡", camino: "🛣️",
  exploradores: "🧭", Inactive: "✕",
};

const VIBRANT_COLORS = ["#A63232","#E68A3E","#F2B705","#0D9488","#7C3AED","#DB2777","#2563EB","#059669","#DC2626","#D97706"];

const getClassColor = (name) => {
  const colors = { damas: "#A63232", caballeros: "#E68A3E", jóvenes: "#F2B705", niños: "#4A90E2" };
  const key = Object.keys(colors).find((k) => name.toLowerCase().includes(k));
  return colors[key] || "#6b7280";
};

const getIconForClass = (name) => {
  const lowerName = name.toLowerCase();
  const key = Object.keys(CLASS_ICONS).find((k) => lowerName.includes(k));
  return CLASS_ICONS[key] || CLASS_ICONS["default"];
};

const Dashboard = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0, baptizedCount: 0, maleCount: 0, femaleCount: 0,
    weeklyAttendance: 0, classesSummary: [], recentStats: null,
    ageByDecade: [], avgAge: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInstallable, promptInstall } = useInstallPrompt();
// Agrega este estado junto a los otros
const [showLegend, setShowLegend] = useState(false);
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); setError("Debe iniciar sesión."); return; }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const members = await memberService.getMembers();
      const maleCount = members?.filter((m) => m.sexo === "M" || m.genero === "Masculino" || m.genero === "M")?.length || 0;
      const femaleCount = members?.filter((m) => m.sexo === "F" || m.genero === "Femenino" || m.genero === "F")?.length || 0;
      const baptizedCount = members?.filter((m) => m.bautizado === "Sí" || m.bautizado === true)?.length || 0;

      let weeklyStats = null;
      try { weeklyStats = await getWeeklyStatistics(new Date()); } catch (e) {}

      const classesMap = new Map();
      members.forEach((member) => {
        const className = member.clase || "Sin Clase";
        if (!classesMap.has(className)) {
          classesMap.set(className, { name: className, value: 0, color: getClassColor(className) });
        }
        classesMap.get(className).value++;
      });

      const classesSummary = Array.from(classesMap.values())
        .map((cls) => ({ ...cls, percentage: ((cls.value / members.length) * 100).toFixed(1) }))
        .sort((a, b) => b.value - a.value);

      let ageStats = { byDecade: [], totalWithBirthdate: 0 };
      try { ageStats = await ageStatsService.getAgeStatsByDecade(); } catch (e) {}

      const totalPersons = ageStats.totalWithBirthdate || 0;
      const avgAge = totalPersons > 0
        ? Math.round(ageStats.byDecade.reduce((sum, d) => {
            const mid = parseInt(d.decade.split("-")[0], 10) + 5;
            return sum + mid * d.count;
          }, 0) / totalPersons)
        : null;

      setStats({ totalMembers: members.length, baptizedCount, maleCount, femaleCount,
        weeklyAttendance: weeklyStats?.overallAttendanceRate || 0,
        classesSummary, recentStats: weeklyStats, ageByDecade: ageStats.byDecade, avgAge });
    } catch (err) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (<div className="dashboard-loading"><div className="spinner"></div></div>);

  return (
    <div className="dashboard-container">
      {/* KPIs */}
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
        <div className="stat-card stat-card-success">
          <div className="stat-value">
            {stats.recentStats
              ? (stats.recentStats.classesByClass ?? []).reduce((s, c) => s + (c.totalAttendances ?? 0), 0)
              : 0}
          </div>
          <div className="stat-label">Asistencia</div>
        </div>
      </div>

      {/* Clases — Donut + leyenda toggle */}
<div className="section-card chart-section">
  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h2>Clases</h2>
    <button
      className="legend-toggle-btn"
      onClick={() => setShowLegend(prev => !prev)}
    >
      {showLegend ? "Ocultar" : "Ver detalle"}
    </button>
  </div>

  <div className="donut-layout">
    <div className="donut-chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={false}
            contentStyle={{ borderRadius: "10px", border: "none", background: "#1f2937", color: "#f9fafb" }}
            formatter={(value, name) => [`${value} personas`, name]}
          />
          <Pie
            data={stats.classesSummary}
            innerRadius="55%"
            outerRadius="75%"
            dataKey="value"
            stroke="none"
            paddingAngle={3}
          >
            {stats.classesSummary.map((entry, index) => (
              <Cell key={index} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <div className="donut-center-value">{stats.totalMembers}</div>
        <div className="donut-center-label">Total</div>
      </div>
    </div>

    {/* Leyenda colapsable */}
    {showLegend && (
      <div className="donut-legend">
        {stats.classesSummary.map((cls, index) => (
          <div key={index} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: VIBRANT_COLORS[index % VIBRANT_COLORS.length] }}></span>
            <span className="legend-icon">{getIconForClass(cls.name)}</span>
            <span className="legend-name">{cls.name}</span>
            <span className="legend-count">{cls.value}</span>
            <span className="legend-pct">{cls.percentage}%</span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

      {/* Edades */}
      <div className="section-card">
        <AgeDemographicsSection ageByDecade={stats.ageByDecade} avgAge={stats.avgAge} />
      </div>

      {/* Acciones rápidas */}
      <div className="section-card">
        <div className="section-header"><h2>Acciones Rápidas</h2></div>
        <div className="actions-grid">
          <button className="action-btn action-btn-primary" onClick={() => onNavigate("add-member")}><Users /><span>Nuevo Miembro</span></button>
          <button className="action-btn action-btn-success" onClick={() => onNavigate("classes")}><CheckCircle /><span>Asistencia</span></button>
          <button className="action-btn action-btn-info" onClick={() => onNavigate("statistics")}><TrendingUp /><span>Estadísticas</span></button>
          <button className="action-btn action-btn-warning" onClick={() => onNavigate("cumpleanos")}><Cake /><span>Cumpleaños</span></button>
          <button className="action-btn action-btn-primary" onClick={promptInstall} disabled={!isInstallable}><Download /><span>App</span></button>
          <button className="action-btn action-btn-info" onClick={() => onNavigate("history")}><BarChart3 /><span>Reportes</span></button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;