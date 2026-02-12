import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Droplet, Heart, Zap, Award, Star, BookOpen, Users, UserCheck, Smile } from 'lucide-react';

// Diccionario de Iconos para Insights
const ICON_MAP = {
  'bautizado': <Droplet className="text-blue-500" />,
  'no-bautizado': <Droplet className="text-gray-300" />,
  'evangelista': <Zap className="text-yellow-500" />,
  'servicio': <Users className="text-teal-500" />,
  'enseñanza': <BookOpen className="text-indigo-500" />,
  'liderazgo': <Award className="text-orange-500" />,
  'fe': <Star className="text-yellow-400" />,
  'sabiduria': <UserCheck className="text-purple-500" />,
  'casado': <Heart className="text-pink-500" />,
  'soltero': <Smile className="text-green-500" />,
  'default': <Star className="text-gray-400" />
};

const getIcon = (type) => ICON_MAP[type.toLowerCase()] || ICON_MAP['default'];

const InsightCard = ({ title, value, type }) => (
  <div className="insight-card">
    <div className="insight-icon-wrapper">{getIcon(type)}</div>
    <div className="insight-content">
      <span className="insight-value">{value}</span>
      <span className="insight-label">{title}</span>
    </div>
  </div>
);

const MemberStatsSection = ({ statistics, memberStatsExtra, selectedClass, setSelectedClass }) => {
  const classStats = selectedClass && memberStatsExtra?.byClass ? memberStatsExtra.byClass[selectedClass] : null;

  // Lógica robusta para el nombre
  const getDisplayName = (m) => {
    if (m.nombreCompleto) return m.nombreCompleto;
    if (m.nombre && m.apellido) return `${m.nombre} ${m.apellido}`;
    return m.memberName?.replace(/^Member-/, '').replace(/-\d+$/, '') || 'Miembro';
  };

  // Datos para el gráfico de Dones
  const giftData = classStats?.donesEspirituales 
    ? Object.entries(classStats.donesEspirituales).map(([name, count]) => ({
        name: name,
        cantidad: count
      })).sort((a, b) => b.cantidad - a.cantidad)
    : [];

 const COLORS = [
  'var(--canaan-red)',    // antes '#A63232'
  'var(--canaan-orange)', // antes '#E68A3E'
  '#F2B705',              // puedes crear var(--canaan-gold-strong) si quieres
  '#0D9488',
  '#7C3AED',
];

  return (
    <div className="member-stats-section">
      
      

      {/* 2. Fortalezas Espirituales y Demografía */}
      <section className="stats-card-container">
        <div className="section-header-inline">
          <h3>Análisis de la Clase</h3>
          <select 
            className="form-control-sm" 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {Object.keys(statistics.classesByName || {}).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {classStats ? (
          <>
            {/* Gráfico de Barras */}
            <div className="gift-chart-wrapper" style={{ height: 220, marginTop: '15px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={giftData} layout="vertical" margin={{ left: 5, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} fontSize={11} tick={{ fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={12}>
                    {giftData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cuadrícula de Insights */}
            <div className="insights-grid" style={{ marginTop: '20px' }}>
              <InsightCard title="Bautizados" value={classStats.baptizedCount} type="bautizado" />
              <InsightCard title="No Bautizados" value={classStats.unBaptizedCount} type="no-bautizado" />
              
              {/* Dones Espirituales Dinámicos */}
              {Object.entries(classStats.donesEspirituales || {}).map(([gift, count]) => (
                <InsightCard key={gift} title={gift} value={count} type={gift} />
              ))}

              {/* Estado Civil Dinámico */}
              {Object.entries(classStats.estadoCivil || {}).map(([status, count]) => (
                <InsightCard key={status} title={status} value={count} type={status.split('/')[0]} />
              ))}
            </div>
          </>
        ) : (
          <p className="no-data-msg">Seleccione una clase para visualizar el análisis espiritual.</p>
        )}
      </section>
    </div>
  );
};

export default MemberStatsSection;