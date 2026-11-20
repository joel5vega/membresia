import React, { useState } from 'react';
import { Pencil, Trash2, Check, X, Network, FileEdit, Phone } from 'lucide-react';
import BirthInput from './BirthInput';
import { formatBirth } from '../genograma/birthdate';

const SEX = { M: '#2d89ef', F: '#6a00ff' };
const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const nameOf = (m) => m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();


export default function MemberRow({ member, onSave, onDelete, onGenograma, onFullEdit }) {
  const [editing, setEditing] = useState(false);
  const [celular, setCelular] = useState('');
  const [fecha, setFecha] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const name = nameOf(member);
  const start = () => {
    setCelular(member.celular || '');
    setFecha(String(member.fechaNacimiento || '').slice(0, 10));
    setError(''); setEditing(true);
  };
  const cancel = () => setEditing(false);

  const save = async () => {
    const patch = {};
    if (celular.trim() !== (member.celular || '')) patch.celular = celular.trim();
    if (fecha !== String(member.fechaNacimiento || '').slice(0, 10)) patch.fechaNacimiento = fecha;
    if (!Object.keys(patch).length) return cancel();
    setBusy(true); setError('');
    try { await onSave(member.id, patch); setEditing(false); }
    catch (e) { setError('No se pudo guardar: ' + e.message); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    try { await onDelete(member.id); }
    catch (e) { setError('No se pudo eliminar: ' + e.message); setBusy(false); }
  };

  const onKey = (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  return (
    <div className={`ml-row ${editing ? 'is-editing' : ''}`}>
      <span className="ml-avatar" style={{ background: SEX[member.sexo] || '#555' }}>
        {member.photoUrl
          ? <img src={member.photoUrl} alt="" loading="lazy" />
          : initials(name)}
      </span>

      <div className="ml-main">
        <strong className="ml-name">{name}</strong>
        <small className="ml-class">{member.clase || 'Sin clase'}</small>
      </div>

      {editing ? (
        <div className="ml-fields">
          <input className="mt-input" type="tel" inputMode="tel" placeholder="Celular" autoFocus
                 value={celular} onChange={(e) => setCelular(e.target.value)} onKeyDown={onKey} />
          <BirthInput value={fecha} onChange={(v) => setFecha(v)} onKeyDown={onKey} />
        </div>
      ) : (
        <div className="ml-data">
          {member.celular
            ? <a href={`tel:${member.celular}`} className="ml-phone"><Phone size={12} /> {member.celular}</a>
            : <span className="mt-muted">Sin celular</span>}
          <span className="mt-muted">{formatBirth(member.fechaNacimiento)}</span>
        </div>
      )}

      <div className="ml-actions">
        {editing ? (
          <>
            <button className="mt-btn mt-btn--green mt-btn--sq" disabled={busy} onClick={save} aria-label="Guardar"><Check size={18} /></button>
            <button className="mt-btn mt-btn--gray mt-btn--sq" disabled={busy} onClick={cancel} aria-label="Cancelar"><X size={18} /></button>
          </>
        ) : (
          <>
            <button className="mt-btn mt-btn--sq" onClick={start} aria-label="Editar celular y nacimiento"><Pencil size={16} /></button>
            <button className="mt-btn mt-btn--ghost mt-btn--sq" onClick={() => onGenograma(member.id)} aria-label="Genograma"><Network size={16} /></button>
            <button className="mt-btn mt-btn--ghost mt-btn--sq" onClick={() => onFullEdit(member.id)} aria-label="Ficha completa"><FileEdit size={16} /></button>
            <button className="mt-btn mt-btn--accent mt-btn--sq" disabled={busy} onClick={remove} aria-label="Eliminar"><Trash2 size={16} /></button>
          </>
        )}
      </div>

      {error && <p className="mt-error ml-error">{error}</p>}
    </div>
  );
}