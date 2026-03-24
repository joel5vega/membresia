import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Users } from "lucide-react";
import './AgeDemographicsSection.css'

const PALETTE = ["#A63232","#BC443B","#D15645","#E68A3E","#EB9B5D","#F0AC7B"];

const AgeDemographicsSection = ({ ageByDecade = [], avgAge }) => {
  const totalPeople = ageByDecade.reduce((acc, curr) => acc + curr.count, 0);

  const ageData = ageByDecade.map((item, index) => ({
    label: item.decade.replace('s', ''),
    count: item.count,
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

      <div style={{ height: 220, marginTop: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ageData} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="custom-tooltip-stats">
                      <p className="tooltip-label">{d.label}s</p>
                      <p className="tooltip-value">{d.count} personas</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: "#f9fafb", fontSize: 11, fontWeight: 700 }}
              />
              {ageData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgeDemographicsSection;