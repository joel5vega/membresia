import { norm } from './names';

/** Las avanzadas (Av. Jireh, Av. Elohim…) son otras iglesias, no clases de Canaán. */
export const isAvanzada = (x) => /^av(\s|$)/.test(norm(x?.clase));