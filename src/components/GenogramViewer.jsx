import React, { useState, useEffect } from 'react';
import { genogramService } from '../services/genogramService';
import './GenogramViewer.css';

const GenogramViewer = ({ churchId, familyId }) => {
  const [familyTree, setFamilyTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    loadFamilyTree();
  }, [churchId, familyId]);

  const loadFamilyTree = async () => {
    try {
      setLoading(true);
      const tree = await genogramService.getFamilyTree(churchId, familyId);
      setFamilyTree(tree);
      setError(null);
    } catch (err) {
      console.error('Error loading family tree:', err);
      setError('Error al cargar el árbol familiar');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  if (loading) {
    return (
      <div className="genogram-container">
        <div className="loading">Cargando árbol familiar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genogram-container">
        <div className="error">{error}</div>
        <button onClick={loadFamilyTree} className="btn-retry">Reintentar</button>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="genogram-container">
        <div className="empty">No hay datos de árbol familiar disponibles</div>
      </div>
    );
  }

  return (
    <div className="genogram-container">
      <div className="genogram-header">
        <h2>Genograma Familiar</h2>
        <div className="genogram-controls">
          <button onClick={handleZoomOut} className="btn-control" title="Zoom out">
            −
          </button>
          <span className="zoom-level">{(zoomLevel * 100).toFixed(0)}%</span>
          <button onClick={handleZoomIn} className="btn-control" title="Zoom in">
            +
          </button>
          <button onClick={handleResetZoom} className="btn-control" title="Reset zoom">
            Restablecer
          </button>
        </div>
      </div>

      <div className="genogram-content">
        <svg 
          className="genogram-svg" 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          {renderGenogram(familyTree, selectedMember, setSelectedMember)}
        </svg>
      </div>

      {selectedMember && (
        <div className="member-details">
          <div className="details-header">
            <h3>{selectedMember.nombre} {selectedMember.apellido}</h3>
            <button onClick={() => setSelectedMember(null)} className="btn-close">
              ×
            </button>
          </div>
          <div className="details-content">
            <p><strong>Género:</strong> {selectedMember.genero}</p>
            {selectedMember.fechaNacimiento && (
              <p><strong>Fecha de Nacimiento:</strong> {selectedMember.fechaNacimiento}</p>
            )}
            {selectedMember.role && (
              <p><strong>Rol:</strong> {selectedMember.role}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const renderGenogram = (tree, selectedMember, setSelectedMember) => {
  if (!tree || !tree.all) return null;

  const persons = tree.all;
  const nodeWidth = 120;
  const nodeHeight = 60;
  const horizontalSpacing = 180;
  const verticalSpacing = 150;

  // Calcular posiciones
  const positions = {};
  let maxX = 0,maxY = 0;

  persons.forEach((person, index) => {
    const generation = calculateGeneration(person, tree);
    const x = (index % 4) * horizontalSpacing + 50;
    const y = generation * verticalSpacing + 50;
    positions[person.id] = { x, y };
    maxX = Math.max(maxX, x + nodeWidth);
    maxY = Math.max(maxY, y + nodeHeight);
  });

  return (
    <>
      <rect width={maxX + 50} height={maxY + 50} fill="white" />
      
      {/* Dibuja líneas de relación */}
      {tree.spouse && tree.spouse.map((spousal, idx) => {
        const person1 = positions[spousal[0]];
        const person2 = positions[spousal[1]];
        if (!person1 || !person2) return null;
        
        return (
          <line
            key={`spouse-${idx}`}
            x1={person1.x + nodeWidth / 2}
            y1={person1.y + nodeHeight}
            x2={person2.x + nodeWidth / 2}
            y2={person2.y + nodeHeight}
            stroke="#e91e63"
            strokeWidth="2"
          />
        );
      })}

      {/* Dibuja nodos de personas */}
      {persons.map(person => {
        const pos = positions[person.id];
        if (!pos) return null;

        const isSelected = selectedMember?.id === person.id;
        const isMale = person.genero === 'Masculino' || person.genero === 'M';
        
        return (
          <g
            key={person.id}
            className="genogram-node"
            onClick={() => setSelectedMember(person)}
            style={{ cursor: 'pointer' }}
          >
            {/* Forma (cuadrado para hombre, círculo para mujer) */}
            {isMale ? (
              <rect
                x={pos.x}
                y={pos.y}
                width={nodeWidth}
                height={nodeHeight}
                fill={isSelected ? '#1976d2' : '#90caf9'}
                stroke={isSelected ? '#0d47a1' : '#1976d2'}
                strokeWidth="2"
                rx="4"
              />
            ) : (
              <circle
                cx={pos.x + nodeWidth / 2}
                cy={pos.y + nodeHeight / 2}
                r={nodeWidth / 2}
                fill={isSelected ? '#c2185b' : '#f48fb1'}
                stroke={isSelected ? '#880e4f' : '#c2185b'}
                strokeWidth="2"
              />
            )}

            {/* Nombre */}
            <text
              x={pos.x + nodeWidth / 2}
              y={pos.y + nodeHeight / 2 + 5}
              textAnchor="middle"
              fontSize="12"
              fill="white"
              fontWeight="bold"
              pointerEvents="none"
            >
              {person.nombre}
            </text>
          </g>
        );
      })}
    </>
  );
};

const calculateGeneration = (person, tree) => {
  // Lógica para calcular la generación de una persona
  // Por ahora retornamos 0, esto puede mejorarse
  return 0;
};

export default GenogramViewer;