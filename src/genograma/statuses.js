export const STATUS = [
  { id: 'activo', label: 'Activo' },
  { id: 'no-asiste', label: 'No asiste' },
  { id: 'fallecido', label: 'Fallecido' },
];
export const STATUS_LABEL = Object.fromEntries(STATUS.map((s) => [s.id, s.label]));