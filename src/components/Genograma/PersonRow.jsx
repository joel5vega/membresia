import React from 'react';

const SEX = { M: '#2d89ef', F: '#6a00ff' };
import { STATUS_LABEL } from '../../genograma/statuses';
const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function PersonRow({ p, onClick }) {
  const meta = [p.edad != null && `${p.edad} años`, p.esMiembroIglesia ? p.clase || 'Miembro' : 'Externo', p.estado && STATUS_LABEL[p.estado]]
    .filter(Boolean).join(' · ');
  return (
    <button className="mt-person" onClick={onClick}>
      <span className="mt-avatar" style={{ background: SEX[p.sexo] || '#555' }}>
        {p.photoUrl ? <img src={p.photoUrl} alt="" /> : initials(p.nombre)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.nombre}
        </strong>
        <small className="mt-muted">{meta}</small>
      </span>
      {p.grado > 0 && <small className="mt-muted">{p.grado} rel.</small>}
    </button>
  );
}