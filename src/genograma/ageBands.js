export const BANDS = [
  { id: 'ninos',        label: 'Niños (0–12)',          min: 0,  max: 12,  color: '#fa6800' },
  { id: 'adolescentes', label: 'Adolescentes (13–17)',  min: 13, max: 17,  color: '#6a00ff' },
  { id: 'jovenes',      label: 'Jóvenes (18–29)',       min: 18, max: 29,  color: '#00aba9' },
  { id: 'adultos',      label: 'Adultos (30–59)',       min: 30, max: 59,  color: '#2d89ef' },
  { id: 'mayores',      label: 'Mayores (60+)',         min: 60, max: 200, color: '#00a300' },
  { id: 'sin',          label: 'Sin edad registrada',   color: '#777' },
];

export const bandOf = (edad) =>
  edad == null ? BANDS[5] : BANDS.find((b) => b.max != null && edad >= b.min && edad <= b.max) || BANDS[5];

export const byName = (a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });

export const countByBand = (list) =>
  list.reduce((acc, p) => { const id = bandOf(p.edad).id; acc[id] = (acc[id] || 0) + 1; return acc; }, {});

/** [{ band, items }] solo con las franjas que tienen gente. Respeta el orden de `list`. */
export const groupByBand = (list) =>
  BANDS.map((band) => ({ band, items: list.filter((p) => bandOf(p.edad).id === band.id) }))
    .filter((g) => g.items.length);