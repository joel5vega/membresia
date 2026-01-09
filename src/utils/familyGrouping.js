export function buildFamilyGroups(members) {
  const visited = new Set();
  const families = [];
  
  members.forEach(member => {
    if (visited.has(member.id)) return;
    
    const family = new Set();
    const queue = [member.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      family.add(currentId);
      
      const currentMember = members.find(m => m.id === currentId);
      if (currentMember?.genograma) {
        currentMember.genograma.forEach(rel => {
          if (rel.miembroId && !visited.has(rel.miembroId)) {
            queue.push(rel.miembroId);
          }
        });
      }
    }
    
    if (family.size > 0) {
      families.push({
        id: `family-${families.length}`,
        members: Array.from(family),
        size: family.size
      });
    }
  });
  
  return families;
}

export function buildGenogramData(familyMembers, allMembers) {
    // Validate inputs to prevent errors
  if (!familyMembers || !Array.isArray(familyMembers)) {
    return { nodes: [], edges: [] };
  }
  if (!allMembers || !Array.isArray(allMembers)) {
    return { nodes: [], edges: [] };
  }
  const nodes = [];
  const edges = [];
  
  familyMembers.forEach(memberId => {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    
    nodes.push({
      id: member.id,
      data: {
        label: member.nombre + ' ' + member.apellido,
        sexo: member.sexo,
        estadoCivil: member.estadoCivil,
        edad: calculateAge(member.fechaNacimiento),
        photoUrl: member.photoUrl
      },
      position: { x: 0, y: 0 },
      type: member.sexo === 'M' ? 'maleNode' : 'femaleNode'
    });
    
    if (member.genograma) {
      member.genograma.forEach(rel => {
        edges.push({
          id: `${member.id}-${rel.miembroId}`,
          source: member.id,
          target: rel.miembroId,
          type: getEdgeType(rel.relacion),
          label: rel.relacion,
          animated: rel.viveConElMiembro
        });
      });
    }
  });
  
  return { nodes, edges };
}

function getEdgeType(relacion) {
  const matrimoniales = ['esposo', 'esposa', 'pareja'];
  const parentales = ['padre', 'madre', 'hijo', 'hija'];
  
  if (matrimoniales.includes(relacion.toLowerCase())) return 'marriage';
  if (parentales.includes(relacion.toLowerCase())) return 'parent';
  return 'sibling';
}

function calculateAge(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const birth = new Date(fechaNacimiento);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}