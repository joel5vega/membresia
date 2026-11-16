import React, { useMemo } from 'react';
import { layoutByGenerationSmart, canvasSize } from '../../genograma/layout';
import { SEX, COLORES_RELACION, COLOR_SEXO } from '../../genograma/model';

const SIZE = 48;
const ROOT = 60;

function Edge({ edge, from, to }) {
  const color = COLORES_RELACION[edge.tipo] || COLORES_RELACION.familia;
  if (edge.tipo === 'pareja')
    return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={3} />;
  if (edge.tipo === 'hermandad')
    return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={2} strokeDasharray="6 4" />;
  const midY = from.y + (to.y - from.y) * 0.6;
  return <path d={`M${from.x} ${from.y} L${from.x} ${midY} L${to.x} ${midY} L${to.x} ${to.y}`}
               stroke={color} strokeWidth={2} fill="none" />;
}

function Shape({ sexo, size, stroke, sw }) {
  const fill = COLOR_SEXO[sexo];
  const p = { fill, stroke, strokeWidth: sw };
  if (sexo === SEX.MALE) return <rect x={-size / 2} y={-size / 2} width={size} height={size} {...p} />;
  if (sexo === SEX.FEMALE) return <circle r={size / 2} {...p} />;
  const h = size / 2;
  return <polygon points={`0,${-h} ${h},0 0,${h} ${-h},0`} {...p} />;
}

export default function GenogramaCanvas({ nodes, edges, selectedIndex, onNodeClick }) {
  const size = useMemo(() => canvasSize(nodes), [nodes]);
  const pos = useMemo(() => layoutByGenerationSmart(nodes, size), [nodes, size]);

  return (
    <div className="gn-scroll">
      <svg viewBox={`0 0 ${size.width} ${size.height}`}
           style={{ width: '100%', minWidth: Math.min(size.width, 700), display: 'block' }}>
        {edges.map((e) => {
          const from = pos.get(e.source), to = pos.get(e.target);
          return from && to ? <Edge key={e.id} edge={e} from={from} to={to} /> : null;
        })}

        {nodes.map((n) => {
          const p = pos.get(n.id);
          if (!p) return null;
          const s = n.esRaiz ? ROOT : SIZE;
          const active = n.genogramaIndex === selectedIndex && !n.esRaiz;
          return (
            <g key={n.id} transform={`translate(${p.x},${p.y})`}
               style={{ cursor: n.esRaiz ? 'default' : 'pointer' }}
               onClick={() => !n.esRaiz && onNodeClick(n)}>
              <Shape sexo={n.sexo} size={s}
                     stroke={n.esRaiz ? '#e51400' : active ? '#fff' : '#0d0d0d'}
                     sw={n.esRaiz || active ? 4 : 2} />
              <text y={s / 2 + 18} textAnchor="middle" fontSize={12} fill="#fff"
                    fontWeight={n.esRaiz ? 700 : 400}>
                {n.nombre.length > 18 ? n.nombre.slice(0, 16) + '…' : n.nombre}
              </text>
              {!n.esRaiz && (
                <text y={s / 2 + 32} textAnchor="middle" fontSize={10} fill="#a6a6a6"
                      style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {n.relacionOriginal}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}