// src/genograma/forceLayout.js

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function forceLayout(
  nodes,
  edges,
  {
    width = 4000,
    height = 3000,
    iterations = 600,
    seed = 7,
    pad = 200, // Más margen para que los solitarios no salgan de pantalla
  } = {}
) {
  const n = nodes.length;
  const out = new Map();
  if (!n) return out;

  const rnd = mulberry32(seed);
  const idx = new Map(nodes.map((nd, i) => [nd.id, i]));

  // Identificar quiénes están conectados (tienen familia/amigos)
  const conectados = new Set();
  edges.forEach(e => { conectados.add(e.source); conectados.add(e.target); });

  const links = edges
    .map((e) => [idx.get(e.source), idx.get(e.target), e.peso || 1])
    .filter(([a, b]) => a != null && b != null);

  const cx = width / 2;
  const cy = height / 2;
  const k = Math.sqrt((width * height) / n) * 0.9;

  const x = new Float64Array(n);
  const y = new Float64Array(n);

  // Inicialización: los conectados en el centro, los solitarios en el borde
  for (let i = 0; i < n; i++) {
    const id = nodes[i].id;
    const a = rnd() * Math.PI * 2;
    
    if (conectados.has(id)) {
      // Conectados: cerca del centro
      const r = Math.min(width, height) * 0.2 * Math.sqrt(rnd());
      x[i] = cx + Math.cos(a) * r;
      y[i] = cy + Math.sin(a) * r;
    } else {
      // Solitarios: en la periferia
      const r = Math.min(width, height) * 0.45;
      x[i] = cx + Math.cos(a) * r;
      y[i] = cy + Math.sin(a) * r;
    }
  }

  let temp = width / 8;
  const dx = new Float64Array(n);
  const dy = new Float64Array(n);

  for (let it = 0; it < iterations; it++) {
    dx.fill(0);
    dy.fill(0);

    // Repulsión
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let ux = x[i] - x[j];
        let uy = y[i] - y[j];
        const d2 = ux * ux + uy * uy + 0.01;
        const d = Math.sqrt(d2);
        
        // Los solitarios repelen con menos fuerza para no desarmar las familias
        const idI = nodes[i].id;
        const idJ = nodes[j].id;
        const esSolitario = !conectados.has(idI) && !conectados.has(idJ);
        const f = (k * k) / d2 * (esSolitario ? 0.2 : 1);
        
        ux /= d;
        uy /= d;
        dx[i] += ux * f * d;
        dy[i] += uy * f * d;
        dx[j] -= ux * f * d;
        dy[j] -= uy * f * d;
      }
    }

    // Atracción de aristas (MÁS FUERTE para familias)
    for (const [a, b, peso] of links) {
      const ux = x[a] - x[b];
      const uy = y[a] - y[b];
      const d = Math.sqrt(ux * ux + uy * uy) + 0.01;
      const f = (d / k) * (peso * 3); // Forzar mucho más la unión
      dx[a] -= ux * f;
      dy[a] -= uy * f;
      dx[b] += ux * f;
      dy[b] += uy * f;
    }

    // Gravedad al centro (los solitarios son empujados al borde)
    for (let i = 0; i < n; i++) {
      const id = nodes[i].id;
      const esSolitario = !conectados.has(id);
      const gravity = esSolitario ? -0.02 : 0.15; // Negativo = empuja hacia afuera
      
      dx[i] += (cx - x[i]) * gravity;
      dy[i] += (cy - y[i]) * gravity;
      
      const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) + 0.01;
      const m = Math.min(d, temp);
      x[i] += (dx[i] / d) * m;
      y[i] += (dy[i] / d) * m;
    }

    temp *= 0.985;
  }

  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);
  const s = Math.min(
    (width - 2 * pad) / (maxX - minX || 1),
    (height - 2 * pad) / (maxY - minY || 1),
    3
  );

  nodes.forEach((nd, i) => {
    out.set(nd.id, {
      x: cx + (x[i] - (minX + maxX) / 2) * s,
      y: cy + (y[i] - (minY + maxY) / 2) * s,
    });
  });

  return out;
}