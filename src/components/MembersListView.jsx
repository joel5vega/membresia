import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Phone, Cake, User, ImageOff } from 'lucide-react';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import './MembersListView.css';

const clases = [
  'Sociedad de Caballeros "Emanuel"', 'Sociedad de Señoras "Shaddai"',
  'Sociedad de Matrimonios jóvenes "Ebenezer"', 'Sociedad de Jóvenes "Soldados de la Fe"',
  'Sociedad de prejuveniles "Vencedores"', 'Clase de Exploradores',
  'Clase de Estrellitas', 'Clase de joyitas', 'Av. Jireh', 'Av. Luz del evangelio', 'Inactive'
];

// ─────────────────────────────────────────────
// Sub-componente: Avatar con fallback
// ─────────────────────────────────────────────
const MemberAvatar = ({ member, size = 56 }) => {
  const [imgError, setImgError] = useState(false);

  const photoUrl =
    member.photoUrl || member.photoURL || member.foto || member.avatar || null;
  const hasPhoto = !!photoUrl && !imgError;

  if (hasPhoto) {
    return (
      <div className="avatar" style={{ width: size, height: size }}>
        <img
          src={photoUrl}
          alt={member.nombreCompleto || 'Miembro'}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const nombre =
    member.nombreCompleto ||
    `${member.nombre || ''} ${member.apellido || ''}`.trim();

  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  const colorBySexo =
    member.sexo === 'M'
      ? '#3b82f6'
      : member.sexo === 'F'
        ? '#ec4899'
        : '#6b7280';

  if (!iniciales) {
    return (
      <div
        className="avatar"
        style={{ width: size, height: size, backgroundColor: colorBySexo }}
      >
        <User size={size * 0.45} color="white" />
      </div>
    );
  }

  return (
    <div
      className="avatar avatar-initials"
      style={{ width: size, height: size, backgroundColor: colorBySexo }}
      aria-label={nombre}
    >
      {iniciales}
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
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

  const filteredMembers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return members.filter(m => {
      const nombre = (
        m.nombreCompleto ||
        `${m.nombre || ''} ${m.apellido || ''}`
      ).toLowerCase();
      const matchSearch =
        !search ||
        nombre.includes(search) ||
        (m.celular || '').includes(search);
      const matchClass = filterClass === 'all' || m.clase === filterClass;
      return matchSearch && matchClass;
    });
  }, [members, searchTerm, filterClass]);

  if (loading) {
    return <div className="loading-spinner">Cargando congregación...</div>;
  }

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
          >
            Todas
          </button>
          {clases.map(c => (
            <button
              key={c}
              className={`chip ${filterClass === c ? 'active' : ''}`}
              onClick={() => setFilterClass(c)}
            >
              {c.split('"')[1] || c}
            </button>
          ))}
        </div>
      </div>

      <div className="results-counter">
        {filteredMembers.length} miembro
        {filteredMembers.length !== 1 ? 's' : ''}
        {filterClass !== 'all' &&
          ` en ${filterClass.split('"')[1] || filterClass}`}
      </div>

      <div className="members-grid">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div key={member.id} className="member-card">
              <div className="card-top">
                <MemberAvatar member={member} size={56} />

                <div className="main-info">
                  <h3
                    title={
                      member.nombreCompleto ||
                      `${member.nombre} ${member.apellido}`
                    }
                  >
                    {member.nombreCompleto ||
                      `${member.nombre} ${member.apellido}`}
                  </h3>
                  <span className="class-label">
                    {member.clase || 'Sin Clase'}
                  </span>
                </div>

                <button
                  className="edit-mini-btn"
                  onClick={() => navigate(`/members/${member.id}/edit`)}
                  aria-label="Editar miembro"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <Phone size={14} />
                  <span>{member.celular || '---'}</span>
                </div>
                <div className="detail-item">
                  <Cake size={14} />
                  <span>{member.fechaNacimiento || '---'}</span>
                </div>
<button
  onClick={() => navigate(`/members/${member.id}/genograma`)}
  className="genograma-btn"
  title="Ver genograma familiar"
>
  🌳
</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-msg">
            <ImageOff size={48} />
            <p>No se encontraron miembros.</p>
            {(searchTerm || filterClass !== 'all') && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilterClass('all');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <button
        className="fab-button"
        onClick={onAddMember}
        aria-label="Agregar miembro"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default MembersListView;