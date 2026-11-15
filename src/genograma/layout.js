// genograma/layout.js
import { GENERACION } from './model';

/**
 * Layout jerárquico por generación.
 * Cada generación va en una fila horizontal. Los nodos dentro de una fila
 * se distribuyen uniformemente.
 *
 * @param {Array} nodes - Nodos del grafo
 * @param {Object} options - { width, height, padding }
 * @returns {Map<id, {x, y, generacion}>}
 */
export function layoutByGeneration(nodes, {
  width = 1000,
  height = 700,
  paddingX = 60,
  paddingY = 80,
} = {}) {
  const positions = new Map();

  if (!nodes.length) return positions;

  // ── Agrupar nodos por generación ──
  const generaciones = new Map();
  nodes.forEach(node => {
    const gen = node.generacion ?? GENERACION.MIEMBRO;
    if (!generaciones.has(gen)) generaciones.set(gen, []);
    generaciones.get(gen).push(node);
  });

  // ── Ordenar generaciones de mayor a menor (abuelos arriba) ──
  const gensOrdenadas = [...generaciones.keys()].sort((a, b) => b - a);

  // ── Calcular altura disponible ──
  const numFilas = gensOrdenadas.length;
  const alturaUtil = height - 2 * paddingY;
  const espacioVertical = numFilas > 1 ? alturaUtil / (numFilas - 1) : 0;

  gensOrdenadas.forEach((gen, rowIndex) => {
    const nodesGen = generaciones.get(gen);
    const numNodos = nodesGen.length;

    // Y de la fila
    const y = paddingY + rowIndex * espacioVertical;

    // Distribuir X uniformemente
    const anchoUtil = width - 2 * paddingX;
    const espacioHorizontal = numNodos > 1 ? anchoUtil / (numNodos - 1) : 0;

    nodesGen.forEach((node, colIndex) => {
      const x = numNodos > 1
        ? paddingX + colIndex * espacioHorizontal
        : width / 2;

      positions.set(node.id, { x, y, generacion: gen });
    });
  });

  return positions;
}

/**
 * Variante mejorada: centra parejas juntas y agrupa hermanos.
 * Más compleja, pero mucho más legible visualmente.
 */
export function layoutByGenerationSmart(nodes, {
  width = 1000,
  height = 700,
  paddingX = 60,
  paddingY = 80,
  nodeSpacing = 90,
} = {}) {
  const positions = new Map();
  if (!nodes.length) return positions;

  // Agrupar por generación
  const generaciones = new Map();
  nodes.forEach(node => {
    const gen = node.generacion ?? GENERACION.MIEMBRO;
    if (!generaciones.has(gen)) generaciones.set(gen, []);
    generaciones.get(gen).push(node);
  });

  const gensOrdenadas = [...generaciones.keys()].sort((a, b) => b - a);
  const numFilas = gensOrdenadas.length;
  const alturaUtil = height - 2 * paddingY;
  const espacioVertical = numFilas > 1 ? alturaUtil / (numFilas - 1) : 0;

  gensOrdenadas.forEach((gen, rowIndex) => {
    const nodesGen = generaciones.get(gen);

    // Agrupar por familia (misma "rama")
    const grupos = agruparPorFamilia(nodesGen);

    // Calcular ancho total
    const anchoTotal = grupos.reduce((sum, grupo) => sum + grupo.length * nodeSpacing, 0);
    const inicioX = (width - anchoTotal) / 2;

    const y = paddingY + rowIndex * espacioVertical;

    let x = inicioX;
    grupos.forEach(grupo => {
      grupo.forEach(node => {
        positions.set(node.id, { x: x + nodeSpacing / 2, y, generacion: gen });
        x += nodeSpacing;
      });
    });
  });

  return positions;
}

/**
 * Agrupa nodos por familia inferida (por relación).
 */
function agruparPorFamilia(nodes) {
  const padres = nodes.filter(n => ['padre', 'madre'].includes(n.relacion));
  const hijos = nodes.filter(n => ['hijo', 'hija'].includes(n.relacion));
  const hermanos = nodes.filter(n => ['hermano', 'hermana'].includes(n.relacion));
  const otros = nodes.filter(n => !['padre', 'madre', 'hijo', 'hija', 'hermano', 'hermana'].includes(n.relacion));

  // Padres juntos, hijos juntos, hermanos juntos, otros al final
  return [hermanos, otros, padres, hijos].filter(g => g.length > 0);
}