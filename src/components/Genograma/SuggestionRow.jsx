import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { RELACIONES } from '../../genograma/relationUtils';

export default function SuggestionRow({ s, busy, onLink }) {
  const [rel, setRel] = useState(s.relacion);
  const c = s.person;
  const meta = [c.edad != null && `${c.edad} años`, c.esMiembroIglesia ? 'Miembro' : 'Externo', ...s.reasons]
    .filter(Boolean).join(' · ');

  return (
    <div className="mt-sugg">
      <div style={{ flex: '1 1 100%' }}>
        <strong>{c.nombre}</strong>
        <small className="mt-muted" style={{ display: 'block' }}>{meta}</small>
      </div>
      <span className="mt-muted">Es su</span>
      <select className="mt-input" style={{ flex: 1, width: 'auto' }} value={rel} onChange={(e) => setRel(e.target.value)}>
        {RELACIONES.map((x) => <option key={x}>{x}</option>)}
      </select>
      <button className="mt-btn mt-btn--green" disabled={busy} onClick={() => onLink(c, rel)}>
        <Plus size={16} /> Agregar
      </button>
    </div>
  );
}