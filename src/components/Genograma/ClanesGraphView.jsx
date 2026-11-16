import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useConstellation } from '../../hooks/useConstellation';
import { useFamilyHalos } from '../../hooks/useFamilyHalos';
import { usePanZoom } from '../../hooks/usePanZoom';
import { norm } from '../../genograma/relationUtils';
import ConstellationSearch from './ConstellationSearch';
import PersonPanel from './PersonPanel';

const colorOf = (n) => (n.cluster === 'familia' ? '#3b82f6' : n.cluster === 'amigos' ? '#ec4899' : '#64748b');

export default function ClanesGraphView() {
  const navigate = useNavigate();
  const { members, graph, positions, loading, error, setRelation, removeRelation } = useConstellation();
  const halos = useFamilyHalos(graph, positions);
  const { transform, setTransform, svgRef, handlers, wasDragged } = usePanZoom({ x: 0, y: 0, scale: 0.4 });

  const [hovered, setHovered] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [query, setQuery] = useState('');

  // Persona seleccionada, siempre "viva" respecto al grafo actual
  const person = useMemo(() => {
    const n = graph.nodes.find((x) => x.id === selectedKey);
    return n && { key: n.id, nombre: n.nombre, realId: n.realId, sexo: n.sexo, esMiembro: n.esMiembroIglesia };
  }, [graph.nodes, selectedKey]);

  // Coincidencias de la búsqueda (null = sin filtro)
  const matches = useMemo(() => {
    const q = norm(query);
    return q ? new Set(graph.nodes.filter((n) => norm(n.nombre).includes(q)).map((n) => n.id)) : null;
  }, [graph.nodes, query]);

  const pick = (node) => {
    const p = positions.get(node.id);
    if (p) {
      const scale = 1;
      setTransform({ scale, x: window.innerWidth / 2 - p.x * scale, y: window.innerHeight * 0.3 - p.y * scale });
    }
    setSelectedKey(node.id);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Construyendo red global...</div>;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} style={backBtn}><ArrowLeft size={24} /></button>
        <div style={{ color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Constelación Canaán</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            {graph.nodes.length} personas · {graph.edges.length} conexiones
          </p>
        </div>
        <ConstellationSearch nodes={graph.nodes} query={query} onQuery={setQuery} onPick={pick} />
      </div>

      {error && <div style={errorBar}>{error}</div>}

      {/* Grafo */}
      <svg ref={svgRef} {...handlers} width="100%" height="100%" style={{ cursor: 'grab', touchAction: 'none' }}>
        <defs>
          <radialGradient id="familyHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.12)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {halos.map((h, i) => (
            <g key={i}>
              <circle cx={h.cx} cy={h.cy} r={h.radius} fill="url(#familyHalo)" stroke="rgba(59,130,246,0.2)" />
              <text x={h.cx} y={h.cy} textAnchor="middle" alignmentBaseline="middle" fill="rgba(255,255,255,0.3)"
                fontSize={36} fontWeight={900} style={{ pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: 4 }}>
                {h.etiqueta}
              </text>
            </g>
          ))}

          {graph.edges.map((e, i) => {
            const a = positions.get(e.source), b = positions.get(e.target);
            if (!a || !b) return null;
            const lit = !matches || (matches.has(e.source) && matches.has(e.target));
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={e.tipo === 'amistad' ? '#ec4899' : '#3b82f6'}
                strokeWidth={e.tipo === 'amistad' ? 1 : 2} strokeOpacity={lit ? 0.3 : 0.05} />
            );
          })}

          {graph.nodes.map((n) => {
            const p = positions.get(n.id);
            if (!p) return null;
            const size = n.esMiembroIglesia ? 14 : 9;
            const dim = matches && !matches.has(n.id);
            const ring = n.id === selectedKey ? '#fff' : matches?.has(n.id) ? '#facc15' : hovered === n.id ? '#fff' : 'transparent';
            return (
              <g key={n.id} transform={`translate(${p.x}, ${p.y})`} opacity={dim ? 0.12 : 1}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}
                onClick={() => !wasDragged() && setSelectedKey(n.id)}>
                <circle r={size} fill={colorOf(n)} stroke={ring} strokeWidth={3} />
                {n.photoUrl && (
                  <image href={n.photoUrl} x={-size + 2} y={-size + 2} width={(size - 2) * 2} height={(size - 2) * 2}
                    style={{ clipPath: 'circle(50%)' }} />
                )}
                {(hovered === n.id || matches?.has(n.id)) && (
                  <g transform={`translate(0, ${size + 16})`}>
                    <rect x={-70} y={-12} width={140} height={24} rx={6} fill="rgba(0,0,0,0.9)" />
                    <text textAnchor="middle" y={4} fill="#fff" fontSize={11} fontWeight={600}>{n.nombre}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {person && (
        <PersonPanel
          key={person.key}
          person={person}
          members={members}
          people={graph.nodes}
          onSetRelation={setRelation}
          onRemoveRelation={removeRelation}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
}

const backBtn = { background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', padding: 10, borderRadius: '50%' };
const errorBar = { position: 'absolute', top: 80, left: 16, right: 16, zIndex: 10, background: '#b91c1c', color: '#fff', padding: 10, borderRadius: 8, fontSize: 13 };