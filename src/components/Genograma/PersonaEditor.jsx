import React, { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { RELACION_OPCIONES } from '../../genograma/relaciones';
import ConvertToMember from './ConvertToMember';
import './genograma.css';

export default function PersonaEditor({ initial, isNew, saving, isMember, onConvert, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const valido = form.nombre.trim() && form.relacion;

  return (
    <div className="gn-overlay" onClick={onClose}>
      <div className="gn-modal" onClick={(e) => e.stopPropagation()}>
        <header className="gn-modal__head">
          <h3>{isNew ? 'Nuevo familiar' : 'Editar familiar'}</h3>
          <button className="gn-icon" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        </header>

        <label className="gn-label">Nombre completo
          <input className="gn-input" value={form.nombre} onChange={set('nombre')} autoFocus />
        </label>

        <label className="gn-label">Relación con el miembro
          <select className="gn-input" value={form.relacion} onChange={set('relacion')}>
            {RELACION_OPCIONES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>

        <div className="gn-row">
          <label className="gn-label">Edad
            <input className="gn-input" type="number" min="0" value={form.edad} onChange={set('edad')} />
          </label>
          <label className="gn-label">Sexo
            <select className="gn-input" value={form.sexo || ''} onChange={set('sexo')}>
              <option value="">Automático</option>
              <option value="M">Varón</option>
              <option value="F">Mujer</option>
            </select>
          </label>
        </div>

        <label className="gn-check">
          <input type="checkbox" checked={!!form.viveConElMiembro} onChange={set('viveConElMiembro')} />
          Vive en la misma vivienda
        </label>
        {!isNew && !isMember && onConvert && (
          <ConvertToMember lockName person={{ nombre: form.nombre, sexo: form.sexo }} onConvert={onConvert} />
        )}
        <footer className="gn-row">
          <button className="gn-btn" disabled={!valido || saving} onClick={() => onSave(form)}>
            <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
          </button>
          {!isNew && (
            <button className="gn-btn gn-btn--accent" disabled={saving} onClick={onDelete}>
              <Trash2 size={16} /> Eliminar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}