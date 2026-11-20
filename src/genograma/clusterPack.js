const PAD = 40;      // igual que el radio extra del halo en useFamilyHalos
const MARGIN = 30;   // aire mínimo entre familias

/** Muta `pos`: separa las familias extensas para que sus halos no se solapen. */
export function packClusters(pos, comps, iterations = 150) {
  const cl = comps.map((all) => {
    const ids = all.filter((id) => pos.has(id));
    if (ids.length < 2) return null;
    const cx = ids.reduce((s, id) => s + pos.get(id).x, 0) / ids.length;
    const cy = ids.reduce((s, id) => s + pos.get(id).y, 0) / ids.length;
    const r = Math.max(...ids.map((id) => Math.hypot(pos.get(id).x - cx, pos.get(id).y - cy))) + PAD;
    return { ids, ox: cx, oy: cy, cx, cy, r };
  }).filter(Boolean);

  for (let it = 0; it < iterations; it++) {
    let moved = false;
    for (let i = 0; i < cl.length; i++) {
      for (let j = i + 1; j < cl.length; j++) {
        const a = cl[i], b = cl[j];
        let dx = b.cx - a.cx, dy = b.cy - a.cy;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r + MARGIN;
        if (d >= min) continue;
        if (d < 0.01) { dx = Math.cos(i + j); dy = Math.sin(i + j); d = 1; }
        const gap = min - d, ux = dx / d, uy = dy / d;
        const wa = b.r / (a.r + b.r);   // la familia chica se mueve más
        const wb = a.r / (a.r + b.r);
        a.cx -= ux * gap * wa; a.cy -= uy * gap * wa;
        b.cx += ux * gap * wb; b.cy += uy * gap * wb;
        moved = true;
      }
    }
    if (!moved) break;
  }

  const inCluster = new Set();
  cl.forEach((c) => {
    const sx = c.cx - c.ox, sy = c.cy - c.oy;
    c.ids.forEach((id) => {
      const q = pos.get(id);
      pos.set(id, { ...q, x: q.x + sx, y: q.y + sy });
      inCluster.add(id);
    });
  });

  // Nodos sueltos que quedaron dentro de un halo → se sacan radialmente
  pos.forEach((q, id) => {
    if (inCluster.has(id)) return;
    cl.forEach((c) => {
      const dx = q.x - c.cx, dy = q.y - c.cy;
      const d = Math.hypot(dx, dy) || 1;
      const min = c.r + 16;
      if (d < min) pos.set(id, { ...q, x: c.cx + (dx / d) * min, y: c.cy + (dy / d) * min });
    });
  });
}