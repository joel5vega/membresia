// src/genograma/globalBuilder.js

const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Agrupa a TODA la iglesia en Clanes Familiares.
 * Busca coincidencias entre el nombre de un miembro y los familiares anotados
 * en el genograma de otros miembros.
 */
export function buildGlobalGraph(members) {
  const personNodes = new Map(); // key: nombre_normalizado, value: { ...datos }
  
  // 1. Registrar a todos los miembros reales de la iglesia
  members.forEach(m => {
    const nombreCompleto = m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();
    if (!nombreCompleto) return;
    
    const key = norm(nombreCompleto);
    personNodes.set(key, {
      id: m.id,
      nombre: nombreCompleto,
      sexo: m.sexo,
      photoUrl: m.photoUrl || null,
      esMiembroIglesia: true,
      familiares: [] // guardará las keys de sus familiares
    });
  });

  // 2. Cruzar la información de los genogramas
  members.forEach(m => {
    const nombreMiembro = m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`.trim();
    const keyMiembro = norm(nombreMiembro);
    
    const genograma = Array.isArray(m.genograma) ? m.genograma : [];
    
    genograma.forEach(fam => {
      const nombreFam = (fam.nombre || '').trim();
      if (!nombreFam) return;
      
      const keyFam = norm(nombreFam);
      
      // Si el familiar no está registrado como miembro, lo creamos "fantasma"
      if (!personNodes.has(keyFam)) {
        personNodes.set(keyFam, {
          id: `ghost-${keyFam.replace(/\s+/g, '-')}`,
          nombre: nombreFam,
          sexo: (fam.relacion || '').toLowerCase().includes('a') && !(fam.relacion || '').toLowerCase().includes('o') ? 'F' : 'M',
          photoUrl: null,
          esMiembroIglesia: false,
          familiares: []
        });
      }
      
      // Conectar bidireccionalmente
      const miembroData = personNodes.get(keyMiembro);
      const familiarData = personNodes.get(keyFam);
      
      if (miembroData && familiarData) {
        miembroData.familiares.push(keyFam);
        familiarData.familiares.push(keyMiembro);
      }
    });
  });

  // 3. Agrupar en Clanes (Componentes Conexos)
  const nodes = [...personNodes.values()];
  const visitados = new Set();
  const clanes = [];

  nodes.forEach(node => {
    if (visitados.has(node.id)) return;
    
    // BFS para encontrar a toda la familia conectada
    const clan = [];
    const queue = [node.id];
    visitados.add(node.id);
    
    while (queue.length > 0) {
      const currId = queue.shift();
      const currData = nodes.find(n => n.id === currId);
      if (!currData) continue;
      
      clan.push(currData);
      
      currData.familiares.forEach(famKey => {
        const famData = personNodes.get(famKey);
        if (famData && !visitados.has(famData.id)) {
          visitados.add(famData.id);
          queue.push(famData.id);
        }
      });
    }
    
    // Solo guardamos clanes de 2 o más personas
    if (clan.length > 1) {
      // El "apellido" del clan será el apellido más común
      const apellidos = clan.map(p => p.nombre.split(' ').slice(-1)[0]);
      const counts = {};
      apellidos.forEach(a => counts[a] = (counts[a] || 0) + 1);
      const apellidoComun = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0] || 'Familia';
      
      clanes.push({
        id: `clan-${clan.length}-${clan[0].id}`,
        nombre: `Familia ${apellidoComun}`,
        miembros: clan,
        totalMiembrosIglesia: clan.filter(m => m.esMiembroIglesia).length
      });
    }
  });

  // Ordenar clanes por tamaño
  clanes.sort((a, b) => b.miembros.length - a.miembros.length);

  return { clanes, totalPersonas: nodes.length };
}