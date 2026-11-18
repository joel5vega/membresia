import React, { useMemo, useState } from 'react';
import { norm } from '../../genograma/names';
import { BANDS, bandOf, countByBand } from '../../genograma/ageBands';
import BandChips from './BandChips';

const TILES = ['t-red', 't-blue', 't-purple', 't-green', 't-teal', 't-orange'];
const SORTS = [['az', 'A–Z'], ['big', 'Más grandes'], ['small', 'Más chicas']];

export default function ClusterList({ clusters, onOpen }) {
  const [sort, setSort] = useState('az');
  const [band, setBand] = useState('all');
  const [q, setQ] = useState('');

  const counts = useMemo(() => countByBand(clusters.flatMap((c) => c.miembros)), [clusters]);

  const list = useMemo(() => {
    const out = clusters.filter((c) =>
      (band === 'all' || c.miembros.some((p) => bandOf(p.edad).id === band)) &&
      (!q || norm(c.nombre).includes(norm(q))));
    const cmp = {
      az: (a, b) => a.apellido.localeCompare(b.apellido, 'es'),
      big: (a, b) => b.miembros.length - a.miembros.length,
      small: (a, b) => a.miembros.length - b.miembros.length,
    }[sort];
    return out.sort(cmp);
  }, [clusters, sort, band, q]);

  return (
    <>
      <input className="mt-input" style={{ marginBottom: 8 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar familia…" />
      <div className="mt-seg">
        {SORTS.map(([id, label]) => (
          <button key={id} className={sort === id ? 'is-on' : ''} onClick={() => setSort(id)}>{label}</button>
        ))}
      </div>
      <BandChips value={band} onChange={setBand} counts={counts} total={clusters.flatMap((c) => c.miembros).length} />

      <div className="mt-tiles">
        {list.map((c, i) => {
          const dist = countByBand(c.miembros);
          return (
            <button key={c.miembros[0].id} className={`mt-tile ${TILES[i % TILES.length]}`} onClick={() => onOpen(c)}>
              <span className="mt-tile__num">{c.miembros.length}</span>
              <span className="mt-tile__name">{c.nombre}</span>
              <span className="mt-tile__meta">{c.registrados} registrados</span>
              <span className="mt-agebar">
                {BANDS.map((b) => dist[b.id] && (
                  <i key={b.id} style={{ width: `${(dist[b.id] / c.miembros.length) * 100}%`, background: b.color }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      {!list.length && <p className="mt-muted">Sin resultados.</p>}
    </>
  );
}