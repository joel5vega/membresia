import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Info } from "lucide-react";
import './AgeDemographicsSection.css'
// Paleta refinada: Degradados de la marca Canaán
const PALETTE = ["#A63232", "#BC443B", "#D15645", "#E68A3E", "#EB9B5D", "#F0AC7B"];

const AgeDemographicsSection = ({ ageByDecade = [], avgAge }) => {
  const totalPeople = ageByDecade.reduce((acc, curr) => acc + curr.count, 0);
  
  const ageData = ageByDecade.map((item, index) => ({
    range: item.decade,
    label: item.decade.replace('s', ''), // Limpiamos etiquetas (ej: "20s" -> "20")
    count: item.count,
    percentage: totalPeople > 0 ? ((item.count / totalPeople) * 100).toFixed(1) : 0,
    color: PALETTE[index % PALETTE.length],
  }));

  return (
    <div className="stats-card-container premium-card">
      <div className="section-header-inline">
        <div className="header-title-group">
          <h3>Distribución por Edades</h3>
          <p className="header-subtitle">Población total: {totalPeople} miembros</p>
        </div>
        <div className="avg-age-badge-premium">
          <Users size={14} />
          <span>{avgAge != null ? `${avgAge} años promedio` : "N/D"}</span>
        </div>
      </div>

      {/* Gráfico Visual */}
      <div className="age-chart-wrapper" style={{ height: 200, marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ageData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="custom-tooltip-stats">
                      <p className="tooltip-label">{payload[0].payload.range}</p>
                      <p className="tooltip-value">{payload[0].value} personas ({payload[0].payload.percentage}%)</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
              {ageData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Listado Detallado (Más útil que el footer anterior) */}
      <div className="age-details-list">
        {ageData.map((d, i) => (
          <div key={i} className="age-detail-row">
            <div className="row-label">
              <span className="dot-indicator" style={{ backgroundColor: d.color }}></span>
              <span className="age-text">{d.range}</span>
            </div>
            <div className="row-progress-container">
              <div className="row-progress-bg">
                <div className="row-progress-fill" style={{ width: `${d.percentage}%`, backgroundColor: d.color }}></div>
              </div>
              <span className="row-percent">{d.percentage}%</span>
            </div>
            <span className="row-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AgeDemographicsSection;