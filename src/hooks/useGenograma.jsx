import { useState, useEffect, useMemo, useCallback } from 'react';
import { memberService } from '../services/memberService';
import { memberToGenograma } from '../genograma/adapter';

export function useGenograma(id) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    memberService.getMemberById(id)
      .then(setMember)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const familiares = member?.genograma ?? [];
  const graph = useMemo(() => memberToGenograma(member), [member]);

  const persist = useCallback(async (next) => {
    setSaving(true);
    setError(null);
    try {
      await memberService.updateMember(id, { genograma: next });
      setMember((m) => ({ ...m, genograma: next }));
    } catch (e) {
      setError('No se pudo guardar: ' + e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [id]);

  const clean = (p) => ({ ...p, nombre: p.nombre.trim(), edad: p.edad ?? '' });

  const add = (p) => persist([...familiares, clean(p)]);
  const update = (i, p) => persist(familiares.map((f, k) => (k === i ? { ...f, ...clean(p) } : f)));
  const remove = (i) => persist(familiares.filter((_, k) => k !== i));

  return { member, graph, familiares, loading, saving, error, add, update, remove };
}