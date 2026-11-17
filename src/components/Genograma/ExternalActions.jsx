import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, EyeOff, Eye } from 'lucide-react';
import { norm } from '../../genograma/relationUtils';

export default function ExternalActions({ person, people, isHidden, onRename, onDelete, onToggleHide }) {
  const [name, setName] = useState(person.nombre);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Sugerencias: personas que comparten primer nombre o contienen el texto
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
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Corregir familiar externo</h4>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
        <button disabled={busy || !changed} onClick={() => run(() => onRename(person.nombre, name))} style={btn('#2563eb')}>
          <Pencil size={14} /> Aplicar
        </button>
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <small style={{ color: '#64748b' }}>¿Es la misma persona? Toca para fusionar:</small>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {suggestions.map((p) => (
              <button key={p.id} onClick={() => setName(p.nombre)} style={chip}>
                {p.nombre}{!p.esMiembroIglesia && ' · ext.'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button disabled={busy} onClick={() => onToggleHide(person.key, !isHidden)} style={btn('#64748b')}>
          {isHidden ? <><Eye size={14} /> Mostrar</> : <><EyeOff size={14} /> Ocultar</>}
        </button>
        <button disabled={busy} style={btn('#ef4444')}
          onClick={() => window.confirm(`¿Quitar a "${person.nombre}" de todos los genogramas?`) && run(() => onDelete(person.nombre))}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
    </div>
  );
}

const input = { flex: 1, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b' };
const chip = { padding: '4px 10px', borderRadius: 14, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1e293b', fontSize: 12 };
const btn = (bg) => ({ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8,
  border: 0, background: bg, color: '#fff', fontWeight: 600, fontSize: 13 });