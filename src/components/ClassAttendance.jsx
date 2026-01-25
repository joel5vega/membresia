import React, { useState, useEffect } from 'react';
import { memberService, attendanceService } from '../services';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ClassAttendance = ({ teacher, classId }) => {
  const [classMembers, setClassMembers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('ninos');
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
    const [maestro, setMaestro] = useState('');
  const [varones, setVarones] = useState(0);
  const [mujeres, setMujeres] = useState(0);
  const [tema, setTema] = useState('');
  const [ofrenda, setOfrenda] = useState('');
  const [biblia, setBiblia] = useState(0);
  const [anuncios, setAnuncios] = useState('');

  

  const classOptions = {
    'Sociedad de Caballeros "Emanuel"': 'Sociedad de Caballeros "Emanuel"',
    'Sociedad de Señoras "Shaddai"': 'Sociedad de Señoras "Shaddai"',
    'Sociedad de Matrimonios jóvenes "Ebenezer"': 'Sociedad de Matrimonios jóvenes "Ebenezer"',
    'Sociedad de Jóvenes "Soldados de la Fe"': 'Sociedad de Jóvenes "Soldados de la Fe"',
    'Sociedad de prejuveniles "Vencedores"': 'Sociedad de prejuveniles "Vencedores"',
    'Clase de Exploradores': 'Clase de Exploradores',
    'Clase de Estrellitas': 'Clase de Estrellitas',
    'Clase de joyitas': 'Clase de joyitas',
    'Av. Jireh':'Av. Jireh',
    'Av. Luz del evangelio':'Av. Luz del evangelio',
    'Av. Elohim':'Av. Elohim',
    'Av. Jesús es el camino':'Av. Jesús es el camino'    
  };

  useEffect(() => {
    const loadClassMembers = async () => {
      setLoading(true);
      setSaved(false);
      setError(null);

      try {
        const allMembers = await memberService.getMembers();
        const filtered = allMembers.filter((m) => m.clase === selectedClass);
        setClassMembers(filtered);

        const selectedDate = new Date(todayDate);
        const attendances = await attendanceService.getAttendanceByClassAndDate(
          selectedClass,
          selectedDate
        );

        const map = {};
        attendances.forEach((att) => {
          map[att.memberId] = att.status;
        });
        setAttendanceMap(map);
      } catch (err) {
        console.warn('Could not load attendance data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassMembers();
  }, [selectedClass, todayDate]);

  const handleAttendanceChange = async (memberId, status) => {
    try {
      const selectedDate = new Date(todayDate);
      const existing = await attendanceService.getAttendanceByMemberAndDate(
        memberId,
        selectedDate
      );

      if (existing) {
        await attendanceService.updateAttendance(existing.id, { status });
      } else {
        await attendanceService.addAttendance({
          memberId,
          date: selectedDate,
          status,
          className: classMembers.find((m) => m.id === memberId)?.clase,
        });
      }

      setAttendanceMap((prev) => ({
        ...prev,
        [memberId]: status,
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Error al guardar asistencia');
      console.error(err);
    }
  };

    const handleSaveAttendance = async () => {
          try {
if (!teacher) {                            setError('Teacher information is missing');
                                    return;
                                          }
                  const db = getFirestore();
                        await addDoc(collection(db, 'attendance'), {
                                        classId: classId || teacher?.id,
                                          date: todayDate,
                                                  maestro,
                                                          varomes,
                                                                  mujeres,
                                                                          tema,
                                                                                  ofrenda,
                                                                                          biblia,
                                                                                                  anuncios,
                                                                                                          createdAt: serverTimestamp()
                                                                                                                });
                                                                                                                      setSaved(true);
                                                                                                                            setTimeout(() => setSaved(false), 2000);
                                                                                                                                } catch (error) {
                                                                                                                                        setError('Error saving attendance: ' + error.message);
                                                                                                                                              console.error(error);
                                                                                                                                                  }
                                                                                                                                                    };

  if (loading) {
    return (
      <div className="text-center py-8 text-lg">
        Cargando...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ padding: '12px', boxSizing: 'border-box' }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            boxSizing: 'border-box',
          }}
        >
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '4px',
            }}
          >
            Registrar asistencia
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '14px' }}>
            Bienvenido, {teacher?.displayName}
          </p>

          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '8px 10px',
                borderRadius: '6px',
                marginBottom: '10px',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}
          {saved && (
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '8px 10px',
                borderRadius: '6px',
                marginBottom: '10px',
                fontSize: '13px',
              }}
            >
              Guardado exitosamente
            </div>
          )}

          {/* Controles: en columna en móvil */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                Clase
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                {Object.entries(classOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                Fecha
              </label>
              <input
                type="date"
                value={todayDate}
                onChange={(e) => setTodayDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
                            {/* Row 2: Maestro, Varones, Mujeres, Total */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Maestro</label>
                  <input type="text" placeholder="Nombre del maestro" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Varones</label>
                  <input type="number" placeholder="0" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mujeres</label>
                  <input type="number" placeholder="0" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total</label>
                  <input type="number" placeholder="0" disabled style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#f0f0f0' }} />
                </div>
              </div>
              
              {/* Row 3: Tema, Ofrenda, Biblia */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tema</label>
                  <input type="text" placeholder="Ej: La Resurreccion" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ofrenda</label>
                  <input type="text" placeholder="Ej: $50" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Biblia</label>
                  <input type="number" placeholder="Ej: 3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              {/* Row 4: Anuncios */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Anuncios</label>
                <input type="text" placeholder="Ej: Retiro el próximo mes" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* Lista de asistencia: cards en vez de tabla completa */}
          {classMembers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              No hay miembros en esta clase
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {classMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {member.nombre} {member.apellido}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleAttendanceChange(member.id, 'present')}
                      className={`p-2 rounded transition ${
                        attendanceMap[member.id] === 'present'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(member.id, 'absent')}
                      className={`p-2 rounded transition ${
                        attendanceMap[member.id] === 'absent'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(member.id, 'late')}
                      className={`p-2 rounded transition ${
                        attendanceMap[member.id] === 'late'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
                            <button style={{ backgroundColor: '#4CAF50', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '20px', width: '100%' }} onClick={handleSaveAttendance}>Guardar Asistencia</button>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default ClassAttendance;
