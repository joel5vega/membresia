// src/genograma/globalBuilder.js
import { norm } from './names';
import { inferRelations } from './inference';

/**
 * Registra a todos los miembros en un Map usando el NOMBRE NORMALIZADO como ID.
 */
function registrarPersonas(members) {
  const personNodes = new Map();

  // 1. Registrar miembros de la iglesia
  members.forEach((m) => {
    const nombreCompleto = m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();
    if (!nombreCompleto) return;

    const key = norm(nombreCompleto);
    if (!personNodes.has(key)) {
      personNodes.set(key, {
        id: key, // <-- AQUÍ ESTABA EL BUG: Usamos la key como ID
        realId: m.id, // Guardamos el ID de Firestore por si lo necesitamos
        nombre: nombreCompleto,
        sexo: m.sexo || '?',
        photoUrl: m.photoUrl || null,
        esMiembroIglesia: true,
        connections: [],
      });
    }
  });

  // 2. Cruzar genogramas (Familia y Amistades)
  members.forEach((m) => {
    const nombreMiembro = m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();
    const keyMiembro = norm(nombreMiembro);

    const genograma = Array.isArray(m.genograma) ? m.genograma : [];

    genograma.forEach((fam) => {
      const nombreFam = (fam.nombre || '').trim();
      if (!nombreFam) return;

      const keyFam = norm(nombreFam);

      // Si el familiar no es miembro, crear "fantasma"
      if (!personNodes.has(keyFam)) {
        // Inferir sexo por la relación (termina en 'a')
        const rel = norm(fam.relacion);
        const sexo =
          fam.sexo === 'M' || fam.sexo === 'F' ? fam.sexo
          : /^(madre|hermana|hija|abuela|tia|prima|sobrina|nieta|esposa|amiga)$/.test(rel) ? 'F'
          : /^(padre|hermano|hijo|abuelo|tio|primo|sobrino|nieto|esposo|amigo)$/.test(rel) ? 'M'
          : '?';
        personNodes.set(keyFam, {
          id: keyFam,
          realId: null,
          nombre: nombreFam,
          sexo: sexo,
          photoUrl: null,
          esMiembroIglesia: false,
          connections: [],
        });
      }

      const miembroData = personNodes.get(keyMiembro);
      const familiarData = personNodes.get(keyFam);

      if (!miembroData || !familiarData) return;

      // Inferir tipo de relación
      const esAmistad = /amig|conocid/i.test(fam.relacion || '');
      const tipo = esAmistad ? 'amistad' : 'familia';
      const peso = esAmistad ? 1 : 2;

      // Evitar duplicados
      const yaConectado = miembroData.connections.some((c) => c.target === keyFam);
      if (!yaConectado) {
        miembroData.connections.push({ target: keyFam, tipo, peso });
        familiarData.connections.push({ target: keyMiembro, tipo, peso });
      }
    });
  });
    // 3. Conexiones inferidas (hermanos, abuelos, tíos…) — solo en memoria
  inferRelations(members).forEach(({ from, to }) => {
    const a = personNodes.get(from);
    const b = personNodes.get(to);
    if (!a || !b || a.connections.some((c) => c.target === to)) return;
    a.connections.push({ target: to, tipo: 'familia', peso: 1, derivada: true });
    b.connections.push({ target: from, tipo: 'familia', peso: 1, derivada: true });
  });
  return personNodes;
}

/**
 * FUNCIÓN 1: Para las tarjetas (ClanesView)
 */
export function buildClanes(members) {
  const personNodes = registrarPersonas(members);
  const allNodes = [...personNodes.values()];

  const visitados = new Set();
  const clanes = [];

  allNodes.forEach((node) => {
    const key = node.id;
    if (visitados.has(key)) return;

    // BFS
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

    if (clan.length > 1) {
      // Apellido más común
      const apellidos = clan.map((p) => {
        const partes = p.nombre.split(' ').filter(Boolean);
        return partes[partes.length - 1] || '';
      });
      const counts = {};
      apellidos.forEach((a) => {
        if (a) counts[a] = (counts[a] || 0) + 1;
      });
      const apellidoComun = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'Sin apellido';

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
 * FUNCIÓN 2: Para el grafo de fuerza (ClanesGraphView)
 */
export function buildGlobalGraph(members) {
  const personNodes = registrarPersonas(members);

  const nodes = [];
  const edges = [];
  const edgeSet = new Set();

  personNodes.forEach((p) => {
    // Cluster para colorear
    p.cluster = p.connections.length === 0
      ? 'solo'
      : p.connections.some((c) => c.tipo === 'familia')
        ? 'familia'
        : 'amigos';

    nodes.push({ ...p });

    p.connections.forEach((c) => {
      const edgeId = [p.id, c.target].sort().join('---');
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({
          source: p.id,
          target: c.target,
          tipo: c.tipo,
          peso: c.peso,
          derivada: !!c.derivada,
        });
      }
    });
  });

  return { nodes, edges };
}