import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';

const MembersListView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await memberService.getMembers();
        setMembers(data || []);
        setError(null);
      } catch (err) {
        setError('Error al cargar los miembros');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || member.class === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Listado de Miembros</h1>
      
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
          <option value="ninos">Niños</option>
          <option value="adolescentes">Adolescentes</option>
          <option value="adultos">Adultos</option>
          <option value="mayores">Mayores</option>
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
                  {member.name}
                </h3>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Email:</strong> {member.email}
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Teléfono:</strong> {member.phone || 'No registrado'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Clase:</strong> {member.class || 'No asignada'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Estado:</strong> {member.status === 'active' ? '✅ Activo' : '❌ Inactivo'}
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