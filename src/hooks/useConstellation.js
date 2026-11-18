import { useState, useEffect, useMemo, useRef } from 'react';
import { memberService } from '../services/memberService';
import { getHidden, saveHidden, getStatus, saveStatus } from '../services/constellationSettings';
import { buildGlobalGraph } from '../genograma/globalBuilder';
import { planSet, planRemove, planRename, planDeletePerson } from '../genograma/relationUtils';
import { useStablePositions } from './useStablePositions';

const EMPTY = { nodes: [], edges: [] };
export function useConstellation({ layout = true } = {}) {
  const [members, setMembers] = useState([]);
  const [hidden, setHidden] = useState([]);
const [status, setStatusMap] = useState({});
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
getStatus().then(setStatusMap).catch(() => {});
  }, []);

  const graph = useMemo(() => buildGlobalGraph(members), [members]);
  const positions = useStablePositions(layout ? graph : EMPTY);

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
  const setStatus = async (key, value) => {
  const next = { ...status };
    if (value === 'activo') delete next[key]; else next[key] = value;
    setStatusMap(next);
    try { await saveStatus(next); }
    catch (e) { setError('No se pudo guardar el estado: ' + e.message); }
  };
  return {
    members, graph, positions, hidden, status, setStatus, loading, error,
    setRelation: (a, b, rel) => commit(planSet(a, b, rel, latest.current)),
    removeRelation: (a, b) => commit(planRemove(a, b, latest.current)),
    renamePerson: (from, to) => commit(planRename(from, to, latest.current)),
    deletePerson: (name) => commit(planDeletePerson(name, latest.current)),
    toggleHidden,
  };
}