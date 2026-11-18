import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { norm } from '../../genograma/names';
import { toPerson } from '../../genograma/people';
import { bandOf, byName, countByBand, groupByBand } from '../../genograma/ageBands';
import BandChips from './BandChips';
import PersonRow from './PersonRow';
import SuggestionRow from './SuggestionRow';

export default function OrphanQueue({ orphans, suggest, onOpen, onLink }) {
  const [band, setBand] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(() => countByBand(orphans), [orphans]);
  const filtered = useMemo(() =>
    orphans
      .filter((p) => (band === 'all' || bandOf(p.edad).id === band) && (!q || norm(p.nombre).includes(norm(q))))
      .sort(byName),
  [orphans, band, q]);

  const top = useMemo(() => new Map(filtered.map((p) => [p.id, suggest(p, { limit: 1 })[0]])), [filtered, suggest]);

  const link = async (p, c, rel) => {
    setBusy(p.id); setError('');
    try { await onLink(toPerson(p), { key: c.id, nombre: c.nombre, realId: c.realId }, rel); }
    catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };

  if (!orphans.length) return <p className="mt-muted">Todos los miembros tienen al menos una relación.</p>;

  return (
    <>
      <div className="mt-search__box" style={{ marginBottom: 8 }}>
        <Search size={16} color="#a6a6a6" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar miembro…" />
      </div>
      <BandChips value={band} onChange={setBand} counts={counts} total={orphans.length} />
      {error && <p className="mt-error">{error}</p>}

      {groupByBand(filtered).map(({ band: b, items }) => (
        <section key={b.id}>
          <div className="mt-group" style={{ borderLeft: `4px solid ${b.color}`, paddingLeft: 8 }}>
            <span>{b.label}</span><span>{items.length}</span>
          </div>
          {items.map((p) => (
            <div key={p.id} className="mt-card">
              <PersonRow p={p} onClick={() => onOpen(p.id)} />
              {top.get(p.id)
                ? <SuggestionRow s={top.get(p.id)} busy={busy === p.id} onLink={(c, rel) => link(p, c, rel)} />
                : <button className="mt-btn mt-btn--ghost" style={{ marginTop: 8 }} onClick={() => onOpen(p.id)}>
                    Sin sugerencias · agregar manualmente
                  </button>}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}