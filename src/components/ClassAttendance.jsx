import React, { useState, useEffect } from 'react';
import { memberService, attendanceService } from '../services';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ClassAttendance = ({ teacher }) => {
  const [classMembers, setClassMembers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('ninos');
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const classOptions = {
    'Sociedad de Caballeros "Emanuel"': 'Sociedad de Caballeros "Emanuel"',
    'Sociedad de Señoras "Shaddai"': 'Sociedad de Señoras "Shaddai"',
    'Sociedad de Matrimonios jóvenes "Ebenezer"': 'Sociedad de Matrimonios jóvenes "Ebenezer"',
    'Sociedad de Jóvenes "Soldados de la Fe"': 'Sociedad de Jóvenes "Soldados de la Fe"',
    'Sociedad de prejuveniles "Vencedores"': 'Sociedad de prejuveniles "Vencedores"',
    'Clase de Exploradores': 'Clase de Exploradores',
    'Clase de Estrellitas': 'Clase de Estrellitas',
    'Clase de joyitas': 'Clase de joyitas',
    'Avanzada': 'Avanzada'
  }

  // Load members of the selected class
  useEffect(() => {
    const loadClassMembers = async () => {
      setLoading(true);
      setSaved(false);
            setError(null);
      // Get all members first
      const allMembers = await memberService.getMembers();
      // Filter by selected class
      const filtered = allMembers.filter(m => m.clase === selectedClass);
      setClassMembers(filtered);

      // Load attendance data (this is optional, don't let errors here prevent member display)
      try {
        const selectedDate = new Date(todayDate);
        const attendances = await attendanceService.getAttendanceByClassAndDate(selectedClass, selectedDate);

        // Create attendance map
        const map = {};
        attendances.forEach(att => {
          map[att.memberId] = att.status;
        });
        setAttendanceMap(map);
        setError(false);
      } catch (err) {
        // Silently fail - attendance data is optional
        console.warn('Could not load attendance data:', err);
      }
            finally {
        setLoading(false);
      }
    };

    loadClassMembers();
  }, [selectedClass, todayDate]);

  const handleAttendanceChange = async (memberId, status) => {
    try {
      const selectedDate = new Date(todayDate);
      const existing = await attendanceService.getAttendanceByMemberAndDate(memberId, selectedDate);

      if (existing) {
        // Update existing
        await attendanceService.updateAttendance(existing.id, { status });
      } else {
        // Create new
        await attendanceService.addAttendance({
          memberId,
          date: selectedDate,
          status,
        });
      }

      // Update local state
      setAttendanceMap(prev => ({
        ...prev,
        [memberId]: status
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Error al guardar asistencia');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xl">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Asistencia</h1>
          <p className="text-gray-600 mb-6">Bienvenido, {teacher?.displayName}</p>

          {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
          {saved && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">Guardado exitosamente</div>}

          {/* Controls */}
          <div className="flex gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold mb-2">Clase</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border rounded px-4 py-2"
              >
                {Object.entries(classOptions).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Fecha</label>
              <input
                type="date"
                value={todayDate}
                onChange={(e) => setTodayDate(e.target.value)}
                className="border rounded px-4 py-2"
              />
            </div>
          </div>

          {/* Attendance List */}
          {classMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay miembros en esta clase
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Presente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ausente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tardío</th>
                  </tr>
                </thead>
                <tbody>
                  {classMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.nombre} {member.apellido}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAttendanceChange(member.id, 'present')}
                          className={`p-2 rounded transition ${
                            attendanceMap[member.id] === 'present'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                          }`}
                        >
                          <CheckCircle className="w-6 h-6" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAttendanceChange(member.id, 'absent')}
                          className={`p-2 rounded transition ${
                            attendanceMap[member.id] === 'absent'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                          }`}
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAttendanceChange(member.id, 'late')}
                          className={`p-2 rounded transition ${
                            attendanceMap[member.id] === 'late'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                          }`}
                        >
                          <Clock className="w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassAttendance;
