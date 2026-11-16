import React, { useState } from 'react';
import { X, Search, Save, Trash2 } from 'lucide-react';
import { memberService } from '../../services/memberService';

const RELACIONES = [
  'Padre', 'Madre', 'Hermano', 'Hermana', 'Hijo', 'Hija', 
  'Abuelo', 'Abuela', 'Tío', 'Tía', 'Primo', 'Prima', 
  'Sobrino', 'Sobrina', 'Nieto', 'Nieta', 'Amigo', 'Amiga', 
  'Esposo', 'Esposa', 'Pareja', 'Ex-pareja'
];

const getInverseRelacion = (relacion) => {
  const map = {
    'Padre': 'Hijo', 'Madre': 'Hijo', 'Hijo': 'Padre', 'Hija': 'Padre',
    'Hermano': 'Hermano', 'Hermana': 'Hermana',
    'Abuelo': 'Nieto', 'Abuela': 'Nieto', 'Nieto': 'Abuelo', 'Nieta': 'Abuelo',
    'Tío': 'Sobrino', 'Tía': 'Sobrino', 'Sobrino': 'Tío', 'Sobrina': 'Tío',
    'Primo': 'Primo', 'Prima': 'Prima',
    'Amigo': 'Amigo', 'Amiga': 'Amiga',
    'Esposo': 'Esposa', 'Esposa': 'Esposo', 
    'Pareja': 'Pareja', 'Ex-pareja': 'Ex-pareja'
  };
  return map[relacion] || 'Familiar';
};

export default function RelationEditorModal({ editData, allMembers, onClose, onSave }) {
  // 🛡️ Validación para evitar crash si editData no tiene la estructura correcta
  if (!editData || !editData.source) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <p>Error: No se recibieron los datos del miembro correctamente.</p>
          <button onClick={onClose} style={{ marginTop: 12, padding: '8px 16px', background: '#A63232', color: '#fff', border: 'none', borderRadius: 8 }}>Cerrar</button>
        </div>
      </div>
    );
  }

  const isEdit = editData.type === 'edit';
  const [relacion, setRelacion] = useState(editData.relacion || 'Amigo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(isEdit ? editData.target : null);
  const [isCreatingNew, setIsCreatingNew] = useState(!isEdit);
  const [newMemberName, setNewMemberName] = useState(isEdit ? editData.target.nombre : '');
  const [loading, setLoading] = useState(false);

  const filteredMembers = allMembers.filter(m => {
    const fullName = m.nombreCompleto || `${m.nombre} ${m.apellido}`;
    return m.id !== editData.source.realId && fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSave = async () => {
    if (!isEdit && isCreatingNew && !newMemberName.trim()) return alert('Ingresa el nombre');
    if (!isEdit && !isCreatingNew && !selectedTarget) return alert('Selecciona un miembro');
    
    setLoading(true);
    try {
      let targetName = isCreatingNew ? newMemberName : (selectedTarget.nombreCompleto || `${selectedTarget.nombre} ${selectedTarget.apellido}`);
      
      const sourceData = await memberService.getMemberById(editData.source.realId);
      let newSourceGenograma = [...(sourceData.genograma || [])];

      if (isEdit) {
        const idx = newSourceGenograma.findIndex(f => f.nombre.toLowerCase().trim() === editData.target.nombre.toLowerCase().trim());
        if (idx !== -1) {
          newSourceGenograma[idx] = { ...newSourceGenograma[idx], relacion };
        }
      } else {
        newSourceGenograma.push({ nombre: targetName.trim(), relacion, edad: '', viveConElMiembro: false });
      }

      await memberService.updateMember(editData.source.realId, { genograma: newSourceGenograma });

      // Bidireccionalidad
      if (!isCreatingNew && selectedTarget && selectedTarget.id) {
        const targetData = await memberService.getMemberById(selectedTarget.id);
        let newTargetGenograma = [...(targetData.genograma || [])];
        
        const sourceName = sourceData.nombreCompleto || `${sourceData.nombre} ${sourceData.apellido}`;
        const inverseRelation = getInverseRelacion(relacion);
        const inverseIdx = newTargetGenograma.findIndex(f => f.nombre.toLowerCase().trim() === sourceName.toLowerCase().trim());

        if (inverseIdx !== -1) {
          newTargetGenograma[inverseIdx] = { ...newTargetGenograma[inverseIdx], relacion: inverseRelation };
        } else {
          newTargetGenograma.push({ nombre: sourceName, relacion: inverseRelation, edad: '', viveConElMiembro: false });
        }
        await memberService.updateMember(selectedTarget.id, { genograma: newTargetGenograma });
      }
      onSave();
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta relación?')) return;
    setLoading(true);
    try {
      const sourceData = await memberService.getMemberById(editData.source.realId);
      const newSourceGenograma = (sourceData.genograma || []).filter(f => f.nombre.toLowerCase().trim() !== editData.target.nombre.toLowerCase().trim());
      await memberService.updateMember(editData.source.realId, { genograma: newSourceGenograma });

      if (editData.target.id && !editData.target.id.startsWith('ghost-')) {
        const targetData = await memberService.getMemberById(editData.target.id);
        const sourceName = sourceData.nombreCompleto || `${sourceData.nombre} ${sourceData.apellido}`;
        const newTargetGenograma = (targetData.genograma || []).filter(f => f.nombre.toLowerCase().trim() !== sourceName.toLowerCase().trim());
        await memberService.updateMember(editData.target.id, { genograma: newTargetGenograma });
      }
      onSave();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 450, display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#A63232' }}>
            {isEdit ? 'Editar Relación' : `Nueva Relación para ${editData.source.nombre}`}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
        </div>

        {isEdit && (
          <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 14 }}>
            <strong>Editando:</strong> {editData.target.nombre}
          </div>
        )}

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568' }}>Tipo de Relación</label>
          <select value={relacion} onChange={(e) => setRelacion(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}>
            {RELACIONES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {!isEdit && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setIsCreatingNew(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: !isCreatingNew ? '#A63232' : '#f1f5f9', color: !isCreatingNew ? '#fff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>Elegir existente</button>
              <button onClick={() => setIsCreatingNew(true)} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: isCreatingNew ? '#A63232' : '#f1f5f9', color: isCreatingNew ? '#fff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>Crear nuevo</button>
            </div>
            {isCreatingNew ? (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568' }}>Nombre del nuevo familiar</label>
                <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }} />
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Search size={18} style={{ position: 'absolute', left: 10, top: 12, color: '#94a3b8' }} />
                  <input type="text" placeholder="Buscar miembro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #edf2f7', borderRadius: 8 }}>
                  {filteredMembers.map(m => (
                    <div key={m.id} onClick={() => setSelectedTarget(m)} style={{ padding: 12, borderBottom: '1px solid #edf2f7', cursor: 'pointer', background: selectedTarget?.id === m.id ? '#fee2e2' : 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: m.sexo === 'F' ? '#ec4899' : '#3b82f6' }} />
                      <span style={{ fontSize: 14 }}>{m.nombreCompleto || `${m.nombre} ${m.apellido}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: 14, background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? 'Guardando...' : <><Save size={18} /> Guardar</>}
          </button>
          {isEdit && (
            <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: 14, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Trash2 size={18} /> Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}