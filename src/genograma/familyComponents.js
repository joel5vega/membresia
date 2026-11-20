/** Familias extensas = componentes conexos por parentesco (las amistades no unen familias). */
export function familyComponents(nodes, edges, minSize = 2) {
  const adj = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    if (e.tipo === 'amistad' || !adj.has(e.source) || !adj.has(e.target)) return;
    adj.get(e.source).push(e.target);
    adj.get(e.target).push(e.source);
  });

  const seen = new Set();
  const comps = [];
  nodes.forEach((n) => {
    if (seen.has(n.id)) return;
    const comp = [];
    const queue = [n.id];
    seen.add(n.id);
    while (queue.length) {
      const cur = queue.shift();
      comp.push(cur);
      adj.get(cur).forEach((v) => { if (!seen.has(v)) { seen.add(v); queue.push(v); } });
    }
    if (comp.length >= minSize) comps.push(comp);
  });
  return comps;
}