import React from 'react';
import { COLORES_RELACION, COLOR_SEXO, SEX } from '../../genograma/model';

const ITEMS = [
  { shape: 'square', color: COLOR_SEXO[SEX.MALE], label: 'Varón' },
  { shape: 'circle', color: COLOR_SEXO[SEX.FEMALE], label: 'Mujer' },
  { shape: 'diamond', color: COLOR_SEXO[SEX.UNKNOWN], label: 'No definido' },
  { shape: 'line', color: COLORES_RELACION.familia, label: 'Descendencia' },
  { shape: 'line', color: COLORES_RELACION.pareja, label: 'Pareja' },
  { shape: 'dashed', color: COLORES_RELACION.hermandad, label: 'Hermandad' },
];

const Icon = ({ shape, color }) => (
  <svg width={20} height={20}>
    {shape === 'square' && <rect x={4} y={4} width={12} height={12} fill={color} />}
    {shape === 'circle' && <circle cx={10} cy={10} r={6} fill={color} />}
    {shape === 'diamond' && <polygon points="10,3 17,10 10,17 3,10" fill={color} />}
    {shape === 'line' && <line x1={2} y1={10} x2={18} y2={10} stroke={color} strokeWidth={3} />}
    {shape === 'dashed' && <line x1={2} y1={10} x2={18} y2={10} stroke={color} strokeWidth={3} strokeDasharray="4 2" />}
  </svg>
);

export default function GenogramaLegend() {
  return (
    <div className="gn-legend">
      {ITEMS.map((i) => (
        <span key={i.label} className="gn-legend__item"><Icon {...i} /> {i.label}</span>
      ))}
    </div>
  );
}