import React, { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { norm } from '../../genograma/relationUtils';

export default function ConstellationSearch({ nodes, query, onQuery, onPick }) {
  const matches = useMemo(() => {
    const q = norm(query);
    return q ? nodes.filter((n) => norm(n.nombre).includes(q)) : [];
  }, [nodes, query]);

  return (
    <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
      <div style={box}>
        <Search size={16} color="#94a3b8" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar por nombre…"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14 }}
        />
        {query && (
          <button onClick={() => onQuery('')} style={{ background: 'none', border: 0, padding: 0 }} aria-label="Limpiar">
            <X size={16} color="#94a3b8" />
          </button>
        )}
      </div>

      {query && (
        <div style={dropdown}>
          {matches.slice(0, 8).map((n) => (
            <button key={n.id} onClick={() => onPick(n)} style={item}>
              {n.nombre}
              {!n.esMiembroIglesia && <small style={{ color: '#94a3b8' }}> · externo</small>}
            </button>
          ))}
          {!matches.length && <div style={{ ...item, color: '#94a3b8' }}>Sin resultados</div>}
          {matches.length > 8 && <div style={{ ...item, color: '#94a3b8' }}>+{matches.length - 8} más…</div>}
        </div>
      )}
    </div>
  );
}

const box = { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 20,
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' };
const dropdown = { position: 'absolute', top: '120%', left: 0, right: 0, background: '#1e293b',
  border: '1px solid #334155', borderRadius: 8, overflow: 'hidden', zIndex: 20 };
const item = { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent',
  border: 0, color: '#fff', fontSize: 14, cursor: 'pointer' };