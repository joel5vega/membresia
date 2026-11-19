import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { splitName } from '../../genograma/people';

const CLASES = [
  'Sociedad de Caballeros "Emanuel"', 'Sociedad de Señoras "Shaddai"',
  'Sociedad de Matrimonios jóvenes "Ebenezer"', 'Sociedad de Jóvenes "Soldados de la Fe"',
  'Sociedad de prejuveniles "Vencedores"', 'Clase de Exploradores', 'Clase de Estrellitas',
  'Clase de joyitas', 'Av. Jireh', 'Av. Luz del evangelio', 'Av. Elohim', 'Av. Jesús es el camino',
];

export default function ConvertToMember({ person, onConvert }) {
  const [form, setForm] = useState(() => ({
    ...splitName(person.nombre),
    sexo: person.sexo === 'M' || person.sexo === 'F' ? person.sexo : '',
    clase: '', celular: '', fechaNacimiento: '',
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    setBusy(true); setError('');
    try { await onConvert(form); }
    catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <details className="mt-details">
      <summary><UserPlus size={16} /> Registrar como miembro</summary>

      <label className="mt-label">Nombres</label>
      <input className="mt-input" value={form.nombre} onChange={set('nombre')} />
      <label className="mt-label">Apellidos (paterno y materno)</label>
      <input className="mt-input" value={form.apellido} onChange={set('apellido')} />

      <div className="mt-row" style={{ borderBottom: 0 }}>
        <select className="mt-input" value={form.sexo} onChange={set('sexo')}>
          <option value="">Sexo…</option><option value="M">Varón</option><option value="F">Mujer</option>
        </select>
        <input className="mt-input" type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} />
      </div>
      <select className="mt-input" value={form.clase} onChange={set('clase')}>
        <option value="">Clase / sociedad…</option>
        {CLASES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input className="mt-input" style={{ marginTop: 8 }} placeholder="Celular"
             value={form.celular} onChange={set('celular')} />

      <button className="mt-btn mt-btn--green" style={{ marginTop: 12, width: '100%' }}
              disabled={busy} onClick={submit}>
        {busy ? 'Registrando…' : 'Crear miembro'}
      </button>
      {error && <p className="mt-error">{error}</p>}
    </details>
  );
}