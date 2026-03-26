import React, { useState, useEffect } from 'react';
import { saveQuickSummary, getQuickSummary } from '../../services/attendanceSummaryService';
import './AttendanceModal.css';
import './QuickAttendanceModal.css';

const QuickAttendanceModal = ({ isOpen, onClose }) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate]       = useState(today);
  const [form, setForm]       = useState({ varones: 0, mujeres: 0, visitantes: 0, biblias: 0, notas: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [isEdit, setIsEdit]   = useState(false);

  const total = (Number(form.varones) || 0) + (Number(form.mujeres) || 0) + (Number(form.visitantes) || 0);

  // Cargar datos existentes al cambiar fecha
  useEffect(() => {
    if (!isOpen || !date) return;
    const load = async () => {
      setLoading(true);
      setSuccess(false);
      setError('');
      try {
        const existing = await getQuickSummary(date);
        if (existing) {
          setForm({
            varones:    existing.varones    ?? 0,
            mujeres:    existing.mujeres    ?? 0,
            visitantes: existing.visitantes ?? 0,
            biblias:    existing.biblias    ?? 0,
            notas:      existing.notas      || '',
          });
          setIsEdit(true);
        } else {
          setForm({ varones: 0, mujeres: 0, visitantes: 0, biblias: 0, notas: '' });
          setIsEdit(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, date]);

  const adjust = (field, delta) => {
    setForm(prev => ({ ...prev, [field]: Math.max(0, (Number(prev[field]) || 0) + delta) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveQuickSummary({ ...form, date });
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
      <div className="att-modal quick-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="quick-modal-header">
          <div className="quick-modal-icon">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <div style={{ flex: 1 }}>
            <span className="att-modal-chip quick-chip">Registro Rápido</span>
            <h2 className="att-modal-title">Asistencia General</h2>
            <p className="att-modal-date" style={{ opacity: 0.75, fontSize: '0.72rem' }}>
              Sin seleccionar clase — toda la iglesia
            </p>
          </div>
          <button className="att-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Selector de fecha */}
        <div className="quick-date-row">
          <span className="material-symbols-outlined">calendar_today</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="quick-date-input"
          />
          {isEdit && (
            <span className="quick-edit-badge">Editando</span>
          )}
        </div>

        {loading ? (
          <div className="att-modal-loading">
            <span className="material-symbols-outlined spin">sync</span>
            Cargando...
          </div>
        ) : (
          <form className="att-modal-body" onSubmit={handleSubmit}>

            {/* Contadores grandes */}
            <div className="quick-counters">
              <QuickCounter
                label="Varones"
                icon="man"
                color="#1d6fa6"
                bg="#e8f2fa"
                value={form.varones}
                onAdjust={(d) => adjust('varones', d)}
                onChange={v => setForm(p => ({ ...p, varones: v }))}
              />
              <QuickCounter
                label="Mujeres"
                icon="woman"
                color="#a6195e"
                bg="#fae8f2"
                value={form.mujeres}
                onAdjust={(d) => adjust('mujeres', d)}
                onChange={v => setForm(p => ({ ...p, mujeres: v }))}
              />
              <QuickCounter
                label="Visitantes"
                icon="person_add"
                color="#196b2d"
                bg="#e8f5ec"
                value={form.visitantes}
                onAdjust={(d) => adjust('visitantes', d)}
                onChange={v => setForm(p => ({ ...p, visitantes: v }))}
              />
              <QuickCounter
                label="Biblias"
                icon="menu_book"
                color="#7c5232"
                bg="#f5ede6"
                value={form.biblias}
                onAdjust={(d) => adjust('biblias', d)}
                onChange={v => setForm(p => ({ ...p, biblias: v }))}
              />
            </div>

            {/* Total calculado */}
            <div className="quick-total">
              <span className="material-symbols-outlined">groups</span>
              <span>Total asistentes: <strong>{total}</strong></span>
            </div>

            {/* Notas opcionales */}
            <div className="att-field">
              <label>Notas (opcional)</label>
              <textarea
                placeholder="Observaciones del culto..."
                rows={2}
                value={form.notas}
                onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              />
            </div>

            {error && <p className="att-error">{error}</p>}

            {success && (
              <div className="att-success">
                <span className="material-symbols-outlined">check_circle</span>
                {isEdit ? '¡Registro actualizado!' : '¡Registro guardado!'}
              </div>
            )}

            <button
              type="submit"
              className="att-submit-btn quick-submit"
              disabled={saving}
            >
              {saving ? (
                <><span className="material-symbols-outlined spin">sync</span> Guardando...</>
              ) : (
                <><span className="material-symbols-outlined">bolt</span>
                  {isEdit ? 'Actualizar Registro' : 'Guardar Registro Rápido'}</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Sub-componente contador grande ──────────────────────────────────────────
const QuickCounter = ({ label, icon, color, bg, value, onAdjust, onChange }) => (
  <div className="quick-counter-card" style={{ '--qc-color': color, '--qc-bg': bg }}>
    <div className="qc-icon-wrap">
      <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
    </div>
    <span className="qc-label">{label}</span>
    <div className="qc-controls">
      <button type="button" className="qc-btn" onClick={() => onAdjust(-1)}>−</button>
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(Math.max(0, Number(e.target.value)))}
        className="qc-input"
      />
      <button type="button" className="qc-btn qc-btn--plus" onClick={() => onAdjust(1)}>+</button>
    </div>
  </div>
);

export default QuickAttendanceModal;