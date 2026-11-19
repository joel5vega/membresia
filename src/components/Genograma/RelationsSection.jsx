import React, { useMemo, useState } from 'react';
import { Trash2, Plus, Search } from 'lucide-react';
import { RELACIONES, norm, relationsOf } from '../../genograma/relationUtils';
import SuggestionsList from './SuggestionsList';

export default function RelationsSection({ person, members, people, onSetRelation, onRemoveRelation }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('existing');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState(null);
  const [newName, setNewName] = useState('');
  const [relacion, setRelacion] = useState('Amigo');

  const relations = useMemo(() => relationsOf(person, members), [person, members]);

  // Solo se excluyen las GUARDADAS; las inferidas siguen disponibles para fijarlas
  const candidates = useMemo(() => {
    const saved = new Set(relations.filter((r) => !r.inferida).map((r) => r.key));
    const q = norm(search);
    return people
      .filter((p) => p.id !== person.key && !saved.has(p.id) && (!q || norm(p.nombre).includes(q)))
      .slice(0, 30);
  }, [people, relations, search, person.key]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const add = () => {
    const other = mode === 'existing'
      ? picked && { key: picked.id, nombre: picked.nombre, realId: picked.realId, sexo: picked.sexo }
      : newName.trim() && { key: norm(newName), nombre: newName.trim(), realId: null };
    if (!other) return setError('Elige o escribe una persona.');
    run(async () => {
      await onSetRelation(person, other, relacion);
      setPicked(null); setNewName(''); setSearch('');
    });
  };

  return (
    <>
      <h4>Relaciones de {person.nombre.split(' ')[0]}</h4>
      {relations.length === 0 && <p className="mt-muted">Sin relaciones registradas.</p>}

      {relations.map((r) => {
        const valid = RELACIONES.includes(r.relacion);
        return (
          <div key={r.key} className={`mt-row ${r.inferida ? 'is-inferred' : ''}`}>
            <span className="mt-row__name">
              {r.nombre} {r.inferida && <em className="mt-muted">· inferida</em>}
            </span>
            <select className="mt-input" value={valid ? r.relacion : ''} disabled={busy}
                    onChange={(e) => e.target.value && run(() => onSetRelation(person, r, e.target.value))}>
              {!valid && <option value="">{r.relacion}</option>}
              {RELACIONES.map((x) => <option key={x}>{x}</option>)}
            </select>
            {r.inferida ? (
              <button className="mt-btn mt-btn--ghost" disabled={busy || !valid}
                      onClick={() => run(() => onSetRelation(person, r, r.relacion))}>Guardar</button>
            ) : (
              <button className="mt-btn mt-btn--icon" disabled={busy} aria-label={`Quitar a ${r.nombre}`}
                      onClick={() => run(() => onRemoveRelation(person, r))}>
                <Trash2 size={18} color="#e51400" />
              </button>
            )}
          </div>
        );
      })}

      <SuggestionsList person={person} people={people} onSetRelation={onSetRelation} />

      <h4>Agregar relación</h4>
      <div className="mt-seg">
        <button className={mode === 'existing' ? 'is-on' : ''} onClick={() => setMode('existing')}>Existente</button>
        <button className={mode === 'new' ? 'is-on' : ''} onClick={() => setMode('new')}>Nombre nuevo</button>
      </div>

      {mode === 'existing' ? (
        <>
          <div className="mt-search__box" style={{ background: 'var(--card-soft)' }}>
            <Search size={16} color="#a6a6a6" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar persona…" />
          </div>
          <div className="mt-list">
            {candidates.map((p) => (
              <button key={p.id} className={`mt-item ${picked?.id === p.id ? 'is-on' : ''}`} onClick={() => setPicked(p)}>
                {p.nombre}{!p.esMiembroIglesia && <small> · externo</small>}
              </button>
            ))}
            {!candidates.length && <div className="mt-item mt-muted" style={{ lineHeight: '44px' }}>Sin resultados</div>}
          </div>
        </>
      ) : (
        <input className="mt-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej. Juan Pérez" />
      )}

      <div className="mt-row" style={{ borderBottom: 0 }}>
        <span className="mt-muted">Es su</span>
        <select className="mt-input" value={relacion} onChange={(e) => setRelacion(e.target.value)}>
          {RELACIONES.map((x) => <option key={x}>{x}</option>)}
        </select>
        <button className="mt-btn mt-btn--green" onClick={add} disabled={busy}><Plus size={16} /> Agregar</button>
      </div>

      {error && <p className="mt-error">{error}</p>}
    </>
  );
}