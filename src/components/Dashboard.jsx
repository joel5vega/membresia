import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import {
  Cake,
  Users,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Download,
} from "lucide-react";
import { memberService } from "../services/memberService";
import { getWeeklyStatistics } from "../services/attendanceStatisticsService";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import { useInstallPrompt } from "./InstallPrompt";
import { ageStatsService } from "../services/ageStatsService";
import AgeDemographicsSection from "./AgeDemographicsSection";

const CLASS_ICONS = {
  soldados: "🛡️ Jóv",
  señoras: "🌸Señ",
  caballeros: "👔 Cab",
  matrimonios: "💍 Mat",
  default: "👥",
  joyitas: "💎 Joy",
  estrellitas: "⭐ Est",
  vencedores: "🏆 Ven",
  jireh: "🐑 Jir",
  elohim: "🕊️ Elo",
  evangelio: "💡Luz",
  camino: "🛣️ Jes",
  exploradores: "🧭 Exp",
  Inactive: "X",
};

const VIBRANT_COLORS = [
  "#A63232",
  "#E68A3E",
  "#F2B705",
  "#0D9488",
  "#7C3AED",
  "#DB2777",
];

const getClassColor = (name) => {
  const colors = {
    damas: "#A63232",
    caballeros: "#E68A3E",
    jóvenes: "#F2B705",
    niños: "#4A90E2",
  };
  const key = Object.keys(colors).find((k) =>
    name.toLowerCase().includes(k)
  );
  return colors[key] || "#6b7280";
};

const getIconForClass = (name) => {
  const lowerName = name.toLowerCase();
  const key = Object.keys(CLASS_ICONS).find((k) =>
    lowerName.includes(k)
  );
  return CLASS_ICONS[key] || CLASS_ICONS["default"];
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  value,
  name,
  percent,
}) => {
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
  const icon = getIconForClass(name);

  return (
    <text
      x={x}
      y={y}
      fill="#f9fafb"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={2}
      paintOrder="stroke"
    >
      {`${icon} : ${(percent * 100).toFixed(0)}% (${value})`}
    </text>
  );
};

const Dashboard = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    baptizedCount: 0,
    maleCount: 0,
    femaleCount: 0,
    weeklyAttendance: 0,
    classesSummary: [],
    recentStats: null,
    ageByDecade: [],
    avgAge: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInstallable, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError("Debe iniciar sesión.");
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const members = await memberService.getMembers();
      console.log("📊 [Dashboard] Miembros recibidos:", members.length);

      const maleCount =
        members?.filter(
          (m) =>
            m.sexo === "M" ||
            m.genero === "Masculino" ||
            m.genero === "M"
        )?.length || 0;

      const femaleCount =
        members?.filter(
          (m) =>
            m.sexo === "F" ||
            m.genero === "Femenino" ||
            m.genero === "F"
        )?.length || 0;

      const baptizedCount =
        members?.filter(
          (m) => m.bautizado === "Sí" || m.bautizado === true
        )?.length || 0;

      console.log(
        `👥 [STATS] Varones: ${maleCount}, Mujeres: ${femaleCount}, Bautizados: ${baptizedCount}, Total: ${members.length}`
      );

      let weeklyStats = null;
      try {
        weeklyStats = await getWeeklyStatistics(new Date());
      } catch (e) {
        console.warn("⚠️ Error obteniendo estadísticas semanales:", e);
      }

      // Clases
      const classesMap = new Map();
      members.forEach((member) => {
        const className = member.clase || "Sin Clase";
        if (!classesMap.has(className)) {
          classesMap.set(className, {
            name: className,
            value: 0,
            color: getClassColor(className),
          });
        }
        classesMap.get(className).value++;
      });

      const classesSummary = Array.from(classesMap.values())
        .map((cls) => ({
          ...cls,
          percentage: (
            (cls.value / members.length) *
            100
          ).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value);

      // Edades
      const ageStats = await ageStatsService.getAgeStatsByDecade();

      const totalPersons = ageStats.totalWithBirthdate || 0;
      const avgAge =
        totalPersons > 0
          ? Math.round(
              ageStats.byDecade.reduce((sum, d) => {
                const decadeStart = parseInt(
                  d.decade.split("-")[0],
                  10
                );
                const mid = decadeStart + 5;
                return sum + mid * d.count;
              }, 0) / totalPersons
            )
          : null;

      setStats({
        totalMembers: members.length,
        baptizedCount,
        maleCount,
        femaleCount,
        weeklyAttendance:
          weeklyStats?.overallAttendanceRate || 0,
        classesSummary,
        recentStats: weeklyStats,
        ageByDecade: ageStats.byDecade,
        avgAge,
      });
    } catch (err) {
      console.error("loadDashboardData error", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );

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
        {stats.recentStats && (
          <div className="stat-card stat-card-pink">
            <div className="stat-value">
              {(stats.recentStats.classesByClass ?? []).reduce(
                (s, c) => s + (c.totalAttendances ?? 0),
                0
              )}
            </div>
            <div className="stat-label">Asistencia semanal</div>
          </div>
        )}
      </div>

      {/* Clases */}
      <div className="section-card chart-section">
        <div className="section-header">
          <h2>Clases</h2>
        </div>

        <div className="chart-layout-wrapper">
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 300,
            }}
          >
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Pie
                  data={stats.classesSummary}
                  innerRadius={70}
                  outerRadius={90}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  stroke="none"
                  paddingAngle={5}
                >
                  {stats.classesSummary.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        VIBRANT_COLORS[
                          index % VIBRANT_COLORS.length
                        ]
                      }
                      style={{
                        cursor: "pointer",
                        outline: "none",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro del donut */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "var(--canaan-red)",
                }}
              >
                {stats.totalMembers}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                }}
              >
                Miembros
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edades */}
      <div className="section-card">
        <AgeDemographicsSection
          ageByDecade={stats.ageByDecade}
          avgAge={stats.avgAge}
        />
      </div>

      {/* Acciones rápidas */}
      <div className="section-card">
        <div className="section-header">
          <h2>Acciones Rápidas</h2>
        </div>
        <div className="actions-grid">
          <button
            className="action-btn action-btn-primary"
            onClick={() => onNavigate("add-member")}
          >
            <Users />
            <span>Nuevo Miembro</span>
          </button>
          <button
            className="action-btn action-btn-success"
            onClick={() => onNavigate("classes")}
          >
            <CheckCircle />
            <span>Asistencia</span>
          </button>
          <button
            className="action-btn action-btn-info"
            onClick={() => onNavigate("statistics")}
          >
            <TrendingUp />
            <span>Estadísticas</span>
          </button>
          <button
            className="action-btn action-btn-warning"
            onClick={() => onNavigate("cumpleanos")}
          >
            <Cake />
            <span>Cumpleaños</span>
          </button>
          <button
            className="action-btn action-btn-primary"
            onClick={promptInstall}
            disabled={!isInstallable}
          >
            <Download />
            <span>App</span>
          </button>
          <button
            className="action-btn action-btn-info"
            onClick={() => onNavigate("history")}
          >
            <BarChart3 />
            <span>Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
