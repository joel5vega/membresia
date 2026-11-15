// genograma/builder.js
import {
  RELACION,
  GENERACION,
  GENERACION_POR_RELACION,
  TIPO_ARISTA_POR_RELACION,
  SEX,
} from './model';

/**
 * Convierte el genograma plano de un Member en nodos + aristas.
 *
 * Entrada: member (con member.genograma = [{nombre, relacion, edad, viveConElMiembro}])
 * Salida:  { nodes, edges, rootId }
 */
export function buildGenograma(member) {
  if (!member) return { nodes: [], edges: [], rootId: null };

  // ── Nodo raíz (el miembro mismo) ──
  const rootId = `root-${member.id}`;
  const rootNode = {
    id: rootId,
    nombre: member.nombreCompleto || `${member.nombre} ${member.apellido}`.trim(),
    sexo: member.sexo || SEX.UNKNOWN,
    fechaNacimiento: member.fechaNacimiento || null,
    fechaMuerte: null,
    photoUrl: member.photoUrl || null,
    generacion: GENERACION.MIEMBRO,
    esRaiz: true,
    relacion: 'miembro',
    memberId: member.id,
  };

  const nodes = [rootNode];
  const edges = [];

  // ── Nodos hijos (familiares del genograma plano) ──
  const genograma = Array.isArray(member.genograma) ? member.genograma : [];

  genograma.forEach((persona, index) => {
    // Saltar filas vacías
    if (!persona?.nombre?.trim()) return;

    const id = `fam-${member.id}-${index}`;
    const generacion = GENERACION_POR_RELACION[persona.relacion] ?? GENERACION.MIEMBRO;

    // Inferir sexo desde la relación
    const sexo = inferirSexo(persona.relacion);

    const node = {
      id,
      nombre: persona.nombre.trim(),
      sexo,
      fechaNacimiento: null, // el modelo plano no lo tiene, pero podrías agregarlo
      fechaMuerte: null,
      photoUrl: null,
      generacion,
      esRaiz: false,
      relacion: persona.relacion,
      edad: persona.edad || null,
      viveConElMiembro: persona.viveConElMiembro || false,
      memberId: null,
    };

    nodes.push(node);

    // ── Arista desde el nodo raíz al familiar ──
    const tipoArista = TIPO_ARISTA_POR_RELACION[persona.relacion] ?? 'descendencia';

    edges.push({
      id: `edge-${rootId}-${id}`,
      source: rootId,
      target: id,
      tipo: tipoArista,
      relacion: persona.relacion,
      // Si el familiar es padre/madre → la arista va del familiar al root
      // Si es hijo/hija → del root al familiar
      // Si es hermano/hermana → arista horizontal (hermandad)
      direccion: inferirDireccion(persona.relacion),
    });
  });

  return { nodes, edges, rootId };
}

/**
 * Infiere el sexo a partir del nombre de la relación.
 */
function inferirSexo(relacion) {
  const masculinos = [
    RELACION.PADRE, RELACION.ABUELO, RELACION.TIO,
    RELACION.HERMANO, RELACION.PRIMO, RELACION.HIJO,
    RELACION.SOBRINO, RELACION.NIETO,
  ];
  const femeninos = [
    RELACION.MADRE, RELACION.ABUELA, RELACION.TIA,
    RELACION.HERMANA, RELACION.PRIMA, RELACION.HIJA,
    RELACION.SOBRINA, RELACION.NIETA,
  ];

  if (masculinos.includes(relacion)) return SEX.MALE;
  if (femeninos.includes(relacion)) return SEX.FEMALE;
  return SEX.UNKNOWN;
}

/**
 * Dirección de la arista para el layout.
 * - 'up': el familiar está arriba (padre, abuelo, tío)
 * - 'down': el familiar está abajo (hijo, nieto, sobrino)
 * - 'horizontal': mismo nivel (hermano, primo, pareja)
 */
function inferirDireccion(relacion) {
  const arriba = [RELACION.PADRE, RELACION.MADRE, RELACION.ABUELO, RELACION.ABUELA, RELACION.TIO, RELACION.TIA];
  const abajo = [RELACION.HIJO, RELACION.HIJA, RELACION.NIETO, RELACION.NIETA, RELACION.SOBRINO, RELACION.SOBRINA];

  if (arriba.includes(relacion)) return 'up';
  if (abajo.includes(relacion)) return 'down';
  return 'horizontal';
}