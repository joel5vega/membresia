import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';

const clases = [
  'Sociedad de Caballeros "Emanuel"',
  'Sociedad de Señoras "Shaddai"',
  'Sociedad de Matrimonios jóvenes "Ebenezer"',
  'Sociedad de Jóvenes "Soldados de la Fe"',
  'Sociedad de prejuveniles "Vencedores"',
  'Clase de Exploradores',
  'Clase de Estrellitas',
  'Clase de joyitas',
  'Avanzada'
];


const MembersListView = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setMembers([]);
      setLoading(false);
      setError('Debe iniciar sesión para ver los miembros.');
      return;
    }

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await memberService.getMembers();
        setMembers(data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los miembros');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, authLoading]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.celular?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || member.clase === filterClass;
    return matchesSearch && matchesClass;
  });
  if (authLoading) {
    return <p>Cargando autenticación...</p>;
  }

  if (!user) {
    return <p style={{ color: 'red' }}>Debe iniciar sesión para ver los miembros.</p>;
  }
  return (
    <div style={{ padding: '20px' }}>
      <h1>Listado de Miembros</h1>
      <div>
          <span style={{ marginRight: 10 }}>{user.email}</span>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
     
      {/* Barra de búsqueda */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Buscar miembros por nombre o email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: 1
          }}
        />
                </div>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            minWidth: '150px'
          }}
        >
          <option value="all">Todas las clases</option>
            {clases.map((clase) => (
              <option key={clase} value={clase}>
                {clase}
              </option>
                        ))
                      }
        </select>
      </div>

      {/* Contenido */}
      {loading ? (
        <p>Cargando miembros...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : filteredMembers.length === 0 ? (
        <p>No hay miembros que coincidan con los filtros</p>
      ) : (
        <div>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            Total: {filteredMembers.length} miembro(s)
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#1e3a8a' }}>
{`${member.nombre || ''} ${member.apellido || ''}`.trim()}                </h3>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Teléfono:</strong> {member.celular || 'No registrado'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Clase:</strong> {member.clase || 'No asignada'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersListView;