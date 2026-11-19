const title = (s) => s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Pareja de apellidos (paterno + materno) más frecuente = familia nuclear. */
export function familyName(items) {
  const tally = new Map();
  items.forEach((p) => {
    const s = (p.surnames || []).slice(0, 2);
    if (!s.length) return;
    const key = s.join(' ');
    const e = tally.get(key) || { key, n: 0, reg: 0 };
    e.n++; if (p.esMiembroIglesia) e.reg++;
    tally.set(key, e);
  });
  const ranked = [...tally.values()].sort((a, b) => b.n - a.n || b.reg - a.reg);
  return { top: ranked[0] ? title(ranked[0].key) : 'Sin apellido', others: ranked.slice(1, 3).map((e) => title(e.key)) };
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
    if (byId.has(e.source) && byId.has(e.target)) parent.set(find(e.source), find(e.target));
  });

  const groups = new Map();
  people.forEach((p) => { const r = find(p.id); groups.set(r, [...(groups.get(r) || []), p]); });

  return [...groups.values()].filter((g) => g.length > 1).map((miembros) => {
    const { top, others } = familyName(miembros);
    return {
      apellido: top,
      nombre: `Familia ${top}`,
      otros: others,
      miembros,
      registrados: miembros.filter((p) => p.esMiembroIglesia).length,
    };
  });
}