// src/genograma/globalBuilder.js

const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Registra a todos los miembros en un Map, cruzando genogramas.
 */
function registrarPersonas(members) {
  const personNodes = new Map();

  // 1. Registrar miembros
  members.forEach((m) => {
    const nombreCompleto =
      m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();
    if (!nombreCompleto) return;

    const key = norm(nombreCompleto);
    personNodes.set(key, {
      id: m.id,
      nombre: nombreCompleto,
      sexo: m.sexo || '?',
      photoUrl: m.photoUrl || null,
      esMiembroIglesia: true,
      connections: [],
    });
  });

  // 2. Cruzar genogramas
  members.forEach((m) => {
    const nombreMiembro =
      m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();
    const keyMiembro = norm(nombreMiembro);

    const genograma = Array.isArray(m.genograma) ? m.genograma : [];

    genograma.forEach((fam) => {
      const nombreFam = (fam.nombre || '').trim();
      if (!nombreFam) return;

      const keyFam = norm(nombreFam);

      // Crear "fantasma" si no existe
      if (!personNodes.has(keyFam)) {
        const esFemenino = /a$/i.test(fam.relacion || '');
        personNodes.set(keyFam, {
          id: `ghost-${keyFam.replace(/\s+/g, '-')}`,
          nombre: nombreFam,
          sexo: esFemenino ? 'F' : 'M',
          photoUrl: null,
          esMiembroIglesia: false,
          connections: [],
        });
      }

      const miembroData = personNodes.get(keyMiembro);
      const familiarData = personNodes.get(keyFam);

      if (!miembroData || !familiarData) return;

      // Inferir tipo: familia o amistad
      const esAmistad = /amig/i.test(fam.relacion || '');
      const tipo = esAmistad ? 'amistad' : 'familia';
      const peso = esAmistad ? 1 : 2;

      // Evitar duplicados
      const yaConectado = miembroData.connections.some(
        (c) => c.target === keyFam
      );

      if (!yaConectado) {
        miembroData.connections.push({ target: keyFam, tipo, peso });
        familiarData.connections.push({ target: keyMiembro, tipo, peso });
      }
    });
  });

  return personNodes;
}

/**
 * ─────────────────────────────────────────────
 * FUNCIÓN 1: buildClanes
 * Para la vista de tarjetas (ClanesView)
 * Devuelve { clanes, totalPersonas }
 * ─────────────────────────────────────────────
 */
export function buildClanes(members) {
  const personNodes = registrarPersonas(members);
  const allNodes = [...personNodes.values()];

  const visitados = new Set();
  const clanes = [];

  allNodes.forEach((node) => {
    const key = norm(node.nombre);
    if (visitados.has(key)) return;

    // BFS para encontrar todos los conectados
    const clan = [];
    const queue = [key];
    visitados.add(key);

    while (queue.length > 0) {
      const currKey = queue.shift();
      const currData = personNodes.get(currKey);
      if (!currData) continue;
      clan.push(currData);

      currData.connections.forEach((conn) => {
        if (!visitados.has(conn.target)) {
          visitados.add(conn.target);
          queue.push(conn.target);
        }
      });
    }

    // Solo clanes de 2 o más
    if (clan.length > 1) {
      // Apellido más común del clan
      const apellidos = clan.map((p) => {
        const partes = p.nombre.split(' ').filter(Boolean);
        return partes[partes.length - 1] || '';
      });
      const counts = {};
      apellidos.forEach((a) => {
        if (a) counts[a] = (counts[a] || 0) + 1;
      });
      const apellidoComun =
        Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] ||
        'Sin apellido';

      clanes.push({
        id: `clan-${clan.length}-${clan[0].id}`,
        nombre: `Familia ${apellidoComun}`,
        miembros: clan,
        totalMiembrosIglesia: clan.filter((m) => m.esMiembroIglesia).length,
      });
    }
  });

  clanes.sort((a, b) => b.miembros.length - a.miembros.length);

  return { clanes, totalPersonas: allNodes.length };
}

/**
 * ─────────────────────────────────────────────
 * FUNCIÓN 2: buildGlobalGraph
 * Para la vista de constelación (ClanesGraphView)
 * Devuelve { nodes, edges }
 * ─────────────────────────────────────────────
 */
export function buildGlobalGraph(members) {
  const personNodes = registrarPersonas(members);

  const nodes = [];
  const edges = [];
  const edgeSet = new Set();

  personNodes.forEach((p, key) => {
    // Cluster (para colorear)
    p.cluster =
      p.connections.length === 0
        ? 'solo'
        : p.connections.some((c) => c.tipo === 'familia')
        ? 'familia'
        : 'amigos';

    nodes.push({ ...p, key });

    p.connections.forEach((c) => {
      const edgeId = [key, c.target].sort().join('-');
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({
          source: key,
          target: c.target,
          tipo: c.tipo,
          peso: c.peso,
        });
      }
    });
  });

  return { nodes, edges };
}