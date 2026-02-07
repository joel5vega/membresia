import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Attendance.css';

const TotalsAttendanceForm = ({ selectedClass, date }) => {
  const [form, setForm] = useState({
    maestro: '', varones: 0, mujeres: 0, visitantes: 0,
    tema: '', ofrenda: '', biblia: 0, anuncios: ''
  });

  const total = Number(form.varones) + Number(form.mujeres) + Number(form.visitantes);

  const handleSave = async () => {
    if (!form.maestro) return alert("Por favor indica el nombre del maestro");
    const db = getFirestore();
    try {
      await addDoc(collection(db, 'asistencias_totales'), {
        ...form,
        clase: selectedClass,
        fecha: date,
        total,
        createdAt: serverTimestamp()
      });
      alert("Totales guardados con éxito");
    } catch (e) { alert("Error al guardar"); }
  };

  return (
    <div className="form-card">
      <div className="form-group">
        <label>Maestro</label>
        <input className="form-control" type="text" placeholder="Nombre del maestro" value={form.maestro} onChange={e => setForm({...form, maestro: e.target.value})} />
      </div>
      <div className="grid-3">
        <div className="form-group"><label>Varones</label><input className="form-control" type="number" onChange={e => setForm({...form, varones: e.target.value})} /></div>
        <div className="form-group"><label>Mujeres</label><input className="form-control" type="number" onChange={e => setForm({...form, mujeres: e.target.value})} /></div>
        <div className="form-group"><label>Visitantes</label><input className="form-control" type="number" onChange={e => setForm({...form, visitantes: e.target.value})} /></div>
      </div>
      <div className="total-badge">Asistencia Total: {total}</div>
      <div className="form-group"><label>Tema</label><input className="form-control" type="text" placeholder="Ej: La Fe" onChange={e => setForm({...form, tema: e.target.value})} /></div>
      <div className="grid-2">
        <div className="form-group"><label>Ofrenda</label><input className="form-control" type="text" placeholder="$0.00" onChange={e => setForm({...form, ofrenda: e.target.value})} /></div>
        <div className="form-group"><label>Biblias</label><input className="form-control" type="number" onChange={e => setForm({...form, biblia: e.target.value})} /></div>
      </div>
      <button className="btn-save" onClick={handleSave}>Guardar Resumen de Clase</button>
    </div>
  );
};

export default TotalsAttendanceForm;