export const DEFAULT_FILTERS = { externos: true, fallecidos: true, inactivos: true };

/** ¿Debe mostrarse este nodo con los filtros actuales? */
export function isVisible(node, filters, status) {
  const st = status[node.id];
  if (!node.esMiembroIglesia && !filters.externos) return false;
  if (st === 'fallecido' && !filters.fallecidos) return false;
  if (st === 'no-asiste' && !filters.inactivos) return false;
  return true;
}

export function applyFilters(graph, filters, { hiddenSet, showHidden, status }) {
  const nodes = graph.nodes.filter(
    (n) => (showHidden || !hiddenSet.has(n.id)) && isVisible(n, filters, status)
  );
  const ok = new Set(nodes.map((n) => n.id));
  return { nodes, edges: graph.edges.filter((e) => ok.has(e.source) && ok.has(e.target)) };
}

export function countFilters(graph, status) {
  const c = { externos: 0, fallecidos: 0, inactivos: 0 };
  graph.nodes.forEach((n) => {
    if (!n.esMiembroIglesia) c.externos++;
    if (status[n.id] === 'fallecido') c.fallecidos++;
    if (status[n.id] === 'no-asiste') c.inactivos++;
  });
  return c;
}