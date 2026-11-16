import React, { useState } from 'react';
import { X, Search, Save, Trash2 } from 'lucide-react';
import { memberService } from '../../services/memberService';
import {
  RELACIONES, fullName, getInverseRelacion, upsertRelacion, removeRelacion,
} from '../../genograma/relationUtils';

// Estilos explícitos: los globales (index.css) pintan inputs/labels para tema oscuro
const field = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1',
  marginTop: 4, background: '#fff', color: '#1e293b', boxSizing: 'border-box' };
const lbl = { fontSize: 13, fontWeight: 600, color: '#4a5568' };
const btn = (bg) => ({ flex: 1, padding: 14, background: bg, color: '#fff', border: 'none',
  borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 8 });

export default function RelationEditorModal({ editData, allMembers, onClose, onSave }) {
  // Todos los hooks ANTES de cualquier return
  const isEdit = editData?.type === 'edit';
  const [relacion, setRelacion] = useState(editData?.relacion || 'Amigo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(!isEdit);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!editData?.source) {
    return (
      <div style={overlay}>
        <div style={{ ...card, textAlign: 'center' }}>
          <p style={{ color: '#1e293b' }}>No se recibieron los datos del miembro.</p>
          <button onClick={onClose} style={{ ...btn('#A63232'), marginTop: 12 }}>Cerrar</button>
        </div>
      </div>
    );
  }

  const sourceId = editData.source.realId;

  // ID real (Firestore) del otro extremo; null si es un familiar externo
  const targetRealId = isEdit
    ? editData.target?.realId || null
    : isCreatingNew ? null : selectedTarget?.id || null;

  const targetName = isEdit
    ? editData.target.nombre
    : isCreatingNew ? newMemberName : fullName(selectedTarget);

  const filteredMembers = allMembers.filter(
    (m) => m.id !== sourceId && fullName(m).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!targetName?.trim()) return alert(isCreatingNew ? 'Ingresa el nombre' : 'Selecciona un miembro');
    setLoading(true);
    try {
      const source = await memberService.getMemberById(sourceId);
      await memberService.updateMember(sourceId, {
        genograma: upsertRelacion(source.genograma, targetName, relacion),
      });

      // Lado inverso: solo si el otro extremo es miembro registrado
      if (targetRealId) {
        const target = await memberService.getMember(targetRealId); // null si no existe
        if (target) {
          await memberService.updateMember(targetRealId, {
            genograma: upsertRelacion(
              target.genograma, fullName(source), getInverseRelacion(relacion, source.sexo)),
          });
        }
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta relación?')) return;
    setLoading(true);
    try {
      const source = await memberService.getMemberById(sourceId);
      await memberService.updateMember(sourceId, {
        genograma: removeRelacion(source.genograma, targetName),
      });
      if (targetRealId) {
        const target = await memberService.getMember(targetRealId);
        if (target) {
          await memberService.updateMember(targetRealId, {
            genograma: removeRelacion(target.genograma, fullName(source)),
          });
        }
      }
      onSave();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#A63232' }}>
            {isEdit ? 'Editar Relación' : `Nueva Relación para ${editData.source.nombre}`}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none' }}>
            <X size={20} color="#475569" />
          </button>
        </div>

        {isEdit && (
          <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 14, color: '#1e293b' }}>
            <strong style={{ color: '#1e293b' }}>Editando:</strong>{' '}
            <span style={{ color: '#1e293b' }}>{editData.target.nombre}</span>
          </div>
        )}

        <div>
          <label style={lbl}>Tipo de Relación</label>
          <select value={relacion} onChange={(e) => setRelacion(e.target.value)} style={field}>
            {RELACIONES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {!isEdit && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['Elegir existente', false], ['Crear nuevo', true]].map(([text, val]) => (
                <button key={text} onClick={() => setIsCreatingNew(val)}
                  style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', fontWeight: 600,
                    background: isCreatingNew === val ? '#A63232' : '#f1f5f9',
                    color: isCreatingNew === val ? '#fff' : '#475569' }}>
                  {text}
                </button>
              ))}
            </div>

            {isCreatingNew ? (
              <div>
                <label style={lbl}>Nombre del nuevo familiar</label>
                <input type="text" value={newMemberName} placeholder="Ej. Juan Pérez"
                  onChange={(e) => setNewMemberName(e.target.value)} style={field} />
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Search size={18} style={{ position: 'absolute', left: 10, top: 14, color: '#94a3b8' }} />
                  <input type="text" placeholder="Buscar miembro..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...field, marginTop: 0, paddingLeft: 36 }} />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #edf2f7', borderRadius: 8 }}>
                  {filteredMembers.map((m) => (
                    <div key={m.id} onClick={() => setSelectedTarget(m)}
                      style={{ padding: 12, borderBottom: '1px solid #edf2f7', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: selectedTarget?.id === m.id ? '#fee2e2' : 'transparent' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%',
                        background: m.sexo === 'F' ? '#ec4899' : '#3b82f6' }} />
                      <span style={{ fontSize: 14, color: '#1e293b' }}>{fullName(m)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={loading} style={btn('#10b981')}>
            {loading ? 'Guardando...' : <><Save size={18} /> Guardar</>}
          </button>
          {isEdit && (
            <button onClick={handleDelete} disabled={loading} style={btn('#ef4444')}>
              <Trash2 size={18} /> Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const card = { background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 450,
  display: 'flex', flexDirection: 'column', gap: 16 };