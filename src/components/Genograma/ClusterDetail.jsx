import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { byName, groupByBand } from '../../genograma/ageBands';
import PersonRow from './PersonRow';

export default function ClusterDetail({ cluster, onBack, onOpen }) {
  const [mode, setMode] = useState('band');
  const sorted = useMemo(() => [...cluster.miembros].sort(byName), [cluster]);

  return (
    <>
      <header className="mt-pagehead">
        <button className="mt-btn mt-btn--icon" onClick={onBack} aria-label="Volver"><ArrowLeft size={26} /></button>
        <div>
          <h2 className="mt-title" style={{ fontSize: 'clamp(1.6rem, 7vw, 2.6rem)' }}>{cluster.nombre}</h2>
          <p className="mt-label">{cluster.miembros.length} personas · {cluster.registrados} registradas</p>
        </div>
      </header>

      <div className="mt-seg">
        <button className={mode === 'band' ? 'is-on' : ''} onClick={() => setMode('band')}>Por edad</button>
        <button className={mode === 'az' ? 'is-on' : ''} onClick={() => setMode('az')}>A–Z</button>
      </div>

      {mode === 'az'
        ? sorted.map((p) => <PersonRow key={p.id} p={p} onClick={() => onOpen(p.id)} />)
        : groupByBand(sorted).map(({ band, items }) => (
            <section key={band.id}>
              <div className="mt-group" style={{ borderLeft: `4px solid ${band.color}`, paddingLeft: 8 }}>
                <span>{band.label}</span><span>{items.length}</span>
              </div>
              {items.map((p) => <PersonRow key={p.id} p={p} onClick={() => onOpen(p.id)} />)}
            </section>
          ))}
    </>
  );
}