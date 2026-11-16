// src/genograma/forceLayout.js

export function forceLayout(nodes, edges, options) {
  // 1. Identificar componentes conexos (igual que antes)
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source).push(e.target);
      adj.get(e.target).push(e.source);
    }
  });

  const visitados = new Set();
  const componentes = [];

  nodes.forEach(n => {
    if (visitados.has(n.id)) return;
    const comp = [];
    const queue = [n.id];
    visitados.add(n.id);
    while (queue.length > 0) {
      const curr = queue.shift();
      comp.push(curr);
      (adj.get(curr) || []).forEach(v => {
        if (!visitados.has(v)) { visitados.add(v); queue.push(v); }
      });
    }
    componentes.push(comp);
  });

  const solitarios = componentes.filter(c => c.length === 1);
  const familias = componentes.filter(c => c.length > 1);

  const width = 4000;
  const height = 3000;
  const out = new Map();

  // 2. Distribuir familias en una CUADRÍCULA (grid) con espaciado amplio
  const cols = Math.ceil(Math.sqrt(familias.length));
  const cellW = width / (cols + 0.5);  // Espacio horizontal por celda
  const cellH = height / (Math.ceil(familias.length / cols) + 0.5); // Espacio vertical por celda

  familias.forEach((comp, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const baseX = (col + 0.5) * cellW;
    const baseY = (row + 0.5) * cellH;

    // Layout interno de la familia (relativo a un centro de 0,0)
    const n = comp.length;
    const k = Math.sqrt((800 * 800) / n) * 0.7; // Más compacto
    const subX = new Float64Array(n);
    const subY = new Float64Array(n);

    // Inicialización
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      subX[i] = Math.cos(angle) * (20 + Math.random() * 30);
      subY[i] = Math.sin(angle) * (20 + Math.random() * 30);
    }

    const subLinks = edges
      .map(e => [comp.indexOf(e.source), comp.indexOf(e.target), e.peso || 1])
      .filter(([a, b]) => a !== -1 && b !== -1);

    // Física interna
    let temp = 50;
    for (let it = 0; it < 150; it++) {
      const dx = new Float64Array(n);
      const dy = new Float64Array(n);
      // Repulsión
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          let ux = subX[i] - subX[j];
          let uy = subY[i] - subY[j];
          const d2 = ux * ux + uy * uy + 0.01;
          const d = Math.sqrt(d2);
          const f = (k * k) / d2;
          ux /= d; uy /= d;
          dx[i] += ux * f * d; dy[i] += uy * f * d;
          dx[j] -= ux * f * d; dy[j] -= uy * f * d;
        }
      }
      // Atracción
      for (const [a, b, peso] of subLinks) {
        const ux = subX[a] - subX[b];
        const uy = subY[a] - subY[b];
        const d = Math.sqrt(ux * ux + uy * uy) + 0.01;
        const f = (d / k) * (peso * 3);
        dx[a] -= ux * f; dy[a] -= uy * f;
        dx[b] += ux * f; dy[b] += uy * f;
      }
      for (let i = 0; i < n; i++) {
        dx[i] += -subX[i] * 0.05;
        dy[i] += -subY[i] * 0.05;
        const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) + 0.01;
        const m = Math.min(d, temp);
        subX[i] += (dx[i] / d) * m;
        subY[i] += (dy[i] / d) * m;
      }
      temp *= 0.95;
    }

    // Posicionar en el grid
    comp.forEach((id, i) => {
      out.set(id, {
        x: baseX + subX[i],
        y: baseY + subY[i],
      });
    });
  });

  // 3. Distribuir solitarios en la periferia de la cuadrícula
  solitarios.forEach((comp, index) => {
    const angle = (index / solitarios.length) * Math.PI * 2;
    const r = Math.min(width, height) * 0.45 + Math.random() * 100;
    out.set(comp[0], {
      x: width / 2 + Math.cos(angle) * r,
      y: height / 2 + Math.sin(angle) * r,
    });
  });

  return out;
}