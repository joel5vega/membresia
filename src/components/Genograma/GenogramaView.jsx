// components/Genograma/GenogramaView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { memberService } from '../../services/memberService';
import { memberToGenograma } from '../../genograma/adapter';
import { buildStats } from '../../genograma/stats';
import GenogramaCanvas from './GenogramaCanvas';
import GenogramaLegend from './GenogramaLegend';

export default function GenogramaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [genograma, setGenograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    memberService.getMemberById(id)
      .then(data => {
        setMember(data);
        setGenograma(memberToGenograma(data));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando genograma...</div>;
  }

  if (!member || !genograma) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Miembro no encontrado</div>;
  }

  const stats = buildStats(genograma.nodes);
  const sinFamilia = genograma.nodes.length <= 1;

  return (
    <div style={{ padding: 16, minHeight: '100vh', background: '#F9F7F5' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}
        >
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, color: '#A63232' }}>
            Genograma — {genograma.memberName}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#718096' }}>
            {stats.totalFamiliares} familiares · {stats.generacionesCubiertas} generaciones
          </p>
        </div>
      </div>

      {sinFamilia ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          color: '#718096',
        }}>
          <Info size={48} style={{ marginBottom: 12 }} />
          <p>Este miembro aún no tiene familiares cargados en su genograma.</p>
          <button
            onClick={() => navigate(`/members/${id}/edit`)}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: '#A63232',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Agregar familiares
          </button>
        </div>
      ) : (
        <>
          {/* Canvas */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 8, marginBottom: 16 }}>
            <GenogramaCanvas
              nodes={genograma.nodes}
              edges={genograma.edges}
              onNodeClick={setSelectedNode}
            />
          </div>

          {/* Leyenda */}
          <GenogramaLegend />

          {/* Detalle del nodo seleccionado */}
          {selectedNode && !selectedNode.esRaiz && (
            <div style={{
              marginTop: 16,
              background: '#fff',
              padding: 16,
              borderRadius: 12,
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                {selectedNode.nombre}
              </h3>
              <p style={{ margin: 4, fontSize: 14 }}>
                <strong>Relación:</strong> {selectedNode.relacion}
              </p>
              {selectedNode.edad && (
                <p style={{ margin: 4, fontSize: 14 }}>
                  <strong>Edad:</strong> {selectedNode.edad}
                </p>
              )}
              <p style={{ margin: 4, fontSize: 14 }}>
                <strong>Vive con el miembro:</strong> {selectedNode.viveConElMiembro ? 'Sí' : 'No'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}