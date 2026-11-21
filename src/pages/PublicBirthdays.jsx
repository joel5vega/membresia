import React, { useEffect, useState } from 'react';
import { fetchPublicBirthdays } from '../services/functionsApi';
import './PublicBirthdays.css';

export default function PublicBirthdays() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Cumpleaños · IEDB Canaán';
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);

    const key = new URLSearchParams(window.location.search).get('k');
    fetchPublicBirthdays(key)
      .then(setData)
      .catch(() => setError('No se pudo cargar. Verifica que el enlace sea correcto.'));
    return () => meta.remove();
  }, []);

  return (
    <div className="pb">
      <header className="pb-head">
        <p>IEDB Canaán</p>
        <h1>Cumpleaños</h1>
      </header>

      {error && <p className="pb-msg">{error}</p>}
      {!data && !error && <p className="pb-msg">Cargando…</p>}

      {data?.months.map((mo) => (
        <section key={mo.month}>
          <h2>{mo.name} <span>{mo.items.length}</span></h2>
          {mo.items.length === 0 && <p className="pb-msg">Sin cumpleaños registrados.</p>}
          <ul>
            {mo.items.map((p, i) => {
              const hoy = mo.month === data.currentMonth && p.dia === data.today;
              return (
                <li key={i} className={hoy ? 'is-today' : ''}>
                  <b>{p.dia}</b>
                  {p.foto && <img src={p.foto} alt="" />}
                  <span>{p.nombre}</span>
                  {hoy && <em>🎂 Hoy</em>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}