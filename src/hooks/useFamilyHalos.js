import { useMemo } from 'react';

const lastWord = (s) => s.split(' ').filter(Boolean).slice(-1)[0] || '';

function labelOf(names) {
  const counts = {};
  names.forEach((n) => { const a = lastWord(n); if (a) counts[a] = (counts[a] || 0) + 1; });
  const common = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'Familia';
  const parts = names[0].split(' ').filter(Boolean);
  return parts.length >= 3 ? `${common} ${parts[parts.length - 2][0]}.` : common;
}

export function useFamilyHalos({ nodes, edges }, positions) {
  return useMemo(() => {
    if (!nodes.length || !positions.size) return [];
    const adj = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((e) => {
      if (adj.has(e.source) && adj.has(e.target)) {
        adj.get(e.source).push(e.target);
        adj.get(e.target).push(e.source);
      }
    });
    const nameOf = new Map(nodes.map((n) => [n.id, n.nombre]));

    const seen = new Set();
    const halos = [];
    nodes.forEach((n) => {
      if (seen.has(n.id) || !adj.get(n.id).length) return;
      const comp = [];
      const queue = [n.id];
      seen.add(n.id);
      while (queue.length) {
        const cur = queue.shift();
        comp.push(cur);
        adj.get(cur).forEach((v) => { if (!seen.has(v)) { seen.add(v); queue.push(v); } });
      }
      const pts = comp.map((id) => positions.get(id)).filter(Boolean);
      if (comp.length < 3 || pts.length < 3) return;

      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const radius = Math.max(...pts.map((p) => Math.hypot(p.x - cx, p.y - cy))) + 40;
      halos.push({ cx, cy, radius, etiqueta: labelOf(comp.map((id) => nameOf.get(id))) });
    });
    return halos;
  }, [nodes, edges, positions]);
}