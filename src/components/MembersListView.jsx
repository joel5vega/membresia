import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const MembersListView = ({ onAddMember }) => {
  const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
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

  // Fixed: Removed duplicate filteredMembers declaration
  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.trim().toLowerCase();
    const matchesSearch = !searchLower || 
      (member.nombreCompleto?.toLowerCase().includes(searchLower) || 
       member.celular?.toLowerCase().includes(searchLower) ||
       member.correo?.toLowerCase().includes(searchLower));
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
    <div style={{ padding: '20px', position: 'relative' }}>
      {/* Botón fijo con + para nuevo miembro */}
      <button
        onClick={onAddMember}
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: '#1e40af',
          color: 'white',
          fontSize: '24px',
          lineHeight: '24px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        aria-label="Nuevo miembro"
        title="Nuevo miembro"
      >
        +
      </button>

      <h1>Listado de Miembros</h1>

      {/* Barra de búsqueda */}
      <div
        style={{
          marginBottom: '20px',
          marginTop: '10px',
          display: 'flex',
          gap: '10px'
        }}
      >
        <input
          type="text"
          placeholder="Buscar miembros por nombre o email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            fontSize: '1rem',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: 1
          }}
        />
      </div>

      {/* Filtro por clase */}
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
          ))}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px'
            }}
          >
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
                <h3
                  style={{
                    margin: '0 0 10px 0',
                    color: '#1e3a8a'
                  }}
                >
                 {member.nombreCompleto ||
   `${member.nombre || ''} ${member.apellido || ''}`.trim() ||
   'Sin nombre'}
                </h3>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Teléfono:</strong> {member.celular || 'No registrado'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                  <strong>Clase:</strong> {member.clase || 'No asignada'}
                </p>
                                <button
                  onClick={() => navigate(`/members/${member.id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  title="Editar miembro"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersListView;