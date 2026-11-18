import React from 'react';
import { BANDS } from '../../genograma/ageBands';

export default function BandChips({ value, onChange, counts, total }) {
  return (
    <div className="mt-chipbar">
      <button className={`mt-chip ${value === 'all' ? 'is-on' : ''}`} onClick={() => onChange('all')}>
        Todos · {total}
      </button>
      {BANDS.filter((b) => counts[b.id]).map((b) => (
        <button key={b.id} className={`mt-chip ${value === b.id ? 'is-on' : ''}`} onClick={() => onChange(b.id)}>
          {b.label.split(' (')[0]} · {counts[b.id]}
        </button>
      ))}
    </div>
  );
}