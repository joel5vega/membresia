// components/Genograma/GenogramaLegend.jsx
import React from 'react';
import { COLORES_RELACION } from '../../genograma/model';

export default function GenogramaLegend() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 12,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 16,
      fontSize: 12,
    }}>
      <LegendItem color="#3b82f6" shape="square" label="Hombre" />
      <LegendItem color="#ec4899" shape="circle" label="Mujer" />
      <LegendItem color="#6b7280" shape="diamond" label="Desconocido" />

      <div style={{ width: '100%', height: 1, background: '#edf2f7' }} />

      <LegendItem color={COLORES_RELACION.familia} shape="line" label="Descendencia" />
      <LegendItem color={COLORES_RELACION.pareja} shape="line-solid" label="Pareja" />
      <LegendItem color={COLORES_RELACION.hermandad} shape="line-dashed" label="Hermandad" />
    </div>
  );
}

function LegendItem({ color, shape, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={20} height={20}>
        {shape === 'square' && <rect x={4} y={4} width={12} height={12} rx={2} fill={color} />}
        {shape === 'circle' && <circle cx={10} cy={10} r={6} fill={color} />}
        {shape === 'diamond' && <polygon points="10,3 17,10 10,17 3,10" fill={color} />}
        {shape === 'line' && <line x1={2} y1={10} x2={18} y2={10} stroke={color} strokeWidth={2} />}
        {shape === 'line-solid' && <line x1={2} y1={10} x2={18} y2={10} stroke={color} strokeWidth={2} />}
        {shape === 'line-dashed' && <line x1={2} y1={10} x2={18} y2={10} stroke={color} strokeWidth={2} strokeDasharray="4 2" />}
      </svg>
      <span>{label}</span>
    </div>
  );
}