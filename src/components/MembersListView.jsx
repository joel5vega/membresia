import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { useMembersList } from '../hooks/useMembersList';
import { norm } from '../genograma/names';
import MemberRow from './MemberRow';
import { hasYear } from '../genograma/birthdate';

const CLASES = [
  'Sociedad de Caballeros "Emanuel"', 'Sociedad de Señoras "Shaddai"',
  'Sociedad de Matrimonios jóvenes "Ebenezer"', 'Sociedad de Jóvenes "Soldados de la Fe"',
  'Sociedad de prejuveniles "Vencedores"', 'Clase de Exploradores', 'Clase de Estrellitas',
  'Clase de joyitas', 'Av. Jireh', 'Av. Luz del evangelio', 'Av. Elohim', 'Av. Jesús es el camino',
  'Inactive',
];

const nameOf = (m) => m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();

export default function MembersListView({ onAddMember }) {
  const navigate = useNavigate();
  const { members, loading, error, update, remove } = useMembersList();
  const [q, setQ] = useState('');
  const [clase, setClase] = useState('all');
  const [missing, setMissing] = useState('all');   // all | celular | nacimiento

  const list = useMemo(() => {
    const s = norm(q);
    const digits = q.replace(/\D/g, '');
    return members
      .filter((m) => {
        if (clase !== 'all' && m.clase !== clase) return false;
        if (missing === 'celular' && m.celular) return false;
        if (missing === 'nacimiento' && m.fechaNacimiento) return false;
if (missing === 'anio' && (!m.fechaNacimiento || hasYear(m.fechaNacimiento))) return false;
        if (!s) return true;
        return norm(nameOf(m)).includes(s) || (digits.length >= 3 && String(m.celular || '').includes(digits));
      })
      .sort((a, b) => nameOf(a).localeCompare(nameOf(b), 'es', { sensitivity: 'base' }));
  }, [members, q, clase, missing]);

  if (loading) return <div className="mt-page"><p className="mt-label">Cargando miembros…</p></div>;

  return (
    <div className="mt-page ml-page">
      <header className="mt-pagehead">
        <div>
          <h1 className="mt-title">Miembros</h1>
          <p className="mt-label">{list.length} de {members.length}</p>
        </div>
      </header>

      {error && <p className="mt-error">{error}</p>}

      <div className="mt-search__box" style={{ marginBottom: 8 }}>
        <Search size={16} color="#a6a6a6" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o celular…" />
        {q && (
          <button className="mt-btn mt-btn--icon" style={{ minWidth: 32, minHeight: 32 }}
                  onClick={() => setQ('')} aria-label="Limpiar"><X size={16} /></button>
        )}
      </div>

      <div className="ml-filters">
        <select className="mt-input" value={clase} onChange={(e) => setClase(e.target.value)}>
          <option value="all">Todas las clases</option>
          {CLASES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="mt-input" value={missing} onChange={(e) => setMissing(e.target.value)}>
          <option value="all">Todos los datos</option>
          <option value="celular">Sin celular</option>
          <option value="nacimiento">Sin fecha de nacimiento</option>
<option value="anio">Cumpleaños sin año</option>
        </select>
      </div>

      <div className="ml-list">
        {list.map((m) => (
          <MemberRow
            key={m.id}
            member={m}
            onSave={update}
            onDelete={remove}
            onGenograma={(id) => navigate(`/members/${id}/genograma`)}
            onFullEdit={(id) => navigate(`/members/${id}/edit`)}
          />
        ))}
        {!list.length && <p className="mt-muted" style={{ padding: 16 }}>No se encontraron miembros.</p>}
      </div>

      <button className="ml-fab" onClick={onAddMember} aria-label="Agregar miembro"><Plus size={26} /></button>
    </div>
  );
}