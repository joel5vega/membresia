import React, { useState } from 'react';
import { useQuickSummaryHistory, useClassSummaryHistory } from '../../hooks/useAttendanceTotalsHistory';
import { CLASS_IDS } from '../ClassesAndAttendance';
import './AttendanceHistoryView.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const CLASSES = Object.keys(CLASS_IDS);
const PERIODS = [
  { key: 'mes',       label: 'Este mes' },
  { key: 'trimestre', label: 'Trimestre' },
  { key: 'año',       label: 'Este año' },
  { key: 'total',     label: 'Todo' },
];

const PERIOD_LABELS = {
  mes:       () => new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
  trimestre: () => `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
  año:       () => String(new Date().getFullYear()),
  total:     () => 'Todos los registros',
};

const AttendanceHistoryView = () => {
  const [mode, setMode]                   = useState('general');
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [period, setPeriod]               = useState('total');

  const general = useQuickSummaryHistory(period);
  const byClass = useClassSummaryHistory(mode === 'clase' ? selectedClass : null, period);
  const active  = mode === 'general' ? general : byClass;

  const { records, stats, loading, error } = active;

  // Gráfica — usa asistencia_final si existe, sino total
  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({
      fecha:  r.date.slice(5),
      total:  Number(r.asistencia_final > 0 ? r.asistencia_final : r.total) || 0,
      ed:     Number(r.subtotal_clases  ?? r.total) || 0,
      label:  r.label || r.date,
    }));

  return (
    <div className="attendance-history">

      {/* Header */}
      <div className="ah-header">
        <div>
          <p className="ah-label">Métricas</p>
          <h2 className="ah-title">Historial</h2>
        </div>
        <div className="ah-mode-toggle">
          <button
            className={`ah-toggle-btn ${mode === 'general' ? 'active' : ''}`}
            onClick={() => setMode('general')}
          >
            <span className="material-symbols-outlined">church</span>
            General
          </button>
          <button
            className={`ah-toggle-btn ${mode === 'clase' ? 'active' : ''}`}
            onClick={() => setMode('clase')}
          >
            <span className="material-symbols-outlined">school</span>
            Clase
          </button>
        </div>
      </div>

      {/* Selector clase */}
      {mode === 'clase' && (
        <div className="ah-class-select">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Filtros de período */}
      <div className="ah-period-filters">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`ah-period-btn ${period === p.key ? 'active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Etiqueta período */}
      <p className="ah-period-label">
        <span className="material-symbols-outlined">filter_list</span>
        {PERIOD_LABELS[period]()}
        {records.length > 0 && ` · ${records.length} registros`}
      </p>

      {loading && <p className="ah-loading">Cargando datos...</p>}
      {error   && <p className="ah-error">Error: {error}</p>}

      {/* Cards */}
      {!loading && (
        <div className="ah-summary-grid">
          <div className="ah-card-primary">
            <p className="ah-card-label">Promedio del período</p>
            <h3 className="ah-card-big">{stats.avg || 0}</h3>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>
              personas por sesión
            </p>
          </div>
          <div className="ah-card-small">
            <p className="ah-card-label-sm">Máximo</p>
            <h4 className="ah-card-num ah-tertiary">{stats.max || '—'}</h4>
          </div>
          <div className="ah-card-small">
            <p className="ah-card-label-sm">Mínimo</p>
            <h4 className="ah-card-num ah-secondary">{stats.min || '—'}</h4>
          </div>
          {period !== 'mes' && (
            <div className="ah-card-small" style={{ gridColumn: '1 / -1' }}>
              <p className="ah-card-label-sm">Total acumulado del período</p>
              <h4 className="ah-card-num ah-tertiary">{stats.totalSum || 0}</h4>
            </div>
          )}
        </div>
      )}

      {/* Gráfica */}
      {!loading && chartData.length > 0 && (
        <div className="ah-chart-card">
          <div className="ah-chart-header">
            <h3>Progreso de Asistencia</h3>
            <span className="ah-badge-filter">{chartData.length} sesiones</span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,113,111,0.15)" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 9, fill: '#584140' }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(chartData.length / 5) - 1)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#584140' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, 'auto']}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid rgba(139,113,111,0.2)',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#1b1c1b',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value, name) => [
                  value,
                  name === 'total' ? 'Asist. Final' : 'Escuela Dom.',
                ]}
              labelFormatter={(label) => {
  // label es "MM-DD", busca el registro completo para mostrar fecha completa
  const found = chartData.find(d => d.fecha === label);
  return `📅 ${found?.label || label}`;
}}
              />
              {/* Línea Escuela Dominical — punteada */}
              <Line
                type="monotone"
                dataKey="ed"
                stroke="rgba(133,25,29,0.35)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls={true}
                isAnimationActive={false}
              />
              {/* Línea Asistencia Final — principal */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#85191d"
                strokeWidth={2.5}
                dot={{ fill: '#85191d', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#85191d', stroke: '#fff', strokeWidth: 2 }}
                connectNulls={true}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center',
            marginTop: '0.5rem', fontSize: '0.68rem', color: '#584140' }}>
            <span>
              <span style={{ display: 'inline-block', width: '1.5rem', height: '2px',
                background: '#85191d', verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Asist. Final
            </span>
            <span>
              <span style={{ display: 'inline-block', width: '1.5rem', height: '2px',
                background: 'rgba(133,25,29,0.35)', verticalAlign: 'middle',
                marginRight: '0.3rem', borderTop: '2px dashed rgba(133,25,29,0.35)' }} />
              Escuela Dom.
            </span>
          </div>
        </div>
      )}

      {!loading && chartData.length === 0 && !error && (
        <div className="ah-chart-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', opacity: 0.25 }}>
            show_chart
          </span>
          <p style={{ fontSize: '0.8rem', color: '#584140', marginTop: '0.5rem' }}>
            Sin datos para este período.
            {period === 'mes' && ' Prueba con "Todo" para ver el historial completo.'}
          </p>
        </div>
      )}

      {/* Lista de registros */}
      <h3 className="ah-section-title">
        Sesiones — {PERIOD_LABELS[period]()}
      </h3>

      <div className="ah-sessions-list">
        {!loading && records.length === 0 && (
          <div className="ah-empty">
            <span className="material-symbols-outlined" style={{ fontSize: '2rem', opacity: 0.3 }}>
              history
            </span>
            <p>Sin registros en este período.</p>
            {mode === 'general' && period === 'mes' && (
              <p style={{ fontSize: '0.75rem', color: '#934b00' }}>
                Usa "Registro Rápido" para agregar uno.
              </p>
            )}
          </div>
        )}

        {records.map((record, i) => (
          <div key={record.id} className={`ah-session-item ${i > 2 ? 'dimmed' : ''}`}>
            <div className="ah-session-icon">
              <span className="material-symbols-outlined">
                {mode === 'general' ? 'bolt' : 'school'}
              </span>
            </div>

            <div className="ah-session-info">
              <h5 style={{ textTransform: 'capitalize' }}>{record.label}</h5>

              {mode === 'general' ? (
                <>
                  <p>
                    V: {record.total_varones_general ?? record.varones ?? 0}
                    {' · '}
                    M: {record.total_mujeres_general ?? record.mujeres ?? 0}
                    {(record.total_visitas ?? record.visitantes ?? 0) > 0 &&
                      ` · Vis: ${record.total_visitas ?? record.visitantes}`}
                  </p>

                  {record.asistencia_final > 0 && (
                    <p style={{ fontSize: '0.7rem', color: '#85191d', fontWeight: 700 }}>
                      ED: {record.subtotal_clases ?? record.total ?? 0}
                      {' → '}
                      Final: {record.asistencia_final}
                    </p>
                  )}

                  {(record.total_biblias_general > 0 || record.biblias_final > 0) && (
                    <p style={{ fontSize: '0.68rem', color: '#584140' }}>
                      📖 {record.total_biblias_general ?? record.biblias ?? 0}
                      {record.biblias_final > 0 && ` ED · ${record.biblias_final} Final`}
                    </p>
                  )}
                </>
              ) : (
                <p>
                  {`V: ${record.varones ?? 0} · M: ${record.mujeres ?? 0} · B: ${record.bebes ?? 0}`}
                </p>
              )}

              {record.notas && (
                <p style={{ fontStyle: 'italic', fontSize: '0.65rem', opacity: 0.7 }}>
                  {record.notas}
                </p>
              )}
            </div>

            <div className="ah-session-stats">
              <p className="ah-stat-primary">
                {record.asistencia_final > 0 ? record.asistencia_final : record.total}
              </p>
              <p className="ah-stat-secondary">
                {mode === 'general'
                  ? `📖 ${record.total_biblias_general ?? record.biblias ?? 0}`
                  : `${record.varones ?? 0}V · ${record.mujeres ?? 0}M`}
              </p>
              {record.fuente === 'informe_dominical' && (
                <span style={{
                  fontSize: '0.55rem', background: 'rgba(133,25,29,0.08)',
                  color: '#85191d', padding: '0.1rem 0.4rem', borderRadius: '9999px',
                  fontWeight: 700, marginTop: '0.25rem', display: 'block', textAlign: 'center',
                }}>
                  INFORME
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceHistoryView;