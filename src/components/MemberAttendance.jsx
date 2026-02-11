import React, { useState, useEffect } from 'react';
import { memberService, attendanceService } from '../services';
import { Check } from 'lucide-react';
import './Attendance.css';

const MemberAttendance = ({ selectedClass, date }) => {
  const [members, setMembers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass) loadData();
  }, [selectedClass, date]);

  const loadData = async () => {
    setLoading(true);

    // 1. miembros
    const all = await memberService.getMembers();
    const classMembers = all.filter(m => m.clase === selectedClass);
    setMembers(classMembers);

    // 2. asistencias de esa clase para la fecha seleccionada
    const classAttendance = await attendanceService.getAttendanceByClassAndDate(selectedClass, new Date(date));

    // construir mapa de estatus
    const mapStatus = {};
    classAttendance.forEach(a => {
      mapStatus[a.memberId] = a.status === 'present';
    });

    setAttendanceMap(mapStatus);
    setLoading(false);
  };

  const toggleStatus = async (mId) => {
    const newStatus = !attendanceMap[mId];
    setAttendanceMap(prev => ({ ...prev, [mId]: newStatus }));

    // Buscar si ya existe un registro de asistencia
    const existing = await attendanceService.getAttendanceByMemberAndDate(mId, new Date(date));

    if (existing) {
      // actualizar registro existente
      await attendanceService.updateAttendance(existing.id, {
        status: newStatus ? 'present' : 'absent',
      });
    } else {
      // crear nuevo registro
      await attendanceService.addAttendance({
        memberId: mId,
        date: new Date(date),
        status: newStatus ? 'present' : 'absent',
        className: selectedClass,
      });
    }
  };

  if (loading) return <div className="loading">Cargando lista...</div>;
  if (!selectedClass) return <div className="empty">Selecciona una clase primero</div>;

  return (
    <div className="att-list">
      {members.map(m => (
        <div
          key={m.id}
          className={`att-card ${attendanceMap[m.id] ? 'is-present' : ''}`}
          onClick={() => toggleStatus(m.id)}
        >
          <div className="member-info">
            {m.photoUrl && (
              <div className="att-avatar">
                <img src={m.photoUrl} alt="profile" />
              </div>
            )}
            <span className="member-name">
              {m.nombreCompleto || `${m.nombre} ${m.apellido}`}
            </span>
          </div>
          <div className="check-indicator">
            <Check size={18} strokeWidth={3} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberAttendance;