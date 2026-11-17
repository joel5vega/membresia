import { useState, useEffect, useMemo, useRef } from 'react';
import { memberService } from '../services/memberService';
import { getHidden, saveHidden } from '../services/constellationSettings';
import { buildGlobalGraph } from '../genograma/globalBuilder';
import { planSet, planRemove, planRename, planDeletePerson } from '../genograma/relationUtils';
import { useStablePositions } from './useStablePositions';

export function useConstellation() {
  const [members, setMembers] = useState([]);
  const [hidden, setHidden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latest = useRef(members);
  latest.current = members;

  useEffect(() => {
    memberService.getMembers()
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    getHidden().then(setHidden).catch(() => {});
  }, []);

  const graph = useMemo(() => buildGlobalGraph(members), [members]);
  const positions = useStablePositions(graph);

  // Guarda en Firestore y parchea el estado local (sin recargar)
  const commit = async (plan) => {
    setError(null);
    try {
      await Promise.all(plan.map((p) => memberService.updateMember(p.id, { genograma: p.genograma })));
      const patch = new Map(plan.map((p) => [p.id, p.genograma]));
      setMembers((ms) => ms.map((m) => (patch.has(m.id) ? { ...m, genograma: patch.get(m.id) } : m)));
    } catch (e) {
      setError('No se pudo guardar: ' + e.message);
      throw e;
    }
  };

  const toggleHidden = async (key, hide) => {
    const next = hide ? [...new Set([...hidden, key])] : hidden.filter((k) => k !== key);
    setHidden(next);
    try { await saveHidden(next); }
    catch (e) { setError('No se pudo guardar la preferencia: ' + e.message); }
  };

  return {
    members, graph, positions, hidden, loading, error,
    setRelation: (a, b, rel) => commit(planSet(a, b, rel, latest.current)),
    removeRelation: (a, b) => commit(planRemove(a, b, latest.current)),
    renamePerson: (from, to) => commit(planRename(from, to, latest.current)),
    deletePerson: (name) => commit(planDeletePerson(name, latest.current)),
    toggleHidden,
  };
}