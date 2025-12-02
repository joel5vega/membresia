import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { CLASSES } from '../constants/classes';

export const MembersListView = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'members'));
        const snapshot = await getDocs(q);
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    let filtered = members;

    // Filter by class if selected
    if (selectedClass) {
      filtered = filtered.filter(member => member.clase === selectedClass);
    }

    // Filter by search term (nombre or apellido)
    if (searchTerm) {
      filtered = filtered.filter(member =>
        `${member.nombre} ${member.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [members, selectedClass, searchTerm]);

  if (loading) return <div className="loading">Cargando miembros...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="members-list-view">
      <h1>Listado de Miembros</h1>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="search">Buscar por nombre:</label>
          <input
            id="search"
            type="text"
            placeholder="Ingrese nombre o apellido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="class-filter">Filtrar por clase:</label>
          <select
            id="class-filter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="class-filter"
          >
            <option value="">-- Todas las clases --</option>
            {CLASSES.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="members-info">
        <p>Total de miembros: <strong>{filteredMembers.length}</strong></p>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="no-members">
          <p>No se encontraron miembros</p>
        </div>
      ) : (
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Clase</th>
                <th>Celular</th>
                <th>Zona</th>
                <th>Profesión</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>
                      {member.nombre} {member.apellido}
                    </strong>
                  </td>
                  <td>{member.clase || '-'}</td>
                  <td>{member.celular || '-'}</td>
                  <td>{member.zona || '-'}</td>
                  <td>{member.profesion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
