import React from 'react';

const ITEMS = [
  ['externos', 'Ver externos'],
  ['amistades', 'Ver amistades'],
  ['fallecidos', 'Ver fallecidos'],
  ['inactivos', 'Ver no asisten'],
];

export default function FilterBar({ filters, onChange, counts }) {
  const toggle = (k) => onChange({ ...filters, [k]: !filters[k] });
  return (
    <div className="mt-chipbar" style={{ flexBasis: '100%', marginBottom: 0 }}>
      {ITEMS.map(([k, label]) => (
        <button key={k} className={`mt-chip ${filters[k] ? 'is-on' : ''}`} onClick={() => toggle(k)}>
          {filters[k] ? '✓ ' : ''}{label} · {counts[k]}
        </button>
      ))}
      <span className="mt-muted" style={{ fontSize: '.75rem', alignSelf: 'center', whiteSpace: 'nowrap' }}>
        ● miembro · ○ externo · ✝ fallecido · ┄ no asiste · <span style={{ color: '#00aba9' }}>◯ núcleo</span>
      </span>
    </div>
  );
}