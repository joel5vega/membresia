import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const TIPOS_RELACION = ['Padre', 'Madre', 'Hijo', 'Hija', 'Esposo', 'Esposa', 'Hermano', 'Hermana', 'Abuelo', 'Abuela', 'Nieto', 'Nieta', 'Tío', 'Tía', 'Sobrino', 'Sobrina', 'Primo', 'Prima'];

export default function RelationshipManager() {
  const [miembros, setMiembros] = useState([]);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState('');
  const [relacionTipo, setRelacionTipo] = useState('');
  const [miembroRelacionado, setMiembroRelacionado] = useState('');
  const [viveJuntos, setViveJuntos] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargarMiembros(); }, []);

  async function cargarMiembros() {
    try {
      const snapshot = await getDocs(collection(db, 'miembros'));
      setMiembros(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function agregarRelacion() {
    if (!miembroSeleccionado || !relacionTipo || !miembroRelacionado) {
      alert('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const m1 = miembros.find(m => m.id === miembroSeleccionado);
      const m2 = miembros.find(m => m.id === miembroRelacionado);
      const calculateAge = (fecha) => {
        const birth = new Date(fecha);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
      };
      await updateDoc(doc(db, 'miembros', miembroSeleccionado), {
        genograma: arrayUnion({
          miembroId: miembroRelacionado,
          relacion: relacionTipo,
          nombre: `${m2.nombre} ${m2.apellido}`,
          edad: m2.fechaNacimiento ? calculateAge(m2.fechaNacimiento).toString() : '',
          viveConElMiembro: viveJuntos
        })
      });
      await updateDoc(doc(db, 'miembros', miembroRelacionado), {
        genograma: arrayUnion({
          miembroId: miembroSeleccionado,
          relacion: getRelacionInversa(relacionTipo, m1.sexo),
          nombre: `${m1.nombre} ${m1.apellido}`,
          edad: m1.fechaNacimiento ? calculateAge(m1.fechaNacimiento).toString() : '',
          viveConElMiembro: viveJuntos
        })
      });
      alert('Relación agregada');
      setMiembroSeleccionado('');
      setRelacionTipo('');
      setMiembroRelacionado('');
      setViveJuntos(false);
      cargarMiembros();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function getRelacionInversa(rel, sexo) {
    const map = { 'Padre': sexo === 'M' ? 'Hijo' : 'Hija', 'Madre': sexo === 'M' ? 'Hijo' : 'Hija', 'Esposo': 'Esposa', 'Esposa': 'Esposo' };
    return map[rel] || rel;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Gestor de Relaciones Familiares</h2>
      <div className="space-y-4">
        <select value={miembroSeleccionado} onChange={(e) => setMiembroSeleccionado(e.target.value)} className="w-full p-2 border rounded">
          <option>-- Seleccione miembro --</option>
          {miembros.map(m => (<option key={m.id} value={m.id}>{m.nombre}</option>))}
        </select>
        <select value={relacionTipo} onChange={(e) => setRelacionTipo(e.target.value)} disabled={!miembroSeleccionado} className="w-full p-2 border rounded">
          <option>-- Tipo relación --</option>
          {TIPOS_RELACION.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select value={miembroRelacionado} onChange={(e) => setMiembroRelacionado(e.target.value)} disabled={!relacionTipo} className="w-full p-2 border rounded">
          <option>-- Miembro relacionado --</option>
          {miembros.filter(m => m.id !== miembroSeleccionado).map(m => (<option key={m.id} value={m.id}>{m.nombre}</option>))}
        </select>
        <label><input type="checkbox" checked={viveJuntos} onChange={(e) => setViveJuntos(e.target.checked)} /> Viven juntos</label>
        <button onClick={agregarRelacion} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Guardando...' : 'Agregar'}</button>
      </div>
    </div>
  );
}