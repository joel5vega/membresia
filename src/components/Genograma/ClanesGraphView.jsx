import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { memberService } from '../../services/memberService';
import { buildGlobalGraph } from '../../genograma/globalBuilder';
import { forceLayout } from '../../genograma/forceLayout';

export default function ClanesGraphView() {
  const navigate = useNavigate();
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.4 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    memberService.getMembers().then((members) => {
      const graphData = buildGlobalGraph(members);
      setData(graphData);
      setLoading(false);
    });
  }, []);

  const layoutPositions = useMemo(() => {
    if (!data.nodes.length) return new Map();
    return forceLayout(data.nodes, data.edges, {
      width: 4000, height: 3000, iterations: 600, pad: 200,
    });
  }, [data]);

  // Calcular halos basados en COMPONENTES CONEXOS REALES
  const familyHalos = useMemo(() => {
    if (!data.nodes.length || !layoutPositions.size) return [];
    
    // 1. Construir grafo de adyacencia
    const adj = new Map();
    data.nodes.forEach(n => adj.set(n.id, []));
    data.edges.forEach(e => {
      if (adj.has(e.source) && adj.has(e.target)) {
        adj.get(e.source).push(e.target);
        adj.get(e.target).push(e.source);
      }
    });

    // 2. Encontrar componentes conexos
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
        const vecinos = adj.get(curr) || [];
        vecinos.forEach(v => {
          if (!visitados.has(v)) {
            visitados.add(v);
            queue.push(v);
          }
        });
      }

      if (comp.length >= 3) {
        componentes.push(comp);
      }
    });

    // 3. Calcular centro y radio de cada componente
    const halos = [];
    componentes.forEach(comp => {
      let sumX = 0, sumY = 0, count = 0;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      comp.forEach(id => {
        const pos = layoutPositions.get(id);
        if (pos) {
          sumX += pos.x;
          sumY += pos.y;
          count++;
          minX = Math.min(minX, pos.x);
          maxX = Math.max(maxX, pos.x);
          minY = Math.min(minY, pos.y);
          maxY = Math.max(maxY, pos.y);
        }
      });

      if (count >= 3) {
        const cx = sumX / count;
        const cy = sumY / count;
        
        // Radio = la distancia máxima desde el centro hasta un miembro + margen
        let maxDist = 0;
        comp.forEach(id => {
          const pos = layoutPositions.get(id);
          if (pos) {
            const d = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2);
            maxDist = Math.max(maxDist, d);
          }
        });

        halos.push({ cx, cy, radius: maxDist + 40, count });
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Construyendo red global...</div>;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>
      
      {/* Header */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', padding: 10, borderRadius: '50%' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Constelación Canaán</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            {data.nodes.length} personas · {data.edges.length} conexiones · {familyHalos.length} grupos
          </p>
        </div>
      </div>

      {/* Controles Zoom */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => setTransform(p => ({...p, scale: p.scale + 0.2}))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 12, borderRadius: '50%', cursor: 'pointer' }}><ZoomIn size={20}/></button>
        <button onClick={() => setTransform(p => ({...p, scale: p.scale - 0.2}))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 12, borderRadius: '50%', cursor: 'pointer' }}><ZoomOut size={20}/></button>
        <button onClick={resetView} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 12, borderRadius: '50%', cursor: 'pointer' }}><RefreshCw size={20}/></button>
      </div>

      {/* Leyenda */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', padding: 16, borderRadius: 12, color: '#fff', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} /> Familia / Clan</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ec4899' }} /> Amistades</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#64748b' }} /> Miembros solos</div>
      </div>

      {/* Grafo SVG */}
      <svg
        width="100%" height="100%"
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          
          <radialGradient id="familyHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.12)" />
            <stop offset="70%" stopColor="rgba(59, 130, 246, 0.04)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          
          {/* Halos REALES por grupo conexo */}
          {familyHalos.map((halo, i) => (
            <g key={`halo-${i}`}>
              <circle
                cx={halo.cx}
                cy={halo.cy}
                r={halo.radius}
                fill="url(#familyHalo)"
                stroke="rgba(59, 130, 246, 0.15)"
                strokeWidth={1}
                strokeDasharray="8 4"
              />
            </g>
          ))}

          {/* Aristas */}
          {data.edges.map((edge, i) => {
            const source = layoutPositions.get(edge.source);
            const target = layoutPositions.get(edge.target);
            if (!source || !target) return null;
            const isAmistad = edge.tipo === 'amistad';
            return (
              <line
                key={i}
                x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                stroke={isAmistad ? '#ec4899' : '#3b82f6'}
                strokeWidth={isAmistad ? 1 : 2}
                strokeOpacity={hoveredNode && (edge.source !== hoveredNode && edge.target !== hoveredNode) ? 0.05 : 0.35}
                strokeDasharray={isAmistad ? '4 4' : 'none'}
              />
            );
          })}

          {/* Nodos */}
          {data.nodes.map((node) => {
            const pos = layoutPositions.get(node.id);
            if (!pos) return null;
            
            const isHovered = hoveredNode === node.id;
            const size = node.esMiembroIglesia ? 14 : 9;
            
            let color = '#64748b';
            if (node.cluster === 'familia') color = '#3b82f6';
            if (node.cluster === 'amigos') color = '#ec4899';

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {isHovered && <circle r={size * 2.5} fill="url(#glow)" />}
                
                <circle
                  r={size}
                  fill={color}
                  stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isHovered ? 3 : 1}
                  style={{ transition: 'all 0.2s' }}
                />

                {node.photoUrl && (
                  <image
                    href={node.photoUrl}
                    x={-size + 2} y={-size + 2}
                    width={(size - 2) * 2} height={(size - 2) * 2}
                    style={{ clipPath: 'circle(50%)', opacity: 0.9 }}
                  />
                )}

                {isHovered && (
                  <g transform={`translate(0, ${size + 16})`}>
                    <rect x={-70} y={-12} width={140} height={24} rx={6} fill="rgba(0,0,0,0.9)" />
                    <text textAnchor="middle" y={4} fill="#fff" fontSize={11} fontWeight={600}>
                      {node.nombre.length > 20 ? node.nombre.substring(0, 18) + '…' : node.nombre}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}