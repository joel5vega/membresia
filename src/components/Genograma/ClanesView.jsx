import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, X, User } from 'lucide-react';
import { memberService } from '../../services/memberService';
import { buildClanes } from '../../genograma/globalBuilder';

const TILES = ['t-red', 't-blue', 't-purple', 't-green', 't-teal', 't-orange'];

export default function ClanesView({ embedded = false }) {
  const navigate = useNavigate();
  const [clanes, setClanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    memberService.getMembers()
      .then((data) => setClanes(buildClanes(data).clanes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mt-page"><p className="mt-label">Analizando lazos familiares…</p></div>;

  return (
    <div className="mt-page">
      <header className="mt-pagehead">
        {!embedded && (
          <button className="mt-btn mt-btn--icon" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={26} />
          </button>
        )}
        <div>
          <h1 className="mt-title">Red de familias</h1>
          <p className="mt-label">{clanes.length} clanes detectados</p>
        </div>
        <button className="mt-btn" onClick={() => navigate('/constelacion')}>
          <Network size={16} /> Constelación
        </button>
      </header>

      <div className="mt-tiles">
        {clanes.map((c, i) => (
          <button key={c.id} className={`mt-tile ${TILES[i % TILES.length]}`} onClick={() => setSelected(c)}>
            <span className="mt-tile__num">{c.miembros.length}</span>
            <span className="mt-tile__name">{c.nombre}</span>
            <span className="mt-tile__meta">{c.totalMiembrosIglesia} en la iglesia</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-sheet" role="dialog" aria-label={selected.nombre}>
          <div className="mt-sheet__grip" />
          <header className="mt-sheet__head">
            <h3 className="mt-sheet__title" style={{ flex: 1 }}>{selected.nombre}</h3>
            <button className="mt-btn mt-btn--icon" onClick={() => setSelected(null)} aria-label="Cerrar"><X size={22} /></button>
          </header>

          {selected.miembros.map((m) => (
            <div key={m.id} className="mt-row" style={{ flexWrap: 'nowrap' }}>
              <div style={{ width: 44, height: 44, flexShrink: 0, overflow: 'hidden', display: 'grid', placeItems: 'center',
                background: m.sexo === 'F' ? '#6a00ff' : m.sexo === 'M' ? '#2d89ef' : '#555' }}>
                {m.photoUrl
                  ? <img src={m.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={20} color="#fff" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</div>
                <small className="mt-muted">{m.esMiembroIglesia ? 'Miembro registrado' : 'Familiar externo'}</small>
              </div>
              {m.esMiembroIglesia && (
                <button className="mt-btn" onClick={() => navigate(`/members/${m.realId || m.id}/genograma`)}>Ver árbol</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}