import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, EyeOff, Eye } from 'lucide-react';
import { norm } from '../../genograma/relationUtils';

export default function ExternalActions({ person, people, isHidden, onRename, onDelete, onToggleHide }) {
  const [name, setName] = useState(person.nombre);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const suggestions = useMemo(() => {
    const q = norm(name);
    const first = norm(person.nombre).split(' ')[0];
    return people
      .filter((p) => p.id !== person.key &&
        ((q.length > 2 && norm(p.nombre).includes(q)) || norm(p.nombre).split(' ')[0] === first))
      .sort((a, b) => Number(b.esMiembroIglesia) - Number(a.esMiembroIglesia))
      .slice(0, 5);
  }, [people, name, person]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const changed = name.trim() && norm(name) !== person.key;

  return (
    <>
      <h4>Corregir familiar externo</h4>
      <div className="mt-row" style={{ borderBottom: 0, flexWrap: 'nowrap' }}>
        <input className="mt-input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="mt-btn" disabled={busy || !changed} onClick={() => run(() => onRename(person.nombre, name))}>
          <Pencil size={14} /> Aplicar
        </button>
      </div>

      {suggestions.length > 0 && (
        <>
          <small className="mt-muted">¿Es la misma persona? Toca para fusionar:</small>
          <div className="mt-chips">
            {suggestions.map((p) => (
              <button key={p.id} className="mt-chip" onClick={() => setName(p.nombre)}>
                {p.nombre}{!p.esMiembroIglesia && ' · ext.'}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-row" style={{ borderBottom: 0, marginTop: 8 }}>
        <button className="mt-btn mt-btn--gray" style={{ flex: 1 }} disabled={busy}
                onClick={() => onToggleHide(person.key, !isHidden)}>
          {isHidden ? <><Eye size={14} /> Mostrar</> : <><EyeOff size={14} /> Ocultar</>}
        </button>
        <button className="mt-btn mt-btn--accent" style={{ flex: 1 }} disabled={busy}
                onClick={() => window.confirm(`¿Quitar a "${person.nombre}" de todos los genogramas?`) && run(() => onDelete(person.nombre))}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
      {error && <p className="mt-error">{error}</p>}
    </>
  );
}