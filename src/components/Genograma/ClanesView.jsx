// src/components/Genograma/ClanesView.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User as UserIcon, ArrowLeft, X } from 'lucide-react';
import { memberService } from '../../services/memberService';
import { buildClanes } from '../../genograma/globalBuilder';

export default function ClanesView() {
  const navigate = useNavigate();
  const [clanes, setClanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clanSeleccionado, setClanSeleccionado] = useState(null);

 useEffect(() => {
  memberService.getMembers()
    .then((data) => {
      const { clanes } = buildClanes(data);   // ← cambia el nombre
      setClanes(clanes);
    })
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
}, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Analizando lazos familiares...</div>;

  return (
    <div style={{ padding: 16, minHeight: '100vh', background: '#F9F7F5' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#A63232' }}>Red de Familias</h1>
          <button 
  onClick={() => navigate('/constelacion')}
  style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
>
  Ver Constelación
</button>
          <p style={{ margin: 0, fontSize: 14, color: '#718096' }}>
            {clanes.length} clanes familiares detectados en la iglesia
          </p>
        </div>
      </div>

      {/* Grid de Clanes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: 16 
      }}>
        {clanes.map(clan => (
          <div 
            key={clan.id}
            onClick={() => setClanSeleccionado(clan)}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #edf2f7',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ background: '#fee2e2', padding: 8, borderRadius: '50%', color: '#A63232' }}>
                <Users size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: 16, color: '#2D3748' }}>{clan.nombre}</h3>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, background: '#f7fafc', padding: 10, borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: '#2D3748' }}>
                  {clan.miembros.length}
                </span>
                <span style={{ fontSize: 12, color: '#718096' }}>Personas</span>
              </div>
              <div style={{ flex: 1, background: '#f7fafc', padding: 10, borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: '#A63232' }}>
                  {clan.totalMiembrosIglesia}
                </span>
                <span style={{ fontSize: 12, color: '#718096' }}>En la iglesia</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Clan Seleccionado */}
      {clanSeleccionado && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 500, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header del modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, color: '#A63232', fontSize: 20 }}>{clanSeleccionado.nombre}</h2>
              <button onClick={() => setClanSeleccionado(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096' }}>
                <X size={24} />
              </button>
            </div>

            {/* Lista de miembros */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {clanSeleccionado.miembros.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f7fafc', borderRadius: 8, border: '1px solid #edf2f7' }}>
                  
                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.sexo === 'F' ? '#ec4899' : m.sexo === 'M' ? '#3b82f6' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {m.photoUrl ? <img src={m.photoUrl} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={20} color="#fff" />}
                  </div>
                  
                  {/* Datos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2D3748', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.nombre}
                    </div>
                    <div style={{ fontSize: 12, color: m.esMiembroIglesia ? '#10b981' : '#718096', fontWeight: m.esMiembroIglesia ? 500 : 400 }}>
                      {m.esMiembroIglesia ? 'Miembro registrado' : 'Familiar externo'}
                    </div>
                  </div>
                  
                  {/* Botón */}
                  {m.esMiembroIglesia && (
                    <button 
                      onClick={() => navigate(`/members/${m.id}/genograma`)}
                      style={{ background: '#A63232', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Ver árbol
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setClanSeleccionado(null)}
              style={{ width: '100%', padding: 12, marginTop: 16, background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}