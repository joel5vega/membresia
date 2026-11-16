import { RELACION, GENERACION, GENERACION_POR_RELACION, SEX } from './model';

const norm = (s) =>
  (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const ALIASES = {
  papa: 'padre', progenitor: 'padre', mama: 'madre', progenitora: 'madre',
  hno: 'hermano', hna: 'hermana',
  conyuge: 'pareja', esposo: 'pareja', esposa: 'pareja', marido: 'pareja', mujer: 'pareja',
  hijastro: 'hijo', hijastra: 'hija',
};

const MASC = [RELACION.PADRE, RELACION.ABUELO, RELACION.TIO, RELACION.HERMANO,
  RELACION.PRIMO, RELACION.HIJO, RELACION.SOBRINO, RELACION.NIETO, RELACION.AMIGO];
const FEM = [RELACION.MADRE, RELACION.ABUELA, RELACION.TIA, RELACION.HERMANA,
  RELACION.PRIMA, RELACION.HIJA, RELACION.SOBRINA, RELACION.NIETA, RELACION.AMIGA];

function normalizarRelacion(raw) {
  const n = norm(raw);
  if (!n) return null;
  if (ALIASES[n]) return ALIASES[n];
  return Object.values(RELACION).includes(n) ? n : RELACION.OTRO;
}

function inferirSexo(relacion, raw, sexoGuardado) {
  if (sexoGuardado === 'M' || sexoGuardado === 'F') return sexoGuardado;
  const r = norm(raw);
  if (r === 'esposo' || r === 'marido') return SEX.MALE;
  if (r === 'esposa') return SEX.FEMALE;
  if (MASC.includes(relacion)) return SEX.MALE;
  if (FEM.includes(relacion)) return SEX.FEMALE;
  return SEX.UNKNOWN;
}

const mkEdge = (tipo, a, b) => ({
  id: `edge-${tipo}-${a.id}-${b.id}`, source: a.id, target: b.id, tipo, inferida: true,
});

export function buildGenograma(member) {
  if (!member) return { nodes: [], edges: [], rootId: null };

  const rootId = `root-${member.id || 'self'}`;
  const root = {
    id: rootId,
    nombre: member.nombreCompleto || `${member.nombre || ''} ${member.apellido || ''}`.trim() || 'Miembro',
    sexo: member.sexo === 'M' || member.sexo === 'F' ? member.sexo : SEX.UNKNOWN,
    photoUrl: member.photoUrl || null,
    generacion: GENERACION.MIEMBRO,
    esRaiz: true,
    relacion: 'miembro',
    memberId: member.id,
  };

  const nodes = [root];
  (Array.isArray(member.genograma) ? member.genograma : []).forEach((p, index) => {
    const nombre = (p?.nombre || '').trim();
    if (!nombre) return;
    const relacion = normalizarRelacion(p.relacion);
    nodes.push({
      id: `fam-${member.id || 'self'}-${index}`,
      genogramaIndex: index,                 // ← enlaza el nodo con el array editable
      nombre,
      sexo: inferirSexo(relacion, p.relacion, p.sexo),
      photoUrl: null,
      generacion: GENERACION_POR_RELACION[relacion] ?? GENERACION.MIEMBRO,
      esRaiz: false,
      relacion,
      relacionOriginal: p.relacion,
      edad: p.edad || null,
      viveConElMiembro: !!p.viveConElMiembro,
    });
  });

  const by = (...rels) => nodes.filter((n) => rels.includes(n.relacion));
  const padres = by(RELACION.PADRE);
  const madres = by(RELACION.MADRE);
  const progenitores = [...padres, ...madres];
  const hermanos = by(RELACION.HERMANO, RELACION.HERMANA);
  const hijos = by(RELACION.HIJO, RELACION.HIJA);
  const parejas = by(RELACION.PAREJA);
  const abuelos = by(RELACION.ABUELO, RELACION.ABUELA);
  const edges = [];

  // Padre + madre
  if (padres[0] && madres[0]) edges.push(mkEdge('pareja', padres[0], madres[0]));

  // Padres → miembro y hermanos (o hermandad directa si no hay padres)
  if (progenitores.length) {
    progenitores.forEach((p) =>
      [root, ...hermanos].forEach((h) => edges.push(mkEdge('descendencia', p, h))));
  } else {
    hermanos.forEach((h) => edges.push(mkEdge('hermandad', root, h)));
  }

  // Miembro ↔ pareja
  parejas.forEach((p) => edges.push(mkEdge('pareja', root, p)));

  // Miembro (y su pareja) → hijos
  hijos.forEach((h) =>
    [root, parejas[0]].filter(Boolean).forEach((p) => edges.push(mkEdge('descendencia', p, h))));

  // Abuelos: pareja entre ellos; descienden hacia el primer progenitor (aproximación)
  const [ab, aba] = [abuelos.find((n) => n.relacion === RELACION.ABUELO),
                     abuelos.find((n) => n.relacion === RELACION.ABUELA)];
  if (ab && aba) edges.push(mkEdge('pareja', ab, aba));
  if (progenitores[0]) abuelos.forEach((a) => edges.push(mkEdge('descendencia', a, progenitores[0])));

  return { nodes, edges, rootId };
}