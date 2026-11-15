// genograma/layout.js
import { GENERACION } from './model';

/**
 * Layout jerárquico por generación con agrupación de parejas y hermanos.
 *
 * - Abuelos arriba, padres en el medio, root, luego hijos, nietos.
 * - Padre + Madre se dibujan juntos en la misma fila.
 * - Hermanos se agrupan al costado del root.
 */
export function layoutByGenerationSmart(
  nodes,
  { width = 1200, height = 700, nodeSpacing = 130, paddingY = 80 } = {}
) {
  const positions = new Map();
  if (!nodes.length) return positions;

  // ── Agrupar por generación ──
  const porGeneracion = new Map();
  nodes.forEach((node) => {
    const gen = node.generacion ?? GENERACION.MIEMBRO;
    if (!porGeneracion.has(gen)) porGeneracion.set(gen, []);
    porGeneracion.get(gen).push(node);
  });

  const gensOrdenadas = [...porGeneracion.keys()].sort((a, b) => b - a);
  const numFilas = gensOrdenadas.length;
  const yInicio = paddingY;
  const yFin = height - paddingY;
  const espacioY = numFilas > 1 ? (yFin - yInicio) / (numFilas - 1) : 0;

  gensOrdenadas.forEach((gen, rowIndex) => {
    const nodesGen = porGeneracion.get(gen);
    const y = numFilas > 1 ? yInicio + rowIndex * espacioY : height / 2;

    const bloques = armarBloques(nodesGen);
    const anchoTotal = bloques.reduce(
      (sum, bloque) => sum + bloque.length * nodeSpacing,
      0
    );
    let x = (width - anchoTotal) / 2;

    bloques.forEach((bloque) => {
      bloque.forEach((node) => {
        positions.set(node.id, {
          x: x + nodeSpacing / 2,
          y,
          generacion: gen,
        });
        x += nodeSpacing;
      });
    });
  });

  return positions;
}

/**
 * Arma bloques dentro de una generación:
 *   [padre, madre] juntos si son pareja,
 *   [root] al centro,
 *   [hermanos] juntos,
 *   [hijos] juntos,
 *   resto al final.
 */
function armarBloques(nodes) {
  const root = nodes.filter((n) => n.esRaiz);
  const padre = nodes.filter((n) => n.relacion === 'padre');
  const madre = nodes.filter((n) => n.relacion === 'madre');
  const hermanos = nodes.filter(
    (n) => n.relacion === 'hermano' || n.relacion === 'hermana'
  );
  const hijos = nodes.filter(
    (n) => n.relacion === 'hijo' || n.relacion === 'hija'
  );
  const otros = nodes.filter(
    (n) =>
      ![
        'padre',
        'madre',
        'hermano',
        'hermana',
        'hijo',
        'hija',
        'miembro',
      ].includes(n.relacion)
  );

  const bloques = [];

  if (padre.length && madre.length) {
    bloques.push([...padre, ...madre]);
  } else {
    if (padre.length) bloques.push(padre);
    if (madre.length) bloques.push(madre);
  }

  if (root.length) bloques.push(root);
  if (hermanos.length) bloques.push(hermanos);
  if (hijos.length) bloques.push(hijos);
  if (otros.length) bloques.push(otros);

  return bloques;
}