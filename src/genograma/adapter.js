// genograma/adapter.js
import { buildGenograma } from './builder';

/**
 * Normaliza un Member de Firestore al modelo de genograma.
 */
export function memberToGenograma(member) {
  if (!member) return { nodes: [], edges: [], rootId: null, memberId: null };

  const { nodes, edges, rootId } = buildGenograma(member);
  return {
    nodes,
    edges,
    rootId,
    memberId: member.id,
    memberName: member.nombreCompleto || `${member.nombre} ${member.apellido}`.trim(),
  };
}

/**
 * Merge de varios genogramas (útil si querés ver varios miembros en un grafo grande).
 */
export function mergeGenogramas(members) {
  const allNodes = [];
  const allEdges = [];
  const roots = [];

  members.forEach(member => {
    const g = memberToGenograma(member);
    allNodes.push(...g.nodes);
    allEdges.push(...g.edges);
    roots.push(g.rootId);
  });

  return { nodes: allNodes, edges: allEdges, roots };
}