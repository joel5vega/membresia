import { useState, useRef, useCallback } from 'react';

const clamp = (v) => Math.max(0.1, Math.min(3, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Zoom manteniendo fijo el punto (cx, cy) bajo el dedo/cursor. */
const zoomAt = (t, factor, cx, cy) => {
  const scale = clamp(t.scale * factor);
  const k = scale / t.scale;
  return { scale, x: cx - (cx - t.x) * k, y: cy - (cy - t.y) * k };
};

export function usePanZoom(initial = { x: 0, y: 0, scale: 1 }) {
  const [transform, setTransform] = useState(initial);
  const pointers = useRef(new Map());   // id → última posición
  const startPt = useRef(null);
  const pinchDist = useRef(null);
  const moved = useRef(false);
  const cleanup = useRef(null);

  // Rueda: listener NO pasivo para poder hacer preventDefault
  const svgRef = useCallback((el) => {
    cleanup.current?.();
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setTransform((t) => zoomAt(t, Math.exp(-e.deltaY * 0.001), e.clientX - r.left, e.clientY - r.top));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    cleanup.current = () => el.removeEventListener('wheel', onWheel);
  }, []);

  const release = (e) => {
    pointers.current.delete(e.pointerId);
    pinchDist.current = null;
    if (!pointers.current.size) startPt.current = null;
  };

  const handlers = {
    onPointerDown: (e) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 1) { startPt.current = { x: e.clientX, y: e.clientY }; moved.current = false; }
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        pinchDist.current = dist(a, b);
        moved.current = true;
      }
    },
    onPointerMove: (e) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const cur = { x: e.clientX, y: e.clientY };
      pointers.current.set(e.pointerId, cur);

      if (pointers.current.size === 2 && pinchDist.current) {
        const [a, b] = [...pointers.current.values()];
        const d = dist(a, b);
        const r = e.currentTarget.getBoundingClientRect();
        const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
        const factor = d / pinchDist.current;
        pinchDist.current = d;
        setTransform((t) => zoomAt(t, factor, mx, my));
        return;
      }
      if (pointers.current.size === 1) {
        if (dist(cur, startPt.current) > 6) moved.current = true;   // umbral táctil
        if (moved.current) setTransform((t) => ({ ...t, x: t.x + cur.x - prev.x, y: t.y + cur.y - prev.y }));
      }
    },
    onPointerUp: release,
    onPointerCancel: release,
    onPointerLeave: release,
  };

  return {
    transform, setTransform, svgRef, handlers,
    wasDragged: () => moved.current,
    reset: () => setTransform(initial),
  };
}