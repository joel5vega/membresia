// components/Genograma/GenogramaCanvas.jsx
import React, { useMemo, useState } from 'react';
import { layoutByGenerationSmart } from '../../genograma/layout';
import { SEX, COLORES_RELACION } from '../../genograma/model';

const NODE_SIZE = 48;

export default function GenogramaCanvas({ nodes, edges, onNodeClick }) {
  const [hoveredId, setHoveredId] = useState(null);

  // ── Calcular layout ──
  const positions = useMemo(() => {
    return layoutByGenerationSmart(nodes, { width: 1200, height: 800 });
  }, [nodes]);

  // ── Filtrar aristas huérfanas ──
  const validEdges = useMemo(() => {
    return edges.filter(e => positions.has(e.source) && positions.has(e.target));
  }, [edges, positions]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 800"
      style={{ background: '#F9F7F5', borderRadius: 12 }}
    >
      {/* ── Aristas ── */}
      {validEdges.map(edge => {
        const from = positions.get(edge.source);
        const to = positions.get(edge.target);
        const color = COLORES_RELACION[edge.tipo] || COLORES_RELACION.familia;

        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={color}
            strokeWidth={2}
            strokeDasharray={edge.tipo === 'pareja' ? '0' : edge.tipo === 'hermandad' ? '6 4' : '0'}
          />
        );
      })}

      {/* ── Nodos ── */}
      {nodes.map(node => {
        const pos = positions.get(node.id);
        if (!pos) return null;

        const isHovered = hoveredId === node.id;
        const size = node.esRaiz ? NODE_SIZE * 1.3 : NODE_SIZE;
        const color = node.sexo === SEX.MALE ? '#3b82f6'
                    : node.sexo === SEX.FEMALE ? '#ec4899'
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
            {/* Símbolo del nodo */}
            {node.sexo === SEX.MALE ? (
              <rect
                x={-size / 2}
                y={-size / 2}
                width={size}
                height={size}
                rx={4}
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

            {/* Foto si existe */}
            {node.photoUrl && (
              <image
                href={node.photoUrl}
                x={-size / 2 + 4}
                y={-size / 2 + 4}
                width={size - 8}
                height={size - 8}
                clipPath={node.sexo === SEX.FEMALE ? 'circle(50%)' : undefined}
              />
            )}

            {/* Nombre debajo */}
            <text
              y={size / 2 + 16}
              textAnchor="middle"
              fontSize={12}
              fill="#2D3748"
              fontWeight={node.esRaiz ? 700 : 500}
            >
              {node.nombre.length > 18
                ? node.nombre.substring(0, 16) + '…'
                : node.nombre}
            </text>

            {/* Relación debajo del nombre */}
            {node.relacion !== 'miembro' && (
              <text
                y={size / 2 + 30}
                textAnchor="middle"
                fontSize={10}
                fill="#718096"
                textTransform="uppercase"
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