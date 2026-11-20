import React, { useState, useEffect } from 'react';
import { MESES, parseBirth, buildBirth } from '../genograma/birthdate';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

/** value/onChange usan "AAAA-MM-DD" (o "0000-MM-DD" sin año). */
export default function BirthInput({ value, onChange, onKeyDown }) {
  const [p, setP] = useState(() => parseBirth(value));

  // Si el valor cambia desde fuera (otra fila, cancelar), se resincroniza
  useEffect(() => {
    if (value !== buildBirth(p)) setP(parseBirth(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const set = (patch) => {
    const next = { ...p, ...patch };
    setP(next);                       // el estado parcial se conserva
    onChange(buildBirth(next));       // '' hasta que haya día y mes
  };

  return (
    <div className="bi">
      <select className="mt-input" value={p.d} onChange={(e) => set({ d: e.target.value })}
              onKeyDown={onKeyDown} aria-label="Día">
        <option value="">Día</option>
        {DAYS.map((d) => <option key={d} value={d}>{Number(d)}</option>)}
      </select>
      <select className="mt-input" value={p.m} onChange={(e) => set({ m: e.target.value })}
              onKeyDown={onKeyDown} aria-label="Mes">
        <option value="">Mes</option>
        {MESES.map((n, i) => <option key={n} value={String(i + 1).padStart(2, '0')}>{n}</option>)}
      </select>
      <input className="mt-input" type="number" inputMode="numeric" placeholder="Año (opcional)"
             min="1900" max={new Date().getFullYear()} value={p.y}
             onChange={(e) => set({ y: e.target.value })} onKeyDown={onKeyDown} aria-label="Año" />
    </div>
  );
}