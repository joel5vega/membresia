const title = (s) => s.split(' ').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const paterno = (p) => p?.surnames?.[0] || '';
const pair = (p) => title((p.surnames || []).slice(0, 2).join(' '));

// Mayor jerarquía primero: generación → edad → miembro registrado → varón
const rank = (a, b) =>
  (b.nivel ?? 0) - (a.nivel ?? 0) ||
  (b.edad ?? -1) - (a.edad ?? -1) ||
  Number(b.esMiembroIglesia) - Number(a.esMiembroIglesia) ||
  Number(b.sexo === 'M') - Number(a.sexo === 'M');

/**
 * Nombre = paterno del varón + paterno de la mujer de la pareja que encabeza la familia.
 * Sin pareja conocida: los dos apellidos propios del referente.
 */
export function familyName(items) {
  // Los niveles solo se comparan dentro de un mismo grupo de parentesco
  const count = new Map();
  items.forEach((p) => count.set(p.comp ?? -1, (count.get(p.comp ?? -1) || 0) + 1));
  const bestComp = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const pool = items.filter((p) => (p.comp ?? -1) === bestComp);

  const sorted = [...pool].sort(rank);
  const ref = sorted.find((p) => p.surnames?.length) || sorted[0] || items[0];
  if (!ref || !ref.surnames?.length) return { top: 'Sin apellido', others: [], ref: ref?.nombre || '' };

  const partner = ref.pareja ? items.find((p) => p.id === ref.pareja) : null;
  let top;
  if (partner?.surnames?.length) {
    const refIsFemale = ref.sexo === 'F' || partner.sexo === 'M';
    const [dad, mom] = refIsFemale ? [partner, ref] : [ref, partner];
    top = title(`${paterno(dad)} ${paterno(mom)}`);
  } else {
    top = pair(ref);
  }

  // Otras líneas del mismo nivel que el referente (para mostrar en la tarjeta)
  const others = [];
  sorted.forEach((p) => {
    if (others.length >= 2 || !p.surnames?.length || p.nivel !== ref.nivel) return;
    const n = pair(p);
    if (n !== top && !others.includes(n)) others.push(n);
  });
  return { top, others, ref: ref.nombre };
}

/** Familias = componentes conexos del grafo (incluye relaciones inferidas). */
export function buildClusters(people, edges) {
  const byId = new Map(people.map((p) => [p.id, p]));
  const parent = new Map(people.map((p) => [p.id, p.id]));
  const find = (x) => {
    while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); }
    return x;
  };
  edges.forEach((e) => {
    if (e.tipo !== 'amistad' && byId.has(e.source) && byId.has(e.target)) parent.set(find(e.source), find(e.target));
  });

  const groups = new Map();
  people.forEach((p) => { const r = find(p.id); groups.set(r, [...(groups.get(r) || []), p]); });

  const list = [...groups.values()].filter((g) => g.length > 1).map((miembros) => {
    const { top, others, ref } = familyName(miembros);
    return {
      apellido: top,
      nombre: `Familia ${top}`,
      referente: ref,
      otros: others,
      miembros,
      registrados: miembros.filter((p) => p.esMiembroIglesia).length,
    };
  });

  // Nombres repetidos → se distinguen por el referente
  const seen = new Map();
  list.forEach((c) => seen.set(c.nombre, (seen.get(c.nombre) || 0) + 1));
  list.forEach((c) => {
    if (seen.get(c.nombre) > 1 && c.referente) c.nombre += ` (${c.referente.split(' ')[0]})`;
  });
  return list;
}