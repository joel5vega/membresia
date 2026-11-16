import { useState, useEffect, useMemo, useRef } from 'react';
import { memberService } from '../services/memberService';
import { buildGlobalGraph } from '../genograma/globalBuilder';
import { planSet, planRemove } from '../genograma/relationUtils';
import { useStablePositions } from './useStablePositions';

export function useConstellation() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latest = useRef(members);
  latest.current = members;

  // Única lectura a Firestore
  useEffect(() => {
    memberService.getMembers()
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const graph = useMemo(() => buildGlobalGraph(members), [members]);
  const positions = useStablePositions(graph);

  // Guarda en Firestore y parchea el estado local (sin recargar)
  const commit = async (plan) => {
    setError(null);
    try {
      await Promise.all(plan.map((p) => memberService.updateMember(p.id, { genograma: p.genograma })));
      setMembers((ms) =>
        ms.map((m) => plan.find((p) => p.id === m.id) ? { ...m, genograma: plan.find((p) => p.id === m.id).genograma } : m)
      );
    } catch (e) {
      setError('No se pudo guardar: ' + e.message);
      throw e;
    }
  };

  return {
    members, graph, positions, loading, error,
    setRelation: (a, b, rel) => commit(planSet(a, b, rel, latest.current)),
    removeRelation: (a, b) => commit(planRemove(a, b, latest.current)),
  };
}