import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import './BulkAttendanceForm.css';

const FORM_CLASSES = [
  { label: 'Adultos',      uniqueClassId: 'adultos',                clase: 'Adultos (Shaddai + Emanuel)' },
  { label: 'Jov. Casados', uniqueClassId: 'matrimonios-ebenezer',   clase: 'Sociedad de Matrimonios jóvenes "Ebenezer"' },
  { label: 'Jóvenes',      uniqueClassId: 'jovenes-soldados-fe',    clase: 'Sociedad de Jóvenes "Soldados de la Fe"' },
  { label: 'Prejuveniles', uniqueClassId: 'prejuveniles-vencedores',clase: 'Sociedad de prejuveniles "Vencedores"' },
  { label: 'Exploradores', uniqueClassId: 'exploradores',           clase: 'Clase de Exploradores' },
  { label: 'Estrellitas',  uniqueClassId: 'estrellitas',            clase: 'Clase de Estrellitas' },
  { label: 'Joyitas',      uniqueClassId: 'joyitas',                clase: 'Clase de joyitas' },
];

const EMPTY = () => ({ varones: '', mujeres: '', bebes: '', biblias: '' });

const BulkAttendanceForm = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate]             = useState(today);
  const [rows, setRows]             = useState(FORM_CLASSES.map(() => EMPTY()));
  const [visitas, setVisitas]       = useState('');
  const [asistFinal, setAsistFinal] = useState('');
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');
const [biblasFinal, setBiblasFinal] = useState('');
const biblasFinalNum = Number(biblasFinal) || 0;
  const set = (i, field) => (e) => {
    const copy = [...rows];
    copy[i] = { ...copy[i], [field]: e.target.value };
    setRows(copy);
  };

  const totals       = rows.map(r =>
    (Number(r.varones) || 0) + (Number(r.mujeres) || 0) + (Number(r.bebes) || 0)
  );
  const subtotal     = totals.reduce((a, b) => a + b, 0);
  const subtotalBibl = rows.reduce((a, r) => a + (Number(r.biblias) || 0), 0);
  const visitasNum   = Number(visitas) || 0;
  const finalNum     = Number(asistFinal) || 0;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await Promise.all(
        FORM_CLASSES.map((item, i) => {
          const v = Number(rows[i].varones) || 0;
          const m = Number(rows[i].mujeres) || 0;
          const b = Number(rows[i].bebes)   || 0;
          const total = v + m + b;
          if (total === 0) return Promise.resolve();

          return addDoc(collection(db, 'asistencias_totales'), {
            recordType:    'class_summary',
            date,
            clase:         item.clase,
            uniqueClassId: item.uniqueClassId,
            varones: v, mujeres: m, bebes: b,
            visitantes: 0,
            biblias:   Number(rows[i].biblias) || 0,
            total,
            fuente:    'informe_dominical',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        })
      );

      await addDoc(collection(db, 'asistencias_totales'), {
        recordType:            'general_summary',
        date,
        subtotal_clases:       subtotal,
        total_visitas:         visitasNum,
        asistencia_final:      finalNum,
        total_overall:         finalNum || subtotal + visitasNum,
        total_biblias_general: subtotalBibl,
        total_varones_general: rows.reduce((a, r) => a + (Number(r.varones) || 0), 0),
        total_mujeres_general: rows.reduce((a, r) => a + (Number(r.mujeres) || 0), 0),
        total_bebes_general:   rows.reduce((a, r) => a + (Number(r.bebes)   || 0), 0),
        fuente:    'informe_dominical',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        biblias_final: biblasFinalNum,
      });

      setDone(true);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRows(FORM_CLASSES.map(() => EMPTY()));
    setVisitas('');
    setAsistFinal('');
    setDone(false);
    setError('');
    setBiblasFinal('');
  };

  // ── ÉXITO ──────────────────────────────────────────────────────────────────
  if (done) return (
    <div className="bulk-success">
      <span className="material-symbols-outlined bulk-success-icon">check_circle</span>
      <h3>¡Informe guardado!</h3>
      <p>{date}</p>
      <div className="bulk-chips">
        <span className="bulk-chip red">ED: {subtotal}</span>
        {visitasNum > 0 && <span className="bulk-chip orange">Visitas: {visitasNum}</span>}
        {finalNum   > 0 && <span className="bulk-chip green">Final: {finalNum}</span>}
        <span className="bulk-chip brown">Bibl. ED: {subtotalBibl}</span>
{biblasFinalNum > 0 && <span className="bulk-chip brown">Bibl. Final: {biblasFinalNum}</span>}
      </div>
      <button onClick={handleReset} className="bulk-save-btn" style={{ marginTop: '1.5rem' }}>
        Nuevo Informe
      </button>
    </div>
  );

  // ── FORMULARIO ─────────────────────────────────────────────────────────────
  return (
    <div className="bulk-form">

      <div className="bulk-form-header">
        <p>Iglesia Evangélica de Dios Boliviana "Canaan"</p>
        <h2>Informe de Escuela Dominical</h2>
      </div>

      <div className="bulk-date-row">
        <span className="material-symbols-outlined">calendar_today</span>
        <input
          className="bulk-date-input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="bulk-table-wrapper">
        <table className="bulk-table">
          <colgroup>
            <col className="col-clase" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-num" />
            <col className="col-total" />
            <col className="col-bibl" />
          </colgroup>
          <thead>
            <tr>
              <th className="col-clase">CLASE</th>
              <th>V</th>
              <th>M</th>
              <th>B</th>
              <th className="col-total">TOTAL</th>
              <th>BIB</th>
            </tr>
          </thead>

          <tbody>
            {FORM_CLASSES.map((item, i) => (
              <tr key={item.uniqueClassId}>
                <td className="cell-clase">{item.label}</td>
                <td><input className="bulk-num-input" value={rows[i].varones} onChange={set(i, 'varones')} type="number" min="0" inputMode="numeric" /></td>
                <td><input className="bulk-num-input" value={rows[i].mujeres} onChange={set(i, 'mujeres')} type="number" min="0" inputMode="numeric" /></td>
                <td><input className="bulk-num-input" value={rows[i].bebes}   onChange={set(i, 'bebes')}   type="number" min="0" inputMode="numeric" /></td>
                <td className={`cell-total ${totals[i] === 0 ? 'empty' : ''}`}>
                  {totals[i] > 0 ? totals[i] : '—'}
                </td>
                <td><input className="bulk-num-input" value={rows[i].biblias} onChange={set(i, 'biblias')} type="number" min="0" inputMode="numeric" /></td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="row-subtotal">
              <td className="label">Subtotal</td>
              <td>{rows.reduce((a, r) => a + (Number(r.varones) || 0), 0)}</td>
              <td>{rows.reduce((a, r) => a + (Number(r.mujeres) || 0), 0)}</td>
              <td>{rows.reduce((a, r) => a + (Number(r.bebes)   || 0), 0)}</td>
              <td className="big">{subtotal}</td>
              <td>{subtotalBibl}</td>
            </tr>

            <tr className="row-visitas">
              <td className="label" colSpan={4}>Nº de Visitas</td>
              <td>
                <input
                  className="bulk-num-input visitas-input"
                  value={visitas}
                  onChange={e => setVisitas(e.target.value)}
                  type="number" min="0" inputMode="numeric" placeholder="0"
                />
              </td>
              <td />
            </tr>

           <tr className="row-final">
  <td className="label" colSpan={3}>Asist. Final</td>
  <td className="sublabel">prédica</td>
  <td>
    <input
      className="bulk-num-input final-input"
      value={asistFinal}
      onChange={e => setAsistFinal(e.target.value)}
      type="number" min="0" inputMode="numeric" placeholder="0"
    />
  </td>
  <td>
    <input
      className="bulk-num-input final-input"
      value={biblasFinal}
      onChange={e => setBiblasFinal(e.target.value)}
      type="number" min="0" inputMode="numeric" placeholder="0"
    />
  </td>
</tr>
          </tfoot>
        </table>
      </div>

      {error && <p className="bulk-error">{error}</p>}

      <button
        className="bulk-save-btn"
        onClick={handleSave}
        disabled={saving || subtotal === 0}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
          {saving ? 'sync' : 'save'}
        </span>
        {saving ? 'Guardando...' : `Guardar — ED: ${subtotal}${finalNum > 0 ? ` · Final: ${finalNum}` : ''}`}
      </button>
    </div>
  );
};

export default BulkAttendanceForm;