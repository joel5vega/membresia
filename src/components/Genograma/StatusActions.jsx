import React from 'react';
import { STATUS } from '../../genograma/statuses';

export default function StatusActions({ value = 'activo', onChange }) {
  return (
    <>
      <h4>Estado</h4>
      <div className="mt-seg">
        {STATUS.map((s) => (
          <button key={s.id} className={value === s.id ? 'is-on' : ''} onClick={() => onChange(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}