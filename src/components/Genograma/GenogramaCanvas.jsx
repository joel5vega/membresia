// components/Genograma/GenogramaCanvas.jsx
import React, { useMemo, useState } from 'react';
import { layoutByGenerationSmart } from '../../genograma/layout';
import { SEX, COLORES_RELACION } from '../../genograma/model';

const NODE_SIZE = 48;
const ROOT_SIZE = 60;

export default function GenogramaCanvas({ nodes, edges, onNodeClick }) {
  const [hoveredId, setHoveredId] = useState(null);

  const positions = useMemo(
    () => layoutByGenerationSmart(nodes, { width: 1200, height: 700 }),
    [nodes]
  );

  const validEdges = useMemo(
    () =>
      edges.filter(
        (e) => positions.has(e.source) && positions.has(e.target)
      ),
    [edges, positions]
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 700"
      style={{ background: '#F9F7F5', borderRadius: 12, display: 'block' }}
    >
      {/* ── Aristas ── */}
      {validEdges.map((edge) => {
        const from = positions.get(edge.source);
        const to = positions.get(edge.target);
        const color = COLORES_RELACION[edge.tipo] || COLORES_RELACION.familia;

        // ── Pareja: línea horizontal con círculo ──
        if (edge.tipo === 'pareja') {
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={edge.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={color}
                strokeWidth={3}
              />
              <circle cx={midX} cy={midY} r={5} fill={color} />
            </g>
          );
        }

        // ── Hermandad: línea horizontal punteada ──
        if (edge.tipo === 'hermandad') {
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          );
        }

        // ── Descendencia: ortogonal ──
        const midY = from.y + (to.y - from.y) * 0.6;
        const path = `
          M ${from.x} ${from.y}
          L ${from.x} ${midY}
          L ${to.x} ${midY}
          L ${to.x} ${to.y}
        `;

        return (
          <path
            key={edge.id}
            d={path}
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
          />
        );
      })}

      {/* ── Nodos ── */}
      {nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;

        const size = node.esRaiz ? ROOT_SIZE : NODE_SIZE;
        const color =
          node.sexo === SEX.MALE
            ? '#3b82f6'
            : node.sexo === SEX.FEMALE
            ? '#ec4899'
            : '#6b7280';

        return (
          <g
            key={node.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onNodeClick?.(node)}
            style={{ cursor: 'pointer' }}
          >
            {/* Forma según sexo */}
            {node.sexo === SEX.MALE ? (
              <rect
                x={-size / 2}
                y={-size / 2}
                width={size}
                height={size}
                rx={6}
                fill={color}
                stroke={node.esRaiz ? '#A63232' : '#fff'}
                strokeWidth={node.esRaiz ? 4 : 2}
              />
            ) : node.sexo === SEX.FEMALE ? (
              <circle
                r={size / 2}
                fill={color}
                stroke={node.esRaiz ? '#A63232' : '#fff'}
                strokeWidth={node.esRaiz ? 4 : 2}
              />
            ) : (
              <polygon
                points={`0,${-size / 2} ${size / 2},0 0,${size / 2} ${-size / 2},0`}
                fill={color}
                stroke={node.esRaiz ? '#A63232' : '#fff'}
                strokeWidth={node.esRaiz ? 4 : 2}
              />
            )}

            {/* Foto */}
            {node.photoUrl && (
              <image
                href={node.photoUrl}
                x={-size / 2 + 3}
                y={-size / 2 + 3}
                width={size - 6}
                height={size - 6}
                style={{
                  clipPath:
                    node.sexo === SEX.FEMALE
                      ? 'circle(50%)'
                      : 'inset(0 round 6px)',
                }}
              />
            )}

            {/* Nombre */}
            <text
              y={size / 2 + 18}
              textAnchor="middle"
              fontSize={12}
              fill="#2D3748"
              fontWeight={node.esRaiz ? 700 : 500}
            >
              {node.nombre.length > 18
                ? node.nombre.substring(0, 16) + '…'
                : node.nombre}
            </text>

            {/* Relación */}
            {node.relacion !== 'miembro' && (
              <text
                y={size / 2 + 32}
                textAnchor="middle"
                fontSize={10}
                fill="#718096"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {node.relacion}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}