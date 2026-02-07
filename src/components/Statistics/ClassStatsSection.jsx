
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ClassStatsSection = ({ statistics }) => {
  const data = Object.entries(statistics.classesByName || {}).map(([name, stats]) => ({
    name: name.split('"')[1] || name,
    rate: parseFloat(stats.attendanceRate.toFixed(1))
  }));

  const COLORS = ['#A63232', '#E68A3E', '#F2B705', '#0D9488', '#7C3AED'];

  return (
    <div className="stats-card-container">
      <h3>Rendimiento por Clase (%)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" width={100} fontSize={12} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClassStatsSection;