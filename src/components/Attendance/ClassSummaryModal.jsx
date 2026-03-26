import React, { useState, useEffect } from 'react';
import { saveClassSummary, getClassSummary } from '../../services/attendanceSummaryService';
import './AttendanceModal.css';

const ClassSummaryModal = ({ isOpen, onClose, selectedClass, uniqueClassId, date }) => {
  const [form, setForm] = useState({
    maestro: '',
    varones: '',
    mujeres: '',
    visitantes: '',
    biblia: '',
    tema: '',
    ofrenda: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = (Number(form.varones) || 0) + (Number(form.mujeres) || 0) + (Number(form.visitantes) || 0);

  // Cargar datos existentes al abrir
  useEffect(() => {
    if (!isOpen || !date || !uniqueClassId) return;
    const load = async () => {
      setLoading(true);
      setSuccess(false);
      setError('');
      try {
        const existing = await getClassSummary(date, uniqueClassId);
        if (existing) {
          setForm({
            maestro: existing.maestro || '',
            varones: existing.varones ?? '',
            mujeres: existing.mujeres ?? '',
            visitantes: existing.visitantes ?? '',
            biblia: existing.biblia ?? '',
            tema: existing.tema || '',
            ofrenda: existing.ofrenda || '',
          });
        } else {
          setForm({ maestro: '', varones: '', mujeres: '', visitantes: '', biblia: '', tema: '', ofrenda: '' });
        }
      } catch (e) {
        setError('Error al cargar datos existentes.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, date, uniqueClassId]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.maestro.trim()) return setError('El nombre del maestro es obligatorio.');
    setSaving(true);
    setError('');
    try {
      const result = await saveClassSummary({
        ...form,
        date,
        clase: selectedClass,
        uniqueClassId,
      });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="att-modal-overlay" onClick={onClose}>
      <div className="att-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="att-modal-header">
          <div>
            <span className="att-modal-chip">Resumen de Clase</span>
            <h2 className="att-modal-title">{selectedClass}</h2>
            <p className="att-modal-date">{formatDate(date)}</p>
          </div>
          <button className="att-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="att-modal-loading">
            <span className="material-symbols-outlined spin">sync</span>
            Cargando datos...
          </div>
        ) : (
          <form className="att-modal-body" onSubmit={handleSubmit}>
            {/* Maestro */}
            <div className="att-field">
              <label>Maestro / Líder</label>
              <input
                type="text"
                placeholder="Nombre del maestro"
                value={form.maestro}
                onChange={handleChange('maestro')}
                required
              />
            </div>

            {/* Tema */}
            <div className="att-field">
              <label>Tema</label>
              <input
                type="text"
                placeholder="Ej: La Fe que mueve montañas"
                value={form.tema}
                onChange={handleChange('tema')}
              />
            </div>

            {/* Asistencia numérica */}
            <div className="att-field-group">
              <p className="att-field-group-label">Asistencia</p>
              <div className="att-counters">
                <CounterField
                  label="Varones"
                  icon="man"
                  value={form.varones}
                  onChange={handleChange('varones')}
                  color="blue"
                />
                <CounterField
                  label="Mujeres"
                  icon="woman"
                  value={form.mujeres}
                  onChange={handleChange('mujeres')}
                  color="pink"
                />
                <CounterField
                  label="Visitantes"
                  icon="person_add"
                  value={form.visitantes}
                  onChange={handleChange('visitantes')}
                  color="green"
                />
              </div>

              {/* Total calculado */}
              <div className="att-total-pill">
                <span className="material-symbols-outlined">groups</span>
                <span>Total: <strong>{total}</strong></span>
              </div>
            </div>

            {/* Biblias y Ofrenda */}
            <div className="att-two-cols">
              <div className="att-field">
                <label>Biblias</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.biblia}
                  onChange={handleChange('biblia')}
                />
              </div>
              <div className="att-field">
                <label>Ofrenda</label>
                <input
                  type="text"
                  placeholder="Bs. 0.00"
                  value={form.ofrenda}
                  onChange={handleChange('ofrenda')}
                />
              </div>
            </div>

            {error && <p className="att-error">{error}</p>}

            {success && (
              <div className="att-success">
                <span className="material-symbols-outlined">check_circle</span>
                ¡Guardado exitosamente!
              </div>
            )}

            <button type="submit" className="att-submit-btn" disabled={saving}>
              {saving ? (
                <><span className="material-symbols-outlined spin">sync</span> Guardando...</>
              ) : (
                <><span className="material-symbols-outlined">save</span> Guardar Resumen</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Sub-componente contador con botones +/-
const CounterField = ({ label, icon, value, onChange, color }) => {
  const num = Number(value) || 0;

  const adjust = (delta) => {
    const newVal = Math.max(0, num + delta);
    onChange({ target: { value: String(newVal) } });
  };

  return (
    <div className={`att-counter att-counter--${color}`}>
      <span className="material-symbols-outlined att-counter-icon">{icon}</span>
      <span className="att-counter-label">{label}</span>
      <div className="att-counter-controls">
        <button type="button" onClick={() => adjust(-1)}>−</button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={onChange}
        />
        <button type="button" onClick={() => adjust(1)}>+</button>
      </div>
    </div>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    .toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export default ClassSummaryModal;