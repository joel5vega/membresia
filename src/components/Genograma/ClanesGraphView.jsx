import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, RefreshCw, Filter, ChevronDown } from 'lucide-react';
import { memberService } from '../../services/memberService';
import { buildGlobalGraph } from '../../genograma/globalBuilder';
import { forceLayout } from '../../genograma/forceLayout';
import RelationEditorModal from './RelationEditorModal'; // <-- Importamos el modal

export default function ClanesGraphView() {
  const navigate = useNavigate();
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [rawMembers, setRawMembers] = useState([]); // Guardamos los miembros crudos para el modal
  const [loading, setLoading] = useState(true);
  
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null); // <-- Nodo que se está editando
  const [showFilters, setShowFilters] = useState(false);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.4 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const fetchData = () => {
    setLoading(true);
    memberService.getMembers().then((members) => {
      setRawMembers(members); // Guardar para el modal
      const graphData = buildGlobalGraph(members);
      setData(graphData);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const layoutPositions = useMemo(() => {
    if (!data.nodes.length) return new Map();
    return forceLayout(data.nodes, data.edges, { width: 4000, height: 3000, iterations: 600, pad: 200 });
  }, [data]);

  // Calcular halos y APELLIDOS
  const familyHalos = useMemo(() => {
    if (!data.nodes.length || !layoutPositions.size) return [];
    const adj = new Map();
    data.nodes.forEach(n => adj.set(n.id, []));
    data.edges.forEach(e => {
      if (adj.has(e.source) && adj.has(e.target)) {
        adj.get(e.source).push(e.target);
        adj.get(e.target).push(e.source);
      }
    });

    const visitados = new Set();
    const componentes = [];

    data.nodes.forEach(n => {
      if (visitados.has(n.id) || !adj.get(n.id)?.length) return;
      const comp = [];
      const queue = [n.id];
      visitados.add(n.id);
      while (queue.length > 0) {
        const curr = queue.shift();
        comp.push(curr);
        (adj.get(curr) || []).forEach(v => {
          if (!visitados.has(v)) { visitados.add(v); queue.push(v); }
        });
      }
      if (comp.length >= 3) componentes.push(comp);
    });

    const halos = [];
    componentes.forEach(comp => {
      let sumX = 0, sumY = 0, count = 0;
      comp.forEach(id => {
        const pos = layoutPositions.get(id);
        if (pos) { sumX += pos.x; sumY += pos.y; count++; }
      });
      if (count >= 3) {
        const cx = sumX / count;
        const cy = sumY / count;
        let maxDist = 0;
        comp.forEach(id => {
          const pos = layoutPositions.get(id);
          if (pos) {
            const d = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2);
            maxDist = Math.max(maxDist, d);
          }
        });

        // Lógica de Apellido Paterno + Inicial Materna
        const nombres = comp.map(id => {
           const node = data.nodes.find(n => n.id === id);
           return node ? node.nombre : "";
        }).filter(Boolean);
        
        // Encontrar el apellido más común (última palabra)
        const apellidos = nombres.map(n => n.split(' ').filter(Boolean).slice(-1)[0] || '');
        const counts = {};
        apellidos.forEach(a => { if(a) counts[a] = (counts[a] || 0) + 1; });
        const apellidoComun = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'Familia';
        
        // Tomar el segundo apellido (materno) de un ejemplo para la inicial
        let apellidoMaternoInicial = '';
        const nombreEjemplo = nombres[0]; // Tomamos el primero
        const partes = nombreEjemplo.split(' ');
        if (partes.length >= 3) {
           apellidoMaternoInicial = partes[partes.length - 2][0]; // Penúltima palabra
        } else if (partes.length === 2) {
           apellidoMaternoInicial = partes[1][0]; // Si solo hay 2, es el nombre y el apellido
        }

        const etiquetaCluster = `${apellidoComun} ${apellidoMaternoInicial ? apellidoMaternoInicial + '.' : ''}`;

        halos.push({ cx, cy, radius: maxDist + 40, count, etiqueta: etiquetaCluster });
      }
    });

    return halos;
  }, [data, layoutPositions]);

  const handleWheel = (e) => {
    e.preventDefault();
    const scale = transform.scale - e.deltaY * 0.001;
    setTransform(prev => ({ ...prev, scale: Math.max(0.1, Math.min(3, scale)) }));
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { isDragging.current = false; };
  const resetView = () => setTransform({ x: 0, y: 0, scale: 0.4 });

const handleNodeClick = (node) => {
  if (node.esMiembroIglesia) {
    setSelectedNodeForEdit({ 
      type: 'new', 
      source: { 
        id: node.id, 
        realId: node.realId || node.id, 
        nombre: node.nombre 
      } 
    });
  } else {
    // Lógica de anclas múltiples (prioridad: seleccionado → padre → madre → hermano)
    const anclas = rawMembers.filter(m => 
      m.genograma?.some(fam => 
        fam.nombre.toLowerCase().trim() === node.nombre.toLowerCase().trim()
      )
    );
    
    if (anclas.length === 0) {
      alert("No se encontró el miembro original.");
      return;
    }
    
    // Priorizar según jerarquía
    const jerarquia = ['padre', 'madre', 'hermano', 'hermana'];
    let anclaSeleccionada = anclas[0]; // default
    
    // Si hay múltiples, buscar el que tenga la relación de mayor jerarquía
    if (anclas.length > 1) {
      for (const rel of jerarquia) {
        const found = anclas.find(a => 
          a.genograma?.some(f => 
            f.nombre.toLowerCase().trim() === node.nombre.toLowerCase().trim() &&
            f.relacion.toLowerCase().trim() === rel
          )
        );
        if (found) { anclaSeleccionada = found; break; }
      }
    }
    
    const relacionExistente = anclaSeleccionada.genograma.find(fam => 
      fam.nombre.toLowerCase().trim() === node.nombre.toLowerCase().trim()
    );
    
    setSelectedNodeForEdit({ 
      type: 'edit', 
      source: { 
        ...anclaSeleccionada, 
        realId: anclaSeleccionada.id, 
        nombre: anclaSeleccionada.nombreCompleto || `${anclaSeleccionada.nombre} ${anclaSeleccionada.apellido}` 
      },
      target: node,
      relacion: relacionExistente.relacion
    });
  }
};
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Construyendo red global...</div>;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>
      
      {/* Header con Filtros */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', padding: 10, borderRadius: '50%' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Constelación Canaán</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            {data.nodes.length} personas · {data.edges.length} conexiones
          </p>
        </div>
        
        {/* Botón de Filtros (Mockup listo para conectar) */}
        <div style={{ position: 'relative', marginLeft: 24 }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <Filter size={16} /> Filtrar por Iglesia <ChevronDown size={14} />
          </button>
          {showFilters && (
            <div style={{ position: 'absolute', top: '120%', left: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 12, width: 200, zIndex: 20, color: '#fff' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> IEDB Canaán (Sede Central)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" /> Iglesia Misiones (Zona Sur)
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Grafo SVG */}
      <svg width="100%" height="100%" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}>
        <defs>
          <radialGradient id="familyHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.12)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
       {/* Halos y Etiquetas */}
{familyHalos.map((halo, i) => (
  <g key={`halo-${i}`}>
    {/* Halo de fondo */}
    <circle cx={halo.cx} cy={halo.cy} r={halo.radius} fill="url(#familyHalo)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth={1} />
    
    {/* Etiqueta del APELLIDO en el centro del grupo */}
    <text 
      x={halo.cx} 
      y={halo.cy} 
      textAnchor="middle" 
      alignmentBaseline="middle" 
      fill="rgba(255,255,255,0.3)" 
      fontSize={36} 
      fontWeight={900} 
      style={{ pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: 4 }}
    >
      {halo.etiqueta}
    </text>
  </g>
))}

          {/* Aristas */}
          {data.edges.map((edge, i) => {
            const source = layoutPositions.get(edge.source);
            const target = layoutPositions.get(edge.target);
            if (!source || !target) return null;
            return <line key={i} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={edge.tipo === 'amistad' ? '#ec4899' : '#3b82f6'} strokeWidth={edge.tipo === 'amistad' ? 1 : 2} strokeOpacity={0.3} />;
          })}

          {/* Nodos */}
          {data.nodes.map((node) => {
            const pos = layoutPositions.get(node.id);
            if (!pos) return null;
            const isHovered = hoveredNode === node.id;
            const size = node.esMiembroIglesia ? 14 : 9;
            return (
              <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} onClick={() => handleNodeClick(node)} style={{ cursor: 'pointer' }}>
                <circle r={size} fill={node.cluster === 'familia' ? '#3b82f6' : node.cluster === 'amigos' ? '#ec4899' : '#64748b'} stroke={isHovered ? '#fff' : 'transparent'} strokeWidth={2} />
                {node.photoUrl && <image href={node.photoUrl} x={-size+2} y={-size+2} width={(size-2)*2} height={(size-2)*2} style={{ clipPath: 'circle(50%)' }} />}
                
                {/* Etiqueta de Nombre al pasar el mouse */}
                {isHovered && (
                  <g transform={`translate(0, ${size + 16})`}>
                    <rect x={-70} y={-12} width={140} height={24} rx={6} fill="rgba(0,0,0,0.9)" />
                    <text textAnchor="middle" y={4} fill="#fff" fontSize={11} fontWeight={600}>{node.nombre}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Modal de Edición */}
      {selectedNodeForEdit && (
  <RelationEditorModal 
    editData={selectedNodeForEdit}  // ← Prop correcta
    allMembers={rawMembers} 
    onClose={() => setSelectedNodeForEdit(null)}
    onSave={() => { setSelectedNodeForEdit(null); fetchData(); }} 
  />
)}
    </div>
  );
}