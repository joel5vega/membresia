import { useRef, useMemo } from 'react';
import { forceLayout } from '../genograma/forceLayout';
import { packNuclei } from '../genograma/nuclei';
import { packClusters } from '../genograma/clusterPack';
import { familyComponents } from '../genograma/familyComponents';

/** Calcula el layout una sola vez; los nodos nuevos aparecen junto a un vecino. */
export function useStablePositions({ nodes, edges }, nuclei = []) {
  const store = useRef(new Map());

  return useMemo(() => {
    const pos = store.current;
    if (!nodes.length) return pos;

    if (pos.size === 0) {
      forceLayout(nodes, edges).forEach((v, k) => pos.set(k, v));
      packNuclei(pos, nuclei);                              // núcleos dentro de cada familia
      packClusters(pos, familyComponents(nodes, edges));    // familias entre sí
    } else {
      nodes.forEach((n) => {
        if (pos.has(n.id)) return;
        const link = edges.find(
          (e) => (e.source === n.id && pos.has(e.target)) || (e.target === n.id && pos.has(e.source))
        );
        const neighbor = link && (link.source === n.id ? link.target : link.source);
        const base = neighbor ? pos.get(neighbor) : { x: 2000, y: 1500 };
        const a = Math.random() * Math.PI * 2;
        pos.set(n.id, { x: base.x + Math.cos(a) * 70, y: base.y + Math.sin(a) * 70 });
      });
    }
    return new Map(pos);
  }, [nodes, edges, nuclei]);
}