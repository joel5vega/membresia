import React, { useMemo, useState } from 'react';
import { X, Trash2, Plus, Search, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RELACIONES, norm, relationsOf } from '../../genograma/relationUtils';

export default function PersonPanel({ person, members, people, onSetRelation, onRemoveRelation, onClose }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('existing');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState(null);
  const [newName, setNewName] = useState('');
  const [relacion, setRelacion] = useState('Amigo');

  const relations = useMemo(() => relationsOf(person, members), [person, members]);

  const candidates = useMemo(() => {
    const related = new Set(relations.map((r) => r.key));
    const q = norm(search);
    return people
      .filter((p) => p.id !== person.key && !related.has(p.id) && (!q || norm(p.nombre).includes(q)))
      .slice(0, 30);
  }, [people, relations, search, person.key]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const add = () => {
    const other = mode === 'existing'
      ? picked && { key: picked.id, nombre: picked.nombre, realId: picked.realId }
      : newName.trim() && { key: norm(newName), nombre: newName.trim(), realId: null };
    if (!other) return setError('Elige o escribe una persona.');
    run(async () => {
      await onSetRelation(person, other, relacion);
      setPicked(null); setNewName(''); setSearch('');
    });
  };

  return (
    <div style={sheet}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, color: '#A63232' }}>{person.nombre}</h3>
          <small style={{ color: C.mute }}>{person.esMiembro ? 'Miembro registrado' : 'Familiar externo'}</small>
        </div>
        {person.esMiembro && (
          <button onClick={() => navigate(`/members/${person.realId}/genograma`)} style={ghost} title="Ver genograma">
            <Network size={16} /> Genograma
          </button>
        )}
        <button onClick={onClose} style={{ background: 'none', border: 0 }} aria-label="Cerrar">
          <X size={20} color={C.mute} />
        </button>
      </div>

      {/* Relaciones existentes */}
      <p style={hint}>Cada fila indica qué es esa persona para {person.nombre.split(' ')[0]}.</p>
      {relations.length === 0 && <p style={{ ...hint, fontStyle: 'italic' }}>Sin relaciones registradas.</p>}
      {relations.map((r) => (
        <div key={r.key} style={row}>
          <span style={{ flex: 1, minWidth: 0, color: C.text, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.nombre}
          </span>
          <select value={r.relacion} disabled={busy} style={{ ...field, width: 120 }}
            onChange={(e) => run(() => onSetRelation(person, r, e.target.value))}>
            {RELACIONES.map((x) => <option key={x}>{x}</option>)}
          </select>
          <button disabled={busy} onClick={() => run(() => onRemoveRelation(person, r))}
            style={{ background: 'none', border: 0 }} aria-label="Eliminar relación">
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      ))}

      {/* Nueva relación */}
      <h4 style={{ margin: '16px 0 8px', color: C.text }}>Agregar relación</h4>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {[['existing', 'Persona existente'], ['new', 'Nombre nuevo']].map(([val, text]) => (
          <button key={val} onClick={() => setMode(val)}
            style={{ ...tab, background: mode === val ? '#A63232' : '#f1f5f9', color: mode === val ? '#fff' : '#475569' }}>
            {text}
          </button>
        ))}
      </div>

      {mode === 'existing' ? (
        <>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: '#94a3b8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar persona…"
              style={{ ...field, width: '100%', paddingLeft: 32 }} />
          </div>
          <div style={{ maxHeight: 130, overflowY: 'auto', border: `1px solid ${C.line}`, borderRadius: 8, marginTop: 6 }}>
            {candidates.map((p) => (
              <div key={p.id} onClick={() => setPicked(p)}
                style={{ padding: '8px 10px', cursor: 'pointer', fontSize: 14, color: C.text,
                  background: picked?.id === p.id ? '#fee2e2' : 'transparent' }}>
                {p.nombre}{!p.esMiembroIglesia && <small style={{ color: C.mute }}> · externo</small>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Juan Pérez"
          style={{ ...field, width: '100%' }} />
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: C.mute }}>Es su</span>
        <select value={relacion} onChange={(e) => setRelacion(e.target.value)} style={{ ...field, flex: 1 }}>
          {RELACIONES.map((x) => <option key={x}>{x}</option>)}
        </select>
        <button onClick={add} disabled={busy} style={addBtn}><Plus size={16} /> Agregar</button>
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
    </div>
  );
}

// Estilos explícitos: los globales de index.css pintan inputs y spans para tema oscuro
const C = { text: '#1e293b', mute: '#64748b', line: '#e2e8f0' };
const field = { padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: C.text, boxSizing: 'border-box' };
const sheet = { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 2000, maxHeight: '55vh', overflowY: 'auto',
  background: '#fff', borderRadius: '16px 16px 0 0', padding: 16, boxShadow: '0 -8px 30px rgba(0,0,0,.5)' };
const row = { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.line}` };
const hint = { fontSize: 12, color: C.mute, margin: '10px 0 4px' };
const tab = { flex: 1, padding: 8, borderRadius: 8, border: 0, fontWeight: 600, fontSize: 13 };
const ghost = { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8,
  border: '1px solid #cbd5e1', background: '#fff', color: C.text, fontSize: 12 };
const addBtn = { display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8,
  border: 0, background: '#10b981', color: '#fff', fontWeight: 600 };