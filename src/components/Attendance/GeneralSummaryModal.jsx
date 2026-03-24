import React, { useState, useEffect } from 'react';
import { saveGeneralSummary, getGeneralSummary } from '../../services/attendanceSummaryService';
import './AttendanceModal.css';

const GeneralSummaryModal = ({ isOpen, onClose, date }) => {
  const [form, setForm] = useState({
    predicador: '',
    tema_general: '',
    total_varones_general: '',
    total_mujeres_general: '',
    total_visitantes_general: '',
    total_biblias_general: '',
    ofrenda_general: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const totalOverall =
    (Number(form.total_varones_general) || 0) +
    (Number(form.total_mujeres_general) || 0) +
    (Number(form.total_visitantes_general) || 0);

  useEffect(() => {
    if (!isOpen || !date) return;
    const load = async () => {
      setLoading(true);
      setSuccess(false);
      setError('');
      try {
        const existing = await getGeneralSummary(date);
        if (existing) {
          setForm({
            predicador: existing.predicador || '',
            tema_general: existing.tema_general || '',
            total_varones_general: existing.total_varones_general ?? '',
            total_mujeres_general: existing.total_mujeres_general ?? '',
            total_visitantes_general: existing.total_visitantes_general ?? '',
            total_biblias_general: existing.total_biblias_general ?? '',
            ofrenda_general: existing.ofrenda_general || '',
            notas: existing.notas || '',
          });
        } else {
          setForm({
            predicador: '', tema_general: '',
            total_varones_general: '', total_mujeres_general: '',
            total_visitantes_general: '', total_biblias_general: '',
            ofrenda_general: '', notas: '',
          });
        }
      } catch (e) {
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, date]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveGeneralSummary({ ...form, date, total_overall: totalOverall });
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
      <div className="att-modal att-modal--general" onClick={e => e.stopPropagation()}>
        <div className="att-modal-header att-modal-header--general">
          <div>
            <span className="att-modal-chip att-chip--general">Resumen General</span>
            <h2 className="att-modal-title">Culto del {formatDate(date)}</h2>
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
            <div className="att-field">
              <label>Predicador</label>
              <input
                type="text"
                placeholder="Nombre del predicador"
                value={form.predicador}
                onChange={handleChange('predicador')}
              />
            </div>

            <div className="att-field">
              <label>Tema del mensaje</label>
              <input
                type="text"
                placeholder="Ej: El poder de la oración"
                value={form.tema_general}
                onChange={handleChange('tema_general')}
              />
            </div>

            <div className="att-field-group">
              <p className="att-field-group-label">Asistencia Total General</p>
              <div className="att-counters">
                <CounterField
                  label="Varones"
                  icon="man"
                  value={form.total_varones_general}
                  onChange={handleChange('total_varones_general')}
                  color="blue"
                />
                <CounterField
                  label="Mujeres"
                  icon="woman"
                  value={form.total_mujeres_general}
                  onChange={handleChange('total_mujeres_general')}
                  color="pink"
                />
                <CounterField
                  label="Visitantes"
                  icon="person_add"
                  value={form.total_visitantes_general}
                  onChange={handleChange('total_visitantes_general')}
                  color="green"
                />
              </div>

              <div className="att-total-pill att-total-pill--general">
                <span className="material-symbols-outlined">church</span>
                <span>Total General: <strong>{totalOverall}</strong></span>
              </div>
            </div>

            <div className="att-two-cols">
              <div className="att-field">
                <label>Biblias</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.total_biblias_general}
                  onChange={handleChange('total_biblias_general')}
                />
              </div>
              <div className="att-field">
                <label>Ofrenda General</label>
                <input
                  type="text"
                  placeholder="Bs. 0.00"
                  value={form.ofrenda_general}
                  onChange={handleChange('ofrenda_general')}
                />
              </div>
            </div>

            <div className="att-field">
              <label>Notas / Observaciones</label>
              <textarea
                placeholder="Actividades especiales, anuncios, etc."
                value={form.notas}
                onChange={handleChange('notas')}
                rows={3}
              />
            </div>

            {error && <p className="att-error">{error}</p>}

            {success && (
              <div className="att-success">
                <span className="material-symbols-outlined">check_circle</span>
                ¡Resumen general guardado!
              </div>
            )}

            <button type="submit" className="att-submit-btn att-submit-btn--general" disabled={saving}>
              {saving ? (
                <><span className="material-symbols-outlined spin">sync</span> Guardando...</>
              ) : (
                <><span className="material-symbols-outlined">save</span> Guardar Resumen General</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Reutilizar CounterField (cópialo aquí o extráelo a un archivo separado)
const CounterField = ({ label, icon, value, onChange, color }) => {
  const num = Number(value) || 0;
  const adjust = (delta) => {
    onChange({ target: { value: String(Math.max(0, num + delta)) } });
  };
  return (
    <div className={`att-counter att-counter--${color}`}>
      <span className="material-symbols-outlined att-counter-icon">{icon}</span>
      <span className="att-counter-label">{label}</span>
      <div className="att-counter-controls">
        <button type="button" onClick={() => adjust(-1)}>−</button>
        <input type="number" min="0" value={value} onChange={onChange} />
        <button type="button" onClick={() => adjust(1)}>+</button>
      </div>
    </div>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
};

export default GeneralSummaryModal;