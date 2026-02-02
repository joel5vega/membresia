import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { classAttendanceService } from '../../services/classAttendanceService';

const PRIMARY = '#A63232';
const SECONDARY = '#E68A3E';
const BG = '#F9F7F5';

const CLASSES = ['Shaddai', 'Vida Nueva', 'Renuevo', 'Adolescentes', 'Jóvenes', 'Adultos'];

const NewAttendanceEntry = ({ onBack }) => {
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().substring(0, 10));
  const [clase, setClase] = useState('');
  const [maestro, setMaestro] = useState('');
  const [hombres, setHombres] = useState(0);
  const [mujeres, setMujeres] = useState(0);
  const [ninos, setNinos] = useState(0);
  const [visitantes, setVisitantes] = useState(0);
  const [biblias, setBiblias] = useState(0);
  const [saving, setSaving] = useState(false);

  const total = hombres + mujeres + ninos + visitantes;
  const periodoMes = date.substring(0, 7);

  const handleChange = (setter, delta) => {
    setter(prev => Math.max(0, prev + delta));
  };

  const handleSave = async () => {
    if (!date || !clase) {
      alert('Por favor completa la fecha y clase');
      return;
    }

    setSaving(true);
    try {
      const fechaDate = new Date(date);
      const record = {
        fecha: Timestamp.fromDate(fechaDate),
        periodo_mes: periodoMes,
        clase_id: clase,
        maestro: maestro.trim() || 'Sin maestro',
        conteo: { hombres, mujeres, ninos, visitantes, total },
        biblias,
        fuente: 'manual'
      };

      await classAttendanceService.addAttendance(record);
      alert('Registro guardado exitosamente');
      setHombres(0);
      setMujeres(0);
      setNinos(0);
      setVisitantes(0);
      setBiblias(0);
      setMaestro('');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const counterCard = (label, value, onDec, onInc, color) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onDec} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: '#FFE3CC', color: color, fontSize: 20, cursor: 'pointer'
        }}>-</button>
        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{value}</span>
        <button onClick={onInc} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: color, color: 'white', fontSize: 20, cursor: 'pointer'
        }}>+</button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: BG, padding: '16px 12px 32px',
      fontFamily: 'Inter, Roboto, system-ui, sans-serif'
    }}>
      <header style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', fontSize: 24,
            cursor: 'pointer', color: PRIMARY
          }}>←</button>
        )}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>Nueva Asistencia</h1>
          <p style={{ fontSize: 12, color: '#777', margin: '4px 0 0 0' }}>Registra el resumen por clase</p>
        </div>
      </header>

      <div style={{
        background: 'white', borderRadius: 16, padding: 16, marginBottom: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
      }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Fecha</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
          width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 12
        }} />

        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Clase</label>
        <select value={clase} onChange={e => setClase(e.target.value)} style={{
          width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd',
          marginBottom: 12, background: 'white'
        }}>
          <option value="">Selecciona una clase</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Maestro / Líder</label>
        <input type="text" value={maestro} onChange={e => setMaestro(e.target.value)}
          placeholder="Ej. Pr. Juan Doe" style={{
            width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd'
          }} />
      </div>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Detalles de asistencia</h2>
        {counterCard('Varones', hombres, () => handleChange(setHombres, -1), () => handleChange(setHombres, 1), SECONDARY)}
        {counterCard('Mujeres', mujeres, () => handleChange(setMujeres, -1), () => handleChange(setMujeres, 1), SECONDARY)}
        {counterCard('Niños', ninos, () => handleChange(setNinos, -1), () => handleChange(setNinos, 1), SECONDARY)}
        {counterCard('Visitantes', visitantes, () => handleChange(setVisitantes, -1), () => handleChange(setVisitantes, 1), SECONDARY)}
      </section>

      <section style={{
        background: 'white', borderRadius: 16, padding: 16, marginBottom: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
      }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Biblias</label>
        <input type="number" min={0} value={biblias} onChange={e => setBiblias(parseInt(e.target.value || '0', 10))}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Total (solo lectura)</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>{total}</span>
        </div>
      </section>

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: '14px 0', borderRadius: 999, border: 'none',
        background: saving ? '#ccc' : PRIMARY, color: 'white', fontWeight: 700,
        fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer'
      }}>
        {saving ? 'Guardando...' : 'Guardar registro'}
      </button>
    </div>
  );
};

export default NewAttendanceEntry;
