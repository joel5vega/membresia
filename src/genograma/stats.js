// genograma/stats.js
import { GENERACION_POR_RELACION, GENERACION } from './model';

/**
 * Estadísticas del genograma.
 */
export function buildStats(nodes) {
  const real = nodes.filter(n => !n.esRaiz || n.esRaiz); // todos
  const familiares = real.filter(n => !n.esRaiz);

  const porGeneracion = {};
  familiares.forEach(n => {
    const gen = n.generacion ?? GENERACION.MIEMBRO;
    const label = generacionLabel(gen);
    porGeneracion[label] = (porGeneracion[label] || 0) + 1;
  });

  const porRelacion = {};
  familiares.forEach(n => {
    porRelacion[n.relacion] = (porRelacion[n.relacion] || 0) + 1;
  });

  return {
    totalFamiliares: familiares.length,
    porGeneracion,
    porRelacion,
    tieneConyuge: familiares.some(n => n.relacion === 'pareja'),
    tieneHijos: familiares.some(n => ['hijo', 'hija'].includes(n.relacion)),
    generacionesCubiertas: Object.keys(porGeneracion).length,
  };
}

function generacionLabel(gen) {
  switch (gen) {
    case GENERACION.ABUELOS: return 'Abuelos';
    case GENERACION.PADRES: return 'Padres / Tíos';
    case GENERACION.MIEMBRO: return 'Miembro / Hermanos';
    case GENERACION.HIJOS: return 'Hijos / Sobrinos';
    case GENERACION.NIETOS: return 'Nietos';
    default: return 'Otros';
  }
}

/**
 * Detecta relaciones faltantes ("huecos" en el árbol).
 */
export function detectGaps(nodes) {
  const faltantes = [];
  const tiene = (rel) => nodes.some(n => n.relacion === rel);

  if (!tiene('padre')) faltantes.push('Falta el padre');
  if (!tiene('madre')) faltantes.push('Falta la madre');
  if (!tiene('hermano') && !tiene('hermana')) faltantes.push('No hay hermanos registrados');
  if (!tiene('hijo') && !tiene('hija')) faltantes.push('No hay hijos registrados');

  return faltantes;
}