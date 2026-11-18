import React, { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { norm } from '../../genograma/relationUtils';

export default function ConstellationSearch({ nodes, query, onQuery, onPick }) {
  const matches = useMemo(() => {
    const q = norm(query);
    return q ? nodes.filter((n) => norm(n.nombre).includes(q)) : [];
  }, [nodes, query]);

  return (
    <div className="mt-search">
      <div className="mt-search__box">
        <Search size={16} color="#a6a6a6" />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Buscar por nombre…" />
        {query && (
          <button className="mt-btn mt-btn--icon" style={{ minWidth: 32, minHeight: 32 }}
                  onClick={() => onQuery('')} aria-label="Limpiar"><X size={16} /></button>
        )}
      </div>

      {query && (
        <div className="mt-search__drop">
          {matches.slice(0, 8).map((n) => (
            <button key={n.id} className="mt-item" onClick={() => { onPick(n); onQuery(''); }}>
              {n.nombre}{!n.esMiembroIglesia && <small className="mt-muted"> · externo</small>}
            </button>
          ))}
          {!matches.length && <div className="mt-item mt-muted" style={{ lineHeight: '44px' }}>Sin resultados</div>}
          {matches.length > 8 && <div className="mt-item mt-muted" style={{ lineHeight: '44px' }}>+{matches.length - 8} más…</div>}
        </div>
      )}
    </div>
  );
}