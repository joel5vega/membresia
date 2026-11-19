const GAP = 36;      // separación entre nodos dentro de un núcleo
const ROW = 5;       // máximo de hijos por fila
const PAD = 28;      // holgura del círculo del núcleo
const MARGIN = 24;   // distancia mínima entre núcleos

const title = (s) => s.split(' ').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/** Núcleo = pareja (o un solo progenitor) + hijos. Cada persona pertenece a un solo núcleo. */
export function buildNuclei(people) {
  const byId = new Map(people.map((p) => [p.id, p]));
  const uf = new Map();
  const find = (x) => {
    if (!uf.has(x)) uf.set(x, x);
    while (uf.get(x) !== x) { uf.set(x, uf.get(uf.get(x))); x = uf.get(x); }
    return x;
  };
  const union = (a, b) => uf.set(find(a), find(b));

  const isParent = new Set();
  people.forEach((p) => {
    const ps = (p.padres || []).filter((x) => byId.has(x));
    ps.forEach((x) => { isParent.add(x); union(x, ps[0]); });
    if (p.pareja && byId.has(p.pareja)) {
      isParent.add(p.id); isParent.add(p.pareja); union(p.id, p.pareja);
    }
  });

  const groups = new Map();
  const slot = (root) => {
    if (!groups.has(root)) groups.set(root, { parents: [], children: [] });
    return groups.get(root);
  };
  isParent.forEach((id) => slot(find(id)).parents.push(byId.get(id)));
  people.forEach((p) => {
    if (isParent.has(p.id)) return;                  // ya tiene su propio núcleo como progenitor
    const ps = (p.padres || []).filter((x) => byId.has(x));
    if (ps.length) slot(find(ps[0])).children.push(p);
  });

  return [...groups.values()]
    .map(({ parents, children }) => {
      parents.sort((a, b) => Number(b.sexo === 'M') - Number(a.sexo === 'M'));
      children.sort((a, b) => (b.edad ?? -1) - (a.edad ?? -1));
      const dad = parents.find((p) => p.sexo === 'M');
      const mom = parents.find((p) => p.sexo === 'F');
      const sur = (p) => p?.surnames?.[0] || '';
      const name = dad && mom
        ? `${sur(dad)} ${sur(mom)}`
        : parents.length > 1 && !dad && !mom
          ? `${sur(parents[0])} ${sur(parents[1])}`
          : (parents[0]?.surnames || []).slice(0, 2).join(' ');
      return {
        id: parents[0].id,
        name: title(name.trim()) || 'Núcleo',
        parents: parents.map((p) => p.id),
        children: children.map((p) => p.id),
        members: [...parents, ...children].map((p) => p.id),
      };
    })
    .filter((n) => n.members.length >= 2);
}

/** Posición relativa de cada miembro: padres arriba, hijos en filas debajo. */
function podShape(n) {
  const rows = [n.parents, ...chunk(n.children, ROW)].filter((r) => r.length);
  const h = (rows.length - 1) * GAP;
  const off = new Map();
  rows.forEach((row, ri) => {
    const w = (row.length - 1) * GAP;
    row.forEach((id, i) => off.set(id, { x: i * GAP - w / 2, y: ri * GAP - h / 2 }));
  });
  const r = Math.max(...[...off.values()].map((o) => Math.hypot(o.x, o.y))) + PAD;
  return { off, r };
}

/** Muta `pos`: compacta cada núcleo y evita que se solapen entre sí o con nodos sueltos. */
export function packNuclei(pos, nuclei, iterations = 80) {
  const pods = nuclei.map((n) => {
    const ids = n.members.filter((id) => pos.has(id));
    if (ids.length < 2) return null;
    const cx = ids.reduce((s, id) => s + pos.get(id).x, 0) / ids.length;
    const cy = ids.reduce((s, id) => s + pos.get(id).y, 0) / ids.length;
    return { ids, cx, cy, ...podShape({ ...n, parents: n.parents.filter((i) => pos.has(i)), children: n.children.filter((i) => pos.has(i)) }) };
  }).filter(Boolean);

  for (let it = 0; it < iterations; it++) {
    let moved = false;
    for (let i = 0; i < pods.length; i++) {
      for (let j = i + 1; j < pods.length; j++) {
        const a = pods[i], b = pods[j];
        let dx = b.cx - a.cx, dy = b.cy - a.cy;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r + MARGIN;
        if (d >= min) continue;
        if (d < 0.01) { const ang = i + j; dx = Math.cos(ang); dy = Math.sin(ang); d = 1; }
        const push = (min - d) / 2;
        a.cx -= (dx / d) * push; a.cy -= (dy / d) * push;
        b.cx += (dx / d) * push; b.cy += (dy / d) * push;
        moved = true;
      }
    }
    if (!moved) break;
  }

  pods.forEach((p) => p.off.forEach((o, id) => pos.set(id, { x: p.cx + o.x, y: p.cy + o.y })));

  // Nodos sueltos que quedaron dentro de un núcleo → se sacan radialmente
  const inPod = new Set(pods.flatMap((p) => p.ids));
  pos.forEach((q, id) => {
    if (inPod.has(id)) return;
    pods.forEach((p) => {
      let dx = q.x - p.cx, dy = q.y - p.cy;
      const d = Math.hypot(dx, dy) || 1;
      const min = p.r + 16;
      if (d < min) pos.set(id, { x: p.cx + (dx / d) * min, y: p.cy + (dy / d) * min });
    });
  });
}