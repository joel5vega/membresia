import React, { useState } from 'react';
import { norm } from '../../genograma/relationUtils';

export default function DetailsSection({ ownerId, ownerName, person, members, onSave }) {
  const owner = members.find((m) => m.id === ownerId);
  const entry = (owner?.genograma || []).find((p) => norm(p.nombre) === norm(person.nombre));

  const [form, setForm] = useState({
    edad: entry?.edad ?? '', sexo: entry?.sexo || '', viveConElMiembro: !!entry?.viveConElMiembro,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!entry) return null;

  const save = async () => {
    setBusy(true); setError('');
    try { await onSave(ownerId, person.nombre, form); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <h4>Detalles (en el genograma de {ownerName.split(' ')[0]})</h4>
      <div className="mt-row" style={{ borderBottom: 0 }}>
        <input className="mt-input" type="number" min="0" placeholder="Edad" value={form.edad}
               onChange={(e) => setForm((f) => ({ ...f, edad: e.target.value }))} />
        <select className="mt-input" value={form.sexo}
                onChange={(e) => setForm((f) => ({ ...f, sexo: e.target.value }))}>
          <option value="">Sexo automático</option><option value="M">Varón</option><option value="F">Mujer</option>
        </select>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
        <input type="checkbox" checked={form.viveConElMiembro}
               onChange={(e) => setForm((f) => ({ ...f, viveConElMiembro: e.target.checked }))} />
        Vive en la misma vivienda
      </label>
      <button className="mt-btn" disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar detalles'}</button>
      {error && <p className="mt-error">{error}</p>}
    </>
  );
}