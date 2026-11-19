import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useConstellation } from '../../hooks/useConstellation';
import { useFamilyHalos } from '../../hooks/useFamilyHalos';
import { usePanZoom } from '../../hooks/usePanZoom';
import { norm } from '../../genograma/relationUtils';
import { toPerson } from '../../genograma/people';
import { DEFAULT_FILTERS, applyFilters, countFilters } from '../../genograma/graphFilters';
import ConstellationSearch from './ConstellationSearch';
import FilterBar from './FilterBar';
import PersonSheet from './PersonSheet';

const NUCLEUS = '#00aba9';
const colorOf = (n) =>
  n.cluster === 'familia' ? '#2d89ef' : n.cluster === 'amigos' ? '#fa6800' : '#a6a6a6';

export default function ClanesGraphView() {
  const navigate = useNavigate();
  const ctl = useConstellation();
  const { members, graph, people, nuclei, positions, hidden, status, loading, error } = ctl;

  const { transform, setTransform, svgRef, handlers, wasDragged } =
    usePanZoom({ x: 0, y: 0, scale: 0.4 });

  const [hovered, setHovered] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [query, setQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  // 1. Vista filtrada (el layout usa el grafo completo; aquí solo se filtra)
  const view = useMemo(
    () => applyFilters(graph, filters, { hiddenSet, showHidden, status }),
    [graph, filters, hiddenSet, showHidden, status]
  );
  const counts = useMemo(() => countFilters(graph, status), [graph, status]);

  // 2. Halos de familia extensa
  const viewPeople = useMemo(() => {
    const ids = new Set(view.nodes.map((n) => n.id));
    return people.filter((p) => ids.has(p.id));
  }, [people, view.nodes]);
  const halos = useFamilyHalos({ nodes: viewPeople, edges: view.edges }, positions);

  // 3. Núcleos visibles: forma (círculo) y pertenencia
  const viewNuclei = useMemo(() => {
    const ids = new Set(view.nodes.map((n) => n.id));
    return nuclei
      .map((n) => ({ ...n, members: n.members.filter((id) => ids.has(id)) }))
      .filter((n) => n.members.length >= 2);
  }, [nuclei, view.nodes]);

  const shapes = useMemo(() => viewNuclei.map((n) => {
    const pts = n.members.map((id) => positions.get(id)).filter(Boolean);
    if (pts.length < 2) return null;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const r = Math.max(...pts.map((p) => Math.hypot(p.x - cx, p.y - cy))) + 24;
    return { id: n.id, name: n.name, cx, cy, r };
  }).filter(Boolean), [viewNuclei, positions]);

  const nucleusOf = useMemo(() => {
    const m = new Map();
    viewNuclei.forEach((n) => n.members.forEach((id) => m.set(id, n.id)));
    return m;
  }, [viewNuclei]);

  // 4. Selección y búsqueda
  const person = toPerson(people.find((p) => p.id === selectedKey));
  const matches = useMemo(() => {
    const q = norm(query);
    return q ? new Set(view.nodes.filter((n) => norm(n.nombre).includes(q)).map((n) => n.id)) : null;
  }, [view.nodes, query]);

  const pick = (node) => {
    const p = positions.get(node.id);
    if (p) {
      const scale = Math.max(transform.scale, 0.8);
      setTransform({
        scale,
        x: window.innerWidth / 2 - p.x * scale,
        y: window.innerHeight * 0.18 - p.y * scale,
      });
    }
    setSelectedKey(node.id);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Construyendo red global...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0d0d0d' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <button onClick={() => navigate(-1)} style={roundBtn} aria-label="Volver">
          <ArrowLeft size={24} />
        </button>

        <div style={{ color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Constelación Canaán</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            {view.nodes.length} personas · {view.edges.length} conexiones · {shapes.length} núcleos
          </p>
        </div>

        <ConstellationSearch nodes={view.nodes} query={query} onQuery={setQuery} onPick={pick} />

        {hidden.length > 0 && (
          <button onClick={() => setShowHidden((v) => !v)} style={pillBtn}>
            {showHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            {showHidden ? 'Ocultar' : `Ver ocultos (${hidden.length})`}
          </button>
        )}

        <FilterBar filters={filters} onChange={setFilters} counts={counts} />
      </div>

      {error && <div style={errorBar}>{error}</div>}

      {/* Grafo */}
      <svg ref={svgRef} {...handlers} width="100%" height="100%"
           style={{ cursor: 'grab', touchAction: 'none' }}>
        <defs>
          <radialGradient id="familyHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(45,137,239,0.12)" />
            <stop offset="100%" stopColor="rgba(45,137,239,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Familia extensa (fondo) */}
          {halos.map((h, i) => (
            <g key={i}>
              <circle cx={h.cx} cy={h.cy} r={h.radius}
                      fill="url(#familyHalo)" stroke="rgba(45,137,239,0.2)" strokeWidth={1} />
              <text x={h.cx} y={h.cy} textAnchor="middle" alignmentBaseline="middle"
                    fill="rgba(255,255,255,0.3)" fontSize={36} fontWeight={900}
                    style={{ pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: 4 }}>
                {h.etiqueta}
              </text>
            </g>
          ))}

          {/* Núcleos familiares (destacados) */}
          {shapes.map((s) => (
            <g key={s.id} style={{ pointerEvents: 'none' }}>
              <circle cx={s.cx} cy={s.cy} r={s.r}
                      fill="rgba(0,171,169,0.12)" stroke={NUCLEUS} strokeWidth={2.5} />
              {transform.scale >= 0.7 && (
                <text x={s.cx} y={s.cy - s.r - 8} textAnchor="middle"
                      fill={NUCLEUS} fontSize={15} fontWeight={700}
                      style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {s.name}
                </text>
              )}
            </g>
          ))}

          {/* Aristas: las del núcleo, más gruesas; las inferidas, punteadas */}
          {view.edges.map((e, i) => {
            const a = positions.get(e.source);
            const b = positions.get(e.target);
            if (!a || !b) return null;
            const lit = !matches || (matches.has(e.source) && matches.has(e.target));
            const inNucleus = nucleusOf.has(e.source) && nucleusOf.get(e.source) === nucleusOf.get(e.target);
            const friend = e.tipo === 'amistad';
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={friend ? '#fa6800' : inNucleus ? NUCLEUS : '#2d89ef'}
                    strokeWidth={inNucleus ? 3.5 : friend ? 1 : 2}
                    strokeOpacity={lit ? (inNucleus ? 0.8 : e.derivada ? 0.18 : 0.3) : 0.05}
                    strokeDasharray={e.derivada && !inNucleus ? '6 6' : undefined} />
            );
          })}

          {/* Nodos */}
          {view.nodes.map((n) => {
            const p = positions.get(n.id);
            if (!p) return null;
            const size = n.esMiembroIglesia ? 14 : 9;
            const dim = matches && !matches.has(n.id);
            const st = status[n.id];
            const ring =
              n.id === selectedKey ? '#fff'
              : matches?.has(n.id) ? '#facc15'
              : hovered === n.id ? '#fff'
              : 'transparent';

            return (
              <g key={n.id} transform={`translate(${p.x}, ${p.y})`}
                 opacity={dim ? 0.12 : hiddenSet.has(n.id) ? 0.35 : st === 'no-asiste' ? 0.55 : 1}
                 style={{ cursor: 'pointer' }}
                 onMouseEnter={() => setHovered(n.id)}
                 onMouseLeave={() => setHovered(null)}
                 onClick={() => !wasDragged() && pick(n)}>
                <circle r={Math.max(size, 24 / transform.scale)} fill="transparent" />
                <circle r={size}
                        fill={st === 'fallecido' ? '#6b6b6b' : n.esMiembroIglesia ? colorOf(n) : '#0d0d0d'}
                        stroke={ring !== 'transparent' ? ring : st === 'fallecido' ? '#6b6b6b' : colorOf(n)}
                        strokeWidth={ring !== 'transparent' ? 3 : 2}
                        strokeDasharray={st === 'no-asiste' ? '3 3' : undefined} />
                {st === 'fallecido' && <text x={size} y={-size + 2} fontSize={16} fill="#fff">✝</text>}
                {n.photoUrl && (
                  <image href={n.photoUrl} x={-size + 2} y={-size + 2}
                         width={(size - 2) * 2} height={(size - 2) * 2}
                         style={{ clipPath: 'circle(50%)', filter: st === 'fallecido' ? 'grayscale(1)' : undefined }} />
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
        <PersonSheet
          key={person.key}
          person={person}
          people={people}
          ctl={ctl}
          onClose={() => setSelectedKey(null)}
          onKeyChange={setSelectedKey}
        />
      )}
    </div>
  );
}

const roundBtn = { background: '#1a1a1a', border: 0, color: '#fff', width: 44, height: 44, display: 'grid', placeItems: 'center' };
const pillBtn = { display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', background: '#1a1a1a', border: '1px solid #3a3a3a', color: '#fff', fontSize: 13 };
const errorBar = { position: 'absolute', top: 100, left: 16, right: 16, zIndex: 10, background: '#e51400', color: '#fff', padding: 12, fontSize: 13 };