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

  // Externo → miembro registrado (conserva el nombre para no romper vínculos)
  const convert = async (index, data) => {
    const fam = familiares[index];
    const nombre = data.nombre.trim();
    const apellido = (data.apellido || '').trim();
    const full = `${nombre} ${apellido}`.trim();

    if (norm(full) !== norm(fam.nombre))
      throw new Error('Para mantener los vínculos, el nombre completo debe quedar igual.');
    const all = await memberService.getMembers();
    if (all.some((m) => norm(fullName(m)) === norm(full)))
      throw new Error('Ya existe un miembro con ese nombre. Fusiónalo desde la Constelación.');

    const inverse = getInverseRelacion(toOpcion(fam.relacion), member.sexo);
    await memberService.addMember({
      nombre, apellido, sexo: data.sexo || fam.sexo || '', clase: data.clase,
      celular: data.celular, fechaNacimiento: data.fechaNacimiento,
      correo: '', zona: '', areasInteres: [], donesEspirituales: [],
      genograma: [{ nombre: fullName(member), relacion: inverse, edad: '', viveConElMiembro: !!fam.viveConElMiembro }],
    });
    await persist(familiares.map((f, k) => (k === index ? { ...f, sexo: data.sexo || f.sexo || '' } : f)));
  };

  return { member, graph, familiares, loading, saving, error, add, update, remove, convert };
}