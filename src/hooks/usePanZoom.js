import { useState, useRef, useCallback } from 'react';

const clamp = (v) => Math.max(0.1, Math.min(3, v));

export function usePanZoom(initial = { x: 0, y: 0, scale: 1 }) {
  const [transform, setTransform] = useState(initial);
  const start = useRef(null);
  const last = useRef(null);
  const moved = useRef(false);
  const cleanup = useRef(null);

  // Ref callback: añade el wheel como listener NO pasivo (necesario para preventDefault)
  const svgRef = useCallback((el) => {
    cleanup.current?.();
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setTransform((t) => ({ ...t, scale: clamp(t.scale - e.deltaY * 0.001) }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    cleanup.current = () => el.removeEventListener('wheel', onWheel);
  }, []);

  const end = () => { start.current = null; };

  const handlers = {
    onPointerDown: (e) => {
      start.current = last.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
    },
    onPointerMove: (e) => {
      if (!start.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 4) moved.current = true;
      setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    },
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
  };

  return {
    transform, setTransform, svgRef, handlers,
    wasDragged: () => moved.current,       // evita abrir el modal tras arrastrar
    reset: () => setTransform(initial),
  };
}