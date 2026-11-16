import { GENERACION } from './model';

const SPACING = 130;
const PAD = 80;

// Orden de bloques dentro de cada generación
const GRUPOS = [
  (n) => ['padre', 'madre'].includes(n.relacion),
  (n) => ['abuelo', 'abuela'].includes(n.relacion),
  (n) => n.esRaiz || n.relacion === 'pareja',
  (n) => ['hermano', 'hermana'].includes(n.relacion),
  (n) => ['hijo', 'hija'].includes(n.relacion),
  () => true,
];

const porGeneracion = (nodes) => {
  const map = new Map();
  nodes.forEach((n) => {
    const g = n.generacion ?? GENERACION.MIEMBRO;
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(n);
  });
  return map;
};

/** Tamaño del lienzo según la fila más ancha. */
export function canvasSize(nodes) {
  const gens = porGeneracion(nodes);
  const maxRow = Math.max(1, ...[...gens.values()].map((r) => r.length));
  return {
    width: Math.max(1000, maxRow * SPACING + PAD * 2),
    height: Math.max(500, gens.size * 170 + PAD),
  };
}

function armarBloques(nodes) {
  const usados = new Set();
  const take = (pred) => {
    const b = nodes.filter((n) => !usados.has(n.id) && pred(n));
    b.forEach((n) => usados.add(n.id));
    return b;
  };
  return GRUPOS.map(take).filter((b) => b.length);
}

export function layoutByGenerationSmart(nodes, { width, height }) {
  const positions = new Map();
  const gens = porGeneracion(nodes);
  const ordenadas = [...gens.keys()].sort((a, b) => b - a);
  const paso = ordenadas.length > 1 ? (height - PAD * 2) / (ordenadas.length - 1) : 0;

  ordenadas.forEach((gen, row) => {
    const y = ordenadas.length > 1 ? PAD + row * paso : height / 2;
    const bloques = armarBloques(gens.get(gen));
    const total = bloques.reduce((s, b) => s + b.length * SPACING, 0);
    let x = (width - total) / 2;
    bloques.forEach((b) => b.forEach((n) => {
      positions.set(n.id, { x: x + SPACING / 2, y, generacion: gen });
      x += SPACING;
    }));
  });
  return positions;
}