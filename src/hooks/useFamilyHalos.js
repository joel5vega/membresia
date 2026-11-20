import { useMemo } from 'react';
import { familyName } from '../genograma/clusters';
import { familyComponents } from '../genograma/familyComponents';

/** `nodes` deben venir de buildPeople (con surnames). */
export function useFamilyHalos({ nodes, edges }, positions) {
  return useMemo(() => {
    if (!nodes.length || !positions.size) return [];
    const byId = new Map(nodes.map((n) => [n.id, n]));

    return familyComponents(nodes, edges, 3).flatMap((comp) => {
      const pts = comp.map((id) => positions.get(id)).filter(Boolean);
      if (pts.length < 3) return [];
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const radius = Math.max(...pts.map((p) => Math.hypot(p.x - cx, p.y - cy))) + 40;
      return [{ cx, cy, radius, etiqueta: familyName(comp.map((id) => byId.get(id))).top }];
    });
  }, [nodes, edges, positions]);
}