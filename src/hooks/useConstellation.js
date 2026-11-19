import { useState, useEffect, useMemo, useRef } from 'react';
import { memberService } from '../services/memberService';
import {
  getHidden, saveHidden, getStatus, saveStatus,
} from '../services/constellationSettings';
import { buildGlobalGraph } from '../genograma/globalBuilder';
import { buildPeople } from '../genograma/people';
import { buildNuclei } from '../genograma/nuclei';
import {
  planSet, planRemove, planRename, planDeletePerson, planEntry, relationsOf, norm,
} from '../genograma/relationUtils';
import { useStablePositions } from './useStablePositions';

const EMPTY = { nodes: [], edges: [] };
const NONE = [];

export function useConstellation({ layout = true } = {}) {
  const [members, setMembers] = useState([]);
  const [hidden, setHidden] = useState([]);
  const [status, setStatusMap] = useState({});
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
    getHidden().then(setHidden).catch(() => {});
    getStatus().then(setStatusMap).catch(() => {});
  }, []);

  const graph = useMemo(() => buildGlobalGraph(members), [members]);
  const people = useMemo(() => (layout ? buildPeople(members, graph.nodes) : NONE), [layout, members, graph.nodes]);
  const nuclei = useMemo(() => (layout ? buildNuclei(people) : NONE), [layout, people]);
  const positions = useStablePositions(layout ? graph : EMPTY, nuclei);

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

  // Renombrar/fusionar: también traslada el estado y el "oculto" al nombre nuevo
  const renamePerson = async (from, to) => {
    await commit(planRename(from, to, latest.current));
    const a = norm(from), b = norm(to);
    if (a === b) return;
    if (status[a] && !status[b]) {
      const next = { ...status, [b]: status[a] };
      delete next[a];
      setStatusMap(next);
      saveStatus(next).catch(() => {});
    }
    if (hidden.includes(a)) {
      const next = [...new Set([...hidden.filter((k) => k !== a), b])];
      setHidden(next);
      saveHidden(next).catch(() => {});
    }
  };

  // Externo → miembro: crea el documento, copia sus vínculos y unifica el nombre
  const convertToMember = async (person, data) => {
    const nombre = data.nombre.trim();
    const apellido = (data.apellido || '').trim();
    const full = `${nombre} ${apellido}`.trim();
    const current = latest.current;

    if (norm(full) !== norm(person.nombre) &&
        current.some((m) => norm(`${m.nombre || ''} ${m.apellido || ''}`) === norm(full))) {
      throw new Error('Ya existe un miembro con ese nombre. Usa "Corregir familiar externo" para fusionarlo.');
    }

    const genograma = relationsOf({ ...person, realId: null }, current)
      .filter((r) => !r.inferida)
      .map((r) => ({ nombre: r.nombre, relacion: r.relacion, edad: '', viveConElMiembro: false }));

    const payload = {
      nombre, apellido, sexo: data.sexo || '', clase: data.clase || '', celular: data.celular || '',
      fechaNacimiento: data.fechaNacimiento || '', correo: '', zona: '',
      areasInteres: [], donesEspirituales: [], genograma,
    };
    const id = await memberService.addMember(payload);
    setMembers((ms) => [...ms, { id, ...payload }]);

    if (norm(full) !== norm(person.nombre)) await renamePerson(person.nombre, full);
    return full;
  };

  return {
    members, graph, people, nuclei, positions, hidden, status, loading, error,
    setRelation: (a, b, rel) => commit(planSet(a, b, rel, latest.current)),
    removeRelation: (a, b) => commit(planRemove(a, b, latest.current)),
    updateEntry: (ownerId, name, patch) => commit(planEntry(ownerId, name, patch, latest.current)),
    deletePerson: (name) => commit(planDeletePerson(name, latest.current)),
    renamePerson, convertToMember, toggleHidden, setStatus,
  };
}