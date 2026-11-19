import React, { useMemo, useState } from 'react';
import { X, Trash2, Plus, Search, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RELACIONES, norm, relationsOf } from '../../genograma/relationUtils';
import ExternalActions from './ExternalActions';
import SuggestionsList from './SuggestionsList';
import StatusActions from './StatusActions';
import ConvertToMember from './ConvertToMember';
import { STATUS_LABEL } from '../../genograma/statuses';
export default function PersonPanel({
  person, members, people, isHidden, status, onSetStatus,
  onSetRelation, onRemoveRelation, onRename, onDelete, onToggleHide, onConvert, onClose,
}) {
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
    const related = new Set(relations.filter((r) => !r.inferida).map((r) => r.key));
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
    <div className="mt-sheet" role="dialog" aria-label={person.nombre}>
      <div className="mt-sheet__grip" />

      <header className="mt-sheet__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="mt-sheet__title">{person.nombre}</h3>
          <small className="mt-muted">
  {person.esMiembro ? 'Miembro registrado' : 'Familiar externo'}
  {status && status !== 'activo' ? ` · ${STATUS_LABEL[status]}` : ''}
</small>
        </div>
        {person.esMiembro && (
          <button className="mt-btn mt-btn--ghost" onClick={() => navigate(`/members/${person.realId}/genograma`)}>
            <Network size={16} /> Genograma
          </button>
        )}
        <button className="mt-btn mt-btn--icon" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
      </header>

      <StatusActions value={status} onChange={onSetStatus} />
<h4>Relaciones de {person.nombre.split(' ')[0]}</h4>
      {relations.length === 0 && <p className="mt-muted">Sin relaciones registradas.</p>}

      {relations.map((r) => r.inferida ? (
        <div key={r.key} className="mt-row is-inferred">
          <span className="mt-row__name">{r.nombre} <em className="mt-muted">· inferida</em></span>
          <select className="mt-input" value={RELACIONES.includes(r.relacion) ? r.relacion : ''}
                  disabled={busy}
                  onChange={(e) => e.target.value && run(() => onSetRelation(person, r, e.target.value))}>
            {!RELACIONES.includes(r.relacion) && <option value="">{r.relacion}</option>}
            {RELACIONES.map((x) => <option key={x}>{x}</option>)}
          </select>
          <button className="mt-btn mt-btn--ghost" disabled={busy || !RELACIONES.includes(r.relacion)}
                  onClick={() => run(() => onSetRelation(person, r, r.relacion))}>Guardar</button>
        </div>
      ) : (
        <div key={r.key} className="mt-row">
          <span className="mt-row__name">{r.nombre}</span>
          <select className="mt-input" value={r.relacion} disabled={busy}
                  onChange={(e) => run(() => onSetRelation(person, r, e.target.value))}>
            {RELACIONES.map((x) => <option key={x}>{x}</option>)}
          </select>
          <button className="mt-btn mt-btn--icon" disabled={busy} aria-label={`Quitar a ${r.nombre}`}
                  onClick={() => run(() => onRemoveRelation(person, r))}>
            <Trash2 size={18} color="#e51400" />
          </button>
        </div>
      ))}

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

{!person.esMiembro && (
  <>
    <ConvertToMember person={person} onConvert={onConvert} />
    <ExternalActions person={person} people={people} isHidden={isHidden}
                     onRename={onRename} onDelete={onDelete} onToggleHide={onToggleHide} />
  </>
)}
    </div>
  );
}