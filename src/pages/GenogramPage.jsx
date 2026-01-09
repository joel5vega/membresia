import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GenogramViewer from '../components/GenogramViewer';
import { memberService, familyService } from '../services';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import './GenogramPage.css';

const GenogramPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const churchId = user?.churchId || user?.uid;
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [familyName, setFamilyName] = useState('');

  useEffect(() => {
    if (churchId) {
      loadMembersAndFamilies();
    }
  }, [churchId]);

  const loadMembersAndFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const membersList = await memberService.getMembers();
      setMembers(membersList || []);
      
      // Load families from Firestore
      try {
        const familiesRef = collection(db, 'families');
        const q = query(familiesRef, where('churchId', '==', churchId));
        const querySnapshot = await getDocs(q);
        const loadedFamilies = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFamilies(loadedFamilies);
      } catch (familiesError) {
        console.log('Families not yet created or loading families failed:', familiesError);
        setFamilies([]);
      }
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Error al cargar los miembros');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim() || selectedMembers.length === 0) {
      alert('Por favor ingresa un nombre de familia y selecciona al menos un miembro');
      return;
    }

    const newFamily = {
      id: Date.now().toString(),
      name: familyName,
      churchId,
      members: selectedMembers.map(id => {
        const member = members.find(m => m.id === id);
        return {
          id: member.id,
          nombre: member.nombre,
          apellido: member.apellido,
          genero: member.genero
        };
      })
    };

    try {
      // Save family to Firestore
      const savedFamily = await familyService.createFamily(
        churchId,
        familyName,
        selectedMembers[0], // Use first selected member as root person
        `Family with ${selectedMembers.length} members`
      );

      // Create local family object with Firestore ID
      const familyWithMembers = {
        ...newFamily,
        id: savedFamily.id,
      };

      setFamilies([...families, familyWithMembers]);
      setShowModal(false);
      setFamilyName('');
      setSelectedMembers([]);
      setSelectedFamilyId(familyWithMembers.id);
    } catch (error) {
      console.error('Error creating family:', error);
      alert('Error al crear la familia. Por favor intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="genogram-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando genogramas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genogram-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadMembersAndFamilies} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="genogram-page">
      <header className="page-header">
        <h1>Genogramas Familiares</h1>
        <p>Visualiza las relaciones familiares de tu iglesia</p>
      </header>

      <div className="content-wrapper">
        {families.length === 0 ? (
          <div className="empty-state">
            <p>No hay familias registradas en tu iglesia.</p>
            <p>Agrega miembros a través del formulario de miembros para crear genogramas.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              + Crear Primera Familia
            </button>
          </div>
        ) : (
          <>
            <aside className="sidebar">
              <div className="family-selector">
                <label htmlFor="family-select">Selecciona una familia:</label>
                <select
                  id="family-select"
                  value={selectedFamilyId || ''}
                  onChange={(e) => setSelectedFamilyId(e.target.value)}
                  className="select-input"
                >
                  <option value="">{families.length === 0 ? 'No hay familias' : 'Seleccionar...'}</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name} ({family.members?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="family-info">
                <h3>Información de la familia</h3>
                {selectedFamilyId && families.find(f => f.id === selectedFamilyId) && (
                  <div className="info-content">
                    <p>
                      <strong>Miembros:</strong> {families.find(f => f.id === selectedFamilyId)?.members?.length || 0}
                    </p>
                    <div className="members-list">
                      <h4>Integrantes:</h4>
                      <ul>
                        {families
                          .find(f => f.id === selectedFamilyId)?.members?.map((member) => (
                          <li key={member.id}>
                            {member.nombre} {member.apellido}
                            <span className="role">{member.genero}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <main className="main-content">
              {selectedFamilyId && churchId && (
                <GenogramViewer
                  churchId={churchId}
                  familyId={selectedFamilyId}
                  key={selectedFamilyId}
                />
              )}
            </main>
          </>
        )}
      </div>

      {/* Modal para crear familia */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nueva Familia</h2>
            <div className="form-group">
              <label htmlFor="family-name">Nombre de la Familia:</label>
              <input
                type="text"
                id="family-name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Ej: Familia García"
              />
            </div>

            <div className="form-group">
              <label>Selecciona Miembros ({selectedMembers.length}):</label>
              <div className="members-selection">
                {members.length === 0 ? (
                  <p>No hay miembros disponibles</p>
                ) : (
                  members.map((member) => (
                    <label key={member.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                      />
                      {member.nombre} {member.apellido}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={handleCreateFamily}
                className="btn-primary"
              >
                Crear Familia
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFamilyName('');
                  setSelectedMembers([]);
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenogramPage;