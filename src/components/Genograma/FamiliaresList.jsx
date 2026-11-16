import React from 'react';
import { COLOR_SEXO } from '../../genograma/model';

export default function FamiliaresList({ nodes, selectedIndex, onSelect }) {
  const familiares = nodes.filter((n) => !n.esRaiz);
  if (!familiares.length) return null;

  return (
    <section className="gn-tiles">
      {familiares.map((n) => (
        <button
          key={n.id}
          className={`gn-tile ${selectedIndex === n.genogramaIndex ? 'is-active' : ''}`}
          style={{ background: COLOR_SEXO[n.sexo] }}
          onClick={() => onSelect(n.genogramaIndex)}
        >
          <span className="gn-tile__rel">{n.relacionOriginal}</span>
          <strong className="gn-tile__name">{n.nombre}</strong>
          <span className="gn-tile__meta">
            {n.edad ? `${n.edad} años` : 'Edad no registrada'}
            {n.viveConElMiembro && ' · Vive con el miembro'}
          </span>
        </button>
      ))}
    </section>
  );
}