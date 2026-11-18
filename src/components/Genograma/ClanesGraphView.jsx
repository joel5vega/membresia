import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useConstellation } from '../../hooks/useConstellation';
import { useFamilyHalos } from '../../hooks/useFamilyHalos';
import { usePanZoom } from '../../hooks/usePanZoom';
import { norm } from '../../genograma/relationUtils';
import { buildPeople } from '../../genograma/people';
import ConstellationSearch from './ConstellationSearch';
import PersonPanel from './PersonPanel';
import FilterBar from './FilterBar';
import { DEFAULT_FILTERS, applyFilters, countFilters } from '../../genograma/graphFilters';

const colorOf = (n) =>
  n.cluster === 'familia' ? '#2d89ef' : n.cluster === 'amigos' ? '#fa6800' : '#a6a6a6';

export default function ClanesGraphView() {
  const navigate = useNavigate();
  const {
    members, graph, positions, hidden, status, setStatus, loading, error,
    setRelation, removeRelation, renamePerson, deletePerson, toggleHidden,
  } = useConstellation();

  const { transform, setTransform, svgRef, handlers, wasDragged } =
    usePanZoom({ x: 0, y: 0, scale: 0.4 });

  const [hovered, setHovered] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [query, setQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);
const people = useMemo(() => buildPeople(members, graph.nodes), [members, graph.nodes]);

  // Vista: el layout usa el grafo completo; aquí solo se filtran los ocultos
  const view = useMemo(
() => applyFilters(graph, filters, { hiddenSet, showHidden, status }),
[graph, filters, hiddenSet, showHidden, status]);
const counts = useMemo(() => countFilters(graph, status), [graph, status]);

  const halos = useFamilyHalos(view, positions);

  // Persona seleccionada, siempre sincronizada con el grafo actual
  const person = useMemo(() => {
    const n = graph.nodes.find((x) => x.id === selectedKey);
    return n && {
      key: n.id, nombre: n.nombre, realId: n.realId,
      sexo: n.sexo, esMiembro: n.esMiembroIglesia,
    };
  }, [graph.nodes, selectedKey]);

  // Coincidencias de la búsqueda (null = sin filtro)
  const matches = useMemo(() => {
    const q = norm(query);
    return q
      ? new Set(view.nodes.filter((n) => norm(n.nombre).includes(q)).map((n) => n.id))
      : null;
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

  const handleRename = async (from, to) => {
    await renamePerson(from, to);
    setSelectedKey(norm(to)); // el nodo pasa a llamarse distinto
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
            {view.nodes.length} personas · {view.edges.length} conexiones
          </p>
        </div>

        <FilterBar filters={filters} onChange={setFilters} counts={counts} />

        {hidden.length > 0 && (
          <button onClick={() => setShowHidden((v) => !v)} style={pillBtn}>
            {showHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            {showHidden ? 'Ocultar' : `Ver ocultos (${hidden.length})`}
          </button>
        )}
      </div>

      {error && <div style={errorBar}>{error}</div>}

      {/* Grafo */}
      <svg ref={svgRef} {...handlers} width="100%" height="100%"
           style={{ cursor: 'grab', touchAction: 'none' }}>
        <defs>
          <radialGradient id="familyHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(545,137,239,0.12)" />
            <stop offset="100%" stopColor="rgba(545,137,239,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Halos */}
          {halos.map((h, i) => (
            <g key={i}>
              <circle cx={h.cx} cy={h.cy} r={h.radius}
                      fill="url(#familyHalo)" stroke="rgba(545,137,239,0.2)" strokeWidth={1} />
              <text x={h.cx} y={h.cy} textAnchor="middle" alignmentBaseline="middle"
                    fill="rgba(255,255,255,0.3)" fontSize={36} fontWeight={900}
                    style={{ pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: 4 }}>
                {h.etiqueta}
              </text>
            </g>
          ))}

          {/* Aristas (las inferidas van punteadas y más tenues) */}
          {view.edges.map((e, i) => {
            const a = positions.get(e.source);
            const b = positions.get(e.target);
            if (!a || !b) return null;
            const lit = !matches || (matches.has(e.source) && matches.has(e.target));
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={e.tipo === 'amistad' ? '#fa6800' : '#2d89ef'}
                    strokeWidth={e.tipo === 'amistad' ? 1 : 2}
                    strokeOpacity={lit ? (e.derivada ? 0.18 : 0.3) : 0.05}
                    strokeDasharray={e.derivada ? '6 6' : undefined} />
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
                        style={{ clipPath: 'circle(50%)', filter: st === 'fallecido' ? 'grayscale(1)' : undefined }}/>
                )}
                {(hovered === n.id || matches?.has(n.id)) && (
                  <g transform={`translate(0, ${size + 16})`}>
                    <rect x={-70} y={-12} width={140} height={24} rx={6} fill="rgba(0,0,0,0.9)" />
                    <text textAnchor="middle" y={4} fill="#fff" fontSize={11} fontWeight={600}>
                      {n.nombre}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Panel de la persona seleccionada */}
      {person && (
        <PersonPanel
          key={person.key}
          person={person}
          members={members}
          people={people}
          isHidden={hiddenSet.has(person.key)}
status={status[person.key]}
onSetStatus={(v) => setStatus(person.key, v)}
          onSetRelation={setRelation}
          onRemoveRelation={removeRelation}
          onRename={handleRename}
          onDelete={async (name) => { await deletePerson(name); setSelectedKey(null); }}
          onToggleHide={(key, hide) => { toggleHidden(key, hide); if (hide) setSelectedKey(null); }}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
}

const roundBtn = { background: '#1a1a1a', border: 0, color: '#fff', width: 44, height: 44, display: 'grid', placeItems: 'center' };
const pillBtn = { display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', background: '#1a1a1a', border: '1px solid #3a3a3a', color: '#fff', fontSize: 13 };
const errorBar = { position: 'absolute', top: 100, left: 16, right: 16, zIndex: 10, background: '#e51400', color: '#fff', padding: 12, fontSize: 13 };