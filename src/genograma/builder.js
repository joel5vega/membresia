// genograma/builder.js
import {
  RELACION,
  GENERACION,
  GENERACION_POR_RELACION,
  TIPO_ARISTA_POR_RELACION,
  SEX,
} from './model';

// ─────────────────────────────────────────────────
// Normalización
// ─────────────────────────────────────────────────

/** Lowercase, sin acentos, sin espacios extra. */
const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Aliases comunes en español → relación canónica. */
const RELACION_ALIASES = {
  'papa': 'padre',
  'papá': 'padre',
  'progenitor': 'padre',
  'mama': 'madre',
  'mamá': 'madre',
  'progenitora': 'madre',
  'hno': 'hermano',
  'hna': 'hermana',
  'tio': 'tio',
  'tía': 'tia',
  'tia': 'tia',
  'conyuge': 'pareja',
  'cónyuge': 'pareja',
  'esposo': 'pareja',
  'esposa': 'pareja',
  'marido': 'pareja',
  'mujer': 'pareja',
  'hijastro': 'hijo',
  'hijastra': 'hija',
};

/** Normaliza cualquier variante a un valor de RELACION. */
function normalizarRelacion(raw) {
  const n = norm(raw);
  if (!n) return null;

  if (RELACION_ALIASES[n]) return RELACION_ALIASES[n];

  if (Object.values(RELACION).includes(n)) return n;

  // Si no matchea, retornar 'otro'
  return RELACION.OTRO;
}

/** Infiere sexo desde la relación normalizada. */
function inferirSexo(relacion) {
  const masculinos = [
    RELACION.PADRE,
    RELACION.ABUELO,
    RELACION.TIO,
    RELACION.HERMANO,
    RELACION.PRIMO,
    RELACION.HIJO,
    RELACION.SOBRINO,
    RELACION.NIETO,
  ];
  const femeninos = [
    RELACION.MADRE,
    RELACION.ABUELA,
    RELACION.TIA,
    RELACION.HERMANA,
    RELACION.PRIMA,
    RELACION.HIJA,
    RELACION.SOBRINA,
    RELACION.NIETA,
  ];

  if (masculinos.includes(relacion)) return SEX.MALE;
  if (femeninos.includes(relacion)) return SEX.FEMALE;
  return SEX.UNKNOWN;
}

// ─────────────────────────────────────────────────
// Builder principal
// ─────────────────────────────────────────────────

export function buildGenograma(member) {
  if (!member) return { nodes: [], edges: [], rootId: null };

  // ── Nodo raíz ──
  const rootId = `root-${member.id || 'self'}`;
  const rootNode = {
    id: rootId,
    nombre:
      member.nombreCompleto ||
      `${member.nombre || ''} ${member.apellido || ''}`.trim() ||
      'Miembro',
    sexo: member.sexo === 'M' || member.sexo === 'F' ? member.sexo : SEX.UNKNOWN,
    fechaNacimiento: member.fechaNacimiento || null,
    fechaMuerte: null,
    photoUrl: member.photoUrl || null,
    generacion: GENERACION.MIEMBRO,
    esRaiz: true,
    relacion: 'miembro',
    memberId: member.id,
  };

  const nodes = [rootNode];

  // ── Nodos familiares ──
  const genograma = Array.isArray(member.genograma) ? member.genograma : [];

  genograma.forEach((persona, index) => {
    const nombre = (persona?.nombre || '').trim();
    if (!nombre) return;

    const relacion = normalizarRelacion(persona.relacion);
    const generacion = GENERACION_POR_RELACION[relacion] ?? GENERACION.MIEMBRO;
    const sexo = inferirSexo(relacion);
    const id = `fam-${member.id || 'self'}-${index}`;

    nodes.push({
      id,
      nombre,
      sexo,
      fechaNacimiento: null,
      fechaMuerte: null,
      photoUrl: null,
      generacion,
      esRaiz: false,
      relacion,
      relacionOriginal: persona.relacion,
      edad: persona.edad || null,
      viveConElMiembro: persona.viveConElMiembro || false,
      memberId: null,
    });
  });

  // ── Edges ──
  const edges = [];
  const padres = nodes.filter((n) => n.relacion === RELACION.PADRE);
  const madres = nodes.filter((n) => n.relacion === RELACION.MADRE);
  const hermanos = nodes.filter(
    (n) => n.relacion === RELACION.HERMANO || n.relacion === RELACION.HERMANA
  );
  const hijos = nodes.filter(
    (n) => n.relacion === RELACION.HIJO || n.relacion === RELACION.HIJA
  );

  // 1) Pareja inferida: padre + madre
  if (padres.length === 1 && madres.length === 1) {
    edges.push({
      id: `edge-pareja-${padres[0].id}-${madres[0].id}`,
      source: padres[0].id,
      target: madres[0].id,
      tipo: 'pareja',
      inferida: true,
    });
  }

  // 2) Descendencia desde padres/madres a TODOS sus hijos
  //    (root + hermanos son hijos de la pareja)
  const todosLosHijos = [rootNode, ...hermanos];

  if (padres.length || madres.length) {
    padres.forEach((padre) => {
      todosLosHijos.forEach((hijo) => {
        if (hijo.id === padre.id) return;
        edges.push({
          id: `edge-desc-${padre.id}-${hijo.id}`,
          source: padre.id,
          target: hijo.id,
          tipo: 'descendencia',
          inferida: true,
        });
      });
    });

    madres.forEach((madre) => {
      todosLosHijos.forEach((hijo) => {
        if (hijo.id === madre.id) return;
        edges.push({
          id: `edge-desc-${madre.id}-${hijo.id}`,
          source: madre.id,
          target: hijo.id,
          tipo: 'descendencia',
          inferida: true,
        });
      });
    });
  } else {
    // Sin padres → root conectado a hermanos con hermandad
    hermanos.forEach((hermano) => {
      edges.push({
        id: `edge-sibling-${rootId}-${hermano.id}`,
        source: rootId,
        target: hermano.id,
        tipo: 'hermandad',
        inferida: true,
      });
    });
  }

  // 3) Hijos del miembro (root → hijo) — solo los que son hijos directos
  hijos.forEach((hijo) => {
    edges.push({
      id: `edge-desc-${rootId}-${hijo.id}`,
      source: rootId,
      target: hijo.id,
      tipo: 'descendencia',
      relacion: hijo.relacion,
      inferida: false,
    });
  });

  return { nodes, edges, rootId };
}