import React, { useState, useEffect } from 'react';
import { saveClassSummary, getClassSummary } from '../services/attendanceSummaryService';
import './Attendance.css';

// Mapa clase → uniqueClassId (mismo que en ClassesAndAttendance)
const CLASS_IDS = {
  'Sociedad de Caballeros "Emanuel"':           'caballeros-emanuel',
  'Sociedad de Señoras "Shaddai"':              'senoras-shaddai',
  'Sociedad de Matrimonios jóvenes "Ebenezer"': 'matrimonios-ebenezer',
  'Sociedad de Jóvenes "Soldados de la Fe"':    'SyMu34o00g7c2jawU7XG',
  'Sociedad de prejuveniles "Vencedores"':      'prejuveniles-vencedores',
  'Clase de Exploradores':                      'exploradores',
  'Clase de Estrellitas':                       'estrellitas',
  'Clase de joyitas':                           'joyitas',
  'Av. Jireh':                                  'av-jireh',
  'Av. Luz del evangelio':                      'av-luz',
  'Av. Elohim':                                 'av-elohim',
  'Av. Jesús es el camino':                     'av-jesus',
};

const EMPTY_FORM = {
  maestro:    '',
  varones:    0,
  mujeres:    0,
  visitantes: 0,
  tema:       '',
  ofrenda:    '',
  biblia:     0,
  anuncios:   '',
};

const TotalsAttendanceForm = ({ selectedClass, date }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [savedId, setSavedId] = useState(null); // null = nuevo, string = actualización
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const uniqueClassId = CLASS_IDS[selectedClass] || selectedClass;
  const total = Number(form.varones) + Number(form.mujeres) + Number(form.visitantes);

  // Cargar datos existentes cuando cambia clase o fecha
  useEffect(() => {
    if (!selectedClass || !date) return;

    const load = async () => {
      setLoading(true);
      setFeedback({ type: '', msg: '' });
      try {
        const existing = await getClassSummary(date, uniqueClassId);
        if (existing) {
          setForm({
            maestro:    existing.maestro    || '',
            varones:    existing.varones    ?? 0,
            mujeres:    existing.mujeres    ?? 0,
            visitantes: existing.visitantes ?? 0,
            tema:       existing.tema       || '',
            ofrenda:    existing.ofrenda    || '',
            biblia:     existing.biblia     ?? 0,
            anuncios:   existing.anuncios   || '',
          });
          setSavedId(existing.id);
        } else {
          setForm(EMPTY_FORM);
          setSavedId(null);
        }
      } catch (err) {
        console.error('Error cargando resumen:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedClass, date]);

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.maestro.trim()) {
      setFeedback({ type: 'error', msg: 'Por favor indica el nombre del maestro.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      const result = await saveClassSummary({
        ...form,
        clase: selectedClass,
        uniqueClassId,
        date,
      });

      setSavedId(result.id);
      setFeedback({
        type: 'success',
        msg: result.updated ? '✅ Resumen actualizado.' : '✅ Resumen guardado.',
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', msg: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section-card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Cargando datos existentes...
      </div>
    );
  }

  return (
    <div className="section-card">
      {/* Badge indicador: nuevo vs edición */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Resumen de Clase</h3>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          background: savedId ? 'rgba(25,107,45,0.1)' : 'rgba(133,25,29,0.08)',
          color: savedId ? '#196b2d' : '#85191d',
        }}>
          {savedId ? 'Editando registro' : 'Nuevo registro'}
        </span>
      </div>

      <div className="form-group">
        <label>Maestro / Líder *</label>
        <input
          className="form-control"
          type="text"
          placeholder="Nombre del maestro"
          value={form.maestro}
          onChange={set('maestro')}
        />
      </div>

      <div className="form-group">
        <label>Tema</label>
        <input
          className="form-control"
          type="text"
          placeholder="Ej: La Fe que mueve montañas"
          value={form.tema}
          onChange={set('tema')}
        />
      </div>

      {/* Asistencia numérica */}
      <div className="form-group">
        <label>Asistencia</label>
        <div className="grid-2" style={{ gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: '#584140' }}>Varones</label>
            <input
              className="form-control"
              type="number"
              min="0"
              value={form.varones}
              onChange={set('varones')}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: '#584140' }}>Mujeres</label>
            <input
              className="form-control"
              type="number"
              min="0"
              value={form.mujeres}
              onChange={set('mujeres')}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: '#584140' }}>Visitantes</label>
            <input
              className="form-control"
              type="number"
              min="0"
              value={form.visitantes}
              onChange={set('visitantes')}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: '#584140' }}>Biblias</label>
            <input
              className="form-control"
              type="number"
              min="0"
              value={form.biblia}
              onChange={set('biblia')}
            />
          </div>
        </div>

        {/* Total calculado */}
        <div style={{
          marginTop: '0.75rem',
          background: 'rgba(133,25,29,0.07)',
          color: '#85191d',
          borderRadius: '9999px',
          padding: '0.4rem 1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>groups</span>
          Total: {total}
        </div>
      </div>

      <div className="grid-2" style={{ gap: '0.75rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Ofrenda</label>
          <input
            className="form-control"
            type="text"
            placeholder="Bs. 0.00"
            value={form.ofrenda}
            onChange={set('ofrenda')}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Anuncios / Notas</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Actividades especiales, observaciones..."
          value={form.anuncios}
          onChange={set('anuncios')}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Feedback */}
      {feedback.msg && (
        <div style={{
          padding: '0.6rem 0.9rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          background: feedback.type === 'success' ? '#d4edda' : '#ffdad6',
          color:      feedback.type === 'success' ? '#196b2d' : '#ba1a1a',
        }}>
          {feedback.msg}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {saving
          ? 'Guardando...'
          : savedId ? 'Actualizar Resumen' : 'Guardar Resumen de Clase'}
      </button>
    </div>
  );
};

export default TotalsAttendanceForm;