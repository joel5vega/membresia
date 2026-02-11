import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Phone, Cake, User } from 'lucide-react';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import './MembersListView.css';

const clases = [
  'Sociedad de Caballeros "Emanuel"', 'Sociedad de Señoras "Shaddai"',
  'Sociedad de Matrimonios jóvenes "Ebenezer"', 'Sociedad de Jóvenes "Soldados de la Fe"',
  'Sociedad de prejuveniles "Vencedores"', 'Clase de Exploradores',
  'Clase de Estrellitas', 'Clase de joyitas', 'Av. Jireh', 'Av. Luz del evangelio','Inactive'
];

// Definimos el componente con el mismo nombre que exportaremos
const MembersListView = ({ onAddMember }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    if (!authLoading && user) fetchMembers();
  }, [user, authLoading]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data || []);
    } catch (err) { 
      console.error('Error fetching members:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredMembers = members.filter(m => {
    const search = searchTerm.toLowerCase();
    const nombre = m.nombreCompleto || `${m.nombre || ''} ${m.apellido || ''}`;
    return (nombre.toLowerCase().includes(search) || m.celular?.includes(search)) &&
           (filterClass === 'all' || m.clase === filterClass);
  });

  const getAvatarInfo = (m) => {
    if (m.sexo === 'M') return { icon: '👨', color: '#3b82f6' };
    if (m.sexo === 'F') return { icon: '👩', color: '#ec4899' };
    return { icon: <User size={24} />, color: '#6b7280' };
  };

  if (loading) return <div className="loading-spinner">Cargando congregación...</div>;

  return (
    <div className="members-view-container">
      <div className="header-section">
        <h1>Directorio de Miembros</h1>
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button 
            className={`chip ${filterClass === 'all' ? 'active' : ''}`}
            onClick={() => setFilterClass('all')}
          >Todas</button>
          {clases.map(c => (
            <button 
              key={c} 
              className={`chip ${filterClass === c ? 'active' : ''}`}
              onClick={() => setFilterClass(c)}
            >{c.split('"')[1] || c}</button>
          ))}
        </div>
      </div>

      <div className="members-grid">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div key={member.id} className="member-card">
              <div className="card-top">
                <div className="avatar" style={{ backgroundColor: getAvatarInfo(member).color }}>
                  {member.photoUrl ? <img src={member.photoUrl} alt="profile" /> : getAvatarInfo(member).icon}
                </div>
                <div className="main-info">
                  <h3>{member.nombreCompleto || `${member.nombre} ${member.apellido}`}</h3>
                  <span className="class-label">{member.clase || 'Sin Clase'}</span>
                </div>
                <button className="edit-mini-btn" onClick={() => navigate(`/members/${member.id}/edit`)}>
                  <Edit2 size={16} />
                </button>
              </div>
              
              <div className="card-details">
                <div className="detail-item">
                  <Phone size={14} /> <span>{member.celular || '---'}</span>
                </div>
                <div className="detail-item">
                  <Cake size={14} /> <span>{member.fechaNacimiento || '---'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-msg">No se encontraron miembros.</div>
        )}
      </div>

      <button className="fab-button" onClick={onAddMember}>
        <Plus size={28} />
      </button>
    </div>
  );
};

export default MembersListView;
