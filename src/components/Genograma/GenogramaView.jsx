import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useConstellation } from '../../hooks/useConstellation';
import { memberToGenograma } from '../../genograma/adapter';
import { buildStats } from '../../genograma/stats';
import { buildPeople, toPerson } from '../../genograma/people';
import { norm, fullName } from '../../genograma/names';
import GenogramaCanvas from './GenogramaCanvas';
import GenogramaLegend from './GenogramaLegend';
import FamiliaresList from './FamiliaresList';
import PersonSheet from './PersonSheet';
import './genograma.css';

export default function GenogramaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctl = useConstellation({ layout: false });
  const { members, graph, loading, error } = ctl;
  const [selectedKey, setSelectedKey] = useState(null);

  const member = useMemo(() => members.find((m) => m.id === id), [members, id]);
  const genograma = useMemo(() => memberToGenograma(member), [member]);
  const people = useMemo(() => buildPeople(members, graph.nodes), [members, graph.nodes]);

  if (loading) return <div className="gn"><p>Cargando genograma…</p></div>;
  if (!member) return <div className="gn"><p>Miembro no encontrado</p></div>;

  const rootKey = norm(fullName(member));
  const stats = buildStats(genograma.nodes);
  const person = toPerson(people.find((p) => p.id === selectedKey));
  const context = { ownerId: member.id, ownerName: fullName(member), key: rootKey };

  return (
    <div className="gn" style={{ paddingBottom: person ? '60dvh' : undefined }}>
      <header className="gn-header">
        <button className="gn-icon" onClick={() => navigate(-1)} aria-label="Volver"><ArrowLeft size={26} /></button>
        <div style={{ flex: 1 }}>
          <h1 className="gn-title">Genograma</h1>
          <p className="gn-sub">
            {genograma.memberName} · {stats.totalFamiliares} familiares · {stats.generacionesCubiertas} generaciones
          </p>
        </div>
        <button className="gn-btn" onClick={() => setSelectedKey(rootKey)}>
          <Plus size={16} /> Agregar
        </button>
      </header>

      {error && <p className="gn-error">{error}</p>}

      {genograma.nodes.length <= 1 ? (
        <div className="gn-empty">Aún no hay familiares. Usa “Agregar” para empezar.</div>
      ) : (
        <>
          <GenogramaCanvas
            nodes={genograma.nodes}
            edges={genograma.edges}
            selectedKey={selectedKey}
            onNodeClick={(n) => setSelectedKey(norm(n.nombre))}
          />
          <GenogramaLegend />
          <FamiliaresList nodes={genograma.nodes} selectedKey={selectedKey} onSelect={setSelectedKey} />
        </>
      )}

      {person && (
        <PersonSheet
          key={person.key}
          person={person}
          people={people}
          ctl={ctl}
          context={context}
          onClose={() => setSelectedKey(null)}
          onKeyChange={setSelectedKey}
        />
      )}
    </div>
  );
}