const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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
    const counts = {};
    miembros.forEach((p) => p.surnames.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'sin apellido';
    return {
      apellido: cap(top),
      nombre: `Familia ${cap(top)}`,
      miembros,
      registrados: miembros.filter((p) => p.esMiembroIglesia).length,
    };
  });
}