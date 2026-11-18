import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { useConstellation } from '../../hooks/useConstellation';
import { buildPeople, toPerson } from '../../genograma/people';
import { buildClusters } from '../../genograma/clusters';
import { makeSuggester } from '../../genograma/suggestions';
import { norm } from '../../genograma/names';
import OrphanQueue from './OrphanQueue';
import ClusterList from './ClusterList';
import ClusterDetail from './ClusterDetail';
import PersonPanel from './PersonPanel';
import FilterBar from './FilterBar';
import { DEFAULT_FILTERS, isVisible, countFilters } from '../../genograma/graphFilters';

export default function FamiliasView() {
  const navigate = useNavigate();
  const {
    members, graph, hidden, status, setStatus, loading, error,
    setRelation, removeRelation, renamePerson, deletePerson, toggleHidden,
  } = useConstellation({ layout: false });

  const [tab, setTab] = useState('orphans');
const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [clusterKey, setClusterKey] = useState(null);   // cualquier persona del clan abierto
  const [personKey, setPersonKey] = useState(null);

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);
  const people = useMemo(
() => buildPeople(members, graph.nodes).map((p) => ({ ...p, estado: status[p.id] })),
[members, graph.nodes, status]);
const counts = useMemo(() => countFilters(graph, status), [graph, status]);
  const visible = useMemo(
() => people.filter((p) => !hiddenSet.has(p.id) && isVisible(p, filters, status)),
[people, hiddenSet, filters, status]);
  const clusters = useMemo(() => buildClusters(visible, graph.edges), [visible, graph.edges]);
  const orphans = useMemo(() => visible.filter((p) => p.esMiembroIglesia && p.grado === 0), [visible]);
  const suggest = useMemo(() => makeSuggester(people), [people]);

  const cluster = clusterKey && clusters.find((c) => c.miembros.some((p) => p.id === clusterKey));
  const selected = people.find((p) => p.id === personKey);
  const person = selected && toPerson(selected);

  if (loading) return <div className="mt-page"><p className="mt-label">Cargando familias…</p></div>;

  return (
    <div className="mt-page" style={{ paddingBottom: person ? '60dvh' : undefined }}>
      {error && <p className="mt-error">{error}</p>}

      {cluster ? (
        <ClusterDetail cluster={cluster} onBack={() => setClusterKey(null)} onOpen={setPersonKey} />
      ) : (
        <>
          <header className="mt-pagehead">
            <div>
              <h1 className="mt-title">Familias</h1>
              <p className="mt-label">{visible.length} personas · {clusters.length} familias</p>
            </div>
            <button className="mt-btn" onClick={() => navigate('/constelacion')}><Network size={16} /> Mapa</button>
          </header>

          <div className="mt-seg">
            <button className={tab === 'orphans' ? 'is-on' : ''} onClick={() => setTab('orphans')}>
              Sin relaciones ({orphans.length})
            </button>
            <button className={tab === 'clusters' ? 'is-on' : ''} onClick={() => setTab('clusters')}>
              Familias ({clusters.length})
            </button>
          </div>

          <FilterBar filters={filters} onChange={setFilters} counts={counts} />
{tab === 'orphans'
            ? <OrphanQueue orphans={orphans} suggest={suggest} onOpen={setPersonKey} onLink={setRelation} />
            : <ClusterList clusters={clusters} onOpen={(c) => setClusterKey(c.miembros[0].id)} />}

        </>
      )}

      {person && (
        <PersonPanel
          key={person.key}
          person={person}
          members={members}
          people={people}
          isHidden={hiddenSet.has(person.key)}
status={status[person.key]}
onSetStatus={(v) => setStatus(person.key, v)}
          onSetRelation={setRelation}
          onRemoveRelation={removeRelation}
          onRename={async (from, to) => { await renamePerson(from, to); setPersonKey(norm(to)); }}
          onDelete={async (name) => { await deletePerson(name); setPersonKey(null); }}
          onToggleHide={(key, hide) => { toggleHidden(key, hide); if (hide) setPersonKey(null); }}
          onClose={() => setPersonKey(null)}
        />
      )}
    </div>
  );
}