import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useGenograma } from '../../hooks/useGenograma';
import { buildStats } from '../../genograma/stats';
import { PERSONA_VACIA } from '../../genograma/relaciones';
import GenogramaCanvas from './GenogramaCanvas';
import GenogramaLegend from './GenogramaLegend';
import FamiliaresList from './FamiliaresList';
import PersonaEditor from './PersonaEditor';
import { memberService } from '../../services/memberService';
import { norm, fullName } from '../../genograma/relationUtils';
import './genograma.css';

export default function GenogramaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { member, graph, familiares, loading, saving, error, add, update, remove, convert } = useGenograma(id);
const [members, setMembers] = useState([]);
useEffect(() => { memberService.getMembers().then(setMembers).catch(() => {}); }, []);
  const [editing, setEditing] = useState(null); // { index: number | null }

  if (loading) return <div className="gn"><p>Cargando genograma…</p></div>;
  if (!member) return <div className="gn"><p>Miembro no encontrado</p></div>;

  const stats = buildStats(graph.nodes);
  const isNew = editing?.index == null;

  const handleSave = async (data) => {
    try {
      await (isNew ? add(data) : update(editing.index, data));
      setEditing(null);
    } catch { /* el error ya se muestra */ }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este familiar?')) return;
    try { await remove(editing.index); setEditing(null); } catch { /* idem */ }
  };

  return (
    <div className="gn">
      <header className="gn-header">
        <button className="gn-icon" onClick={() => navigate(-1)} aria-label="Volver"><ArrowLeft size={26} /></button>
        <div style={{ flex: 1 }}>
          <h1 className="gn-title">Genograma</h1>
          <p className="gn-sub">
            {graph.memberName} · {stats.totalFamiliares} familiares · {stats.generacionesCubiertas} generaciones
          </p>
        </div>
        <button className="gn-btn" onClick={() => setEditing({ index: null })}>
          <Plus size={16} /> Agregar
        </button>
      </header>

      {error && <p className="gn-error">{error}</p>}

      {graph.nodes.length <= 1 ? (
        <div className="gn-empty">Aún no hay familiares. Usa “Agregar” para empezar.</div>
      ) : (
        <>
          <GenogramaCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            selectedIndex={editing?.index}
            onNodeClick={(n) => setEditing({ index: n.genogramaIndex })}
          />
          <GenogramaLegend />
          <FamiliaresList
            nodes={graph.nodes}
            selectedIndex={editing?.index}
            onSelect={(index) => setEditing({ index })}
          />
        </>
      )}

      {editing && (
        <PersonaEditor
          key={editing.index ?? 'new'}
          initial={isNew ? PERSONA_VACIA : familiares[editing.index]}
          isNew={isNew}
          saving={saving}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
          isMember={!isNew && members.some((m) => norm(fullName(m)) === norm(familiares[editing.index]?.nombre))}
onConvert={async (data) => { await convert(editing.index, data); setEditing(null); }}
        />
      )}
    </div>
  );
}