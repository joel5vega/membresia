import React, { useState, useEffect } from 'react';
import { memberService, attendanceService } from '../services';
import { Check, Users } from 'lucide-react';
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
    const all = await memberService.getMembers();
    setMembers(all.filter(m => m.clase === selectedClass));
    
    const savedAtt = await attendanceService.getAttendanceByClassAndDate(selectedClass, new Date(date));
    const map = {};
    savedAtt.forEach(a => { map[a.memberId] = a.status === 'present'; });
    setAttendanceMap(map);
    setLoading(false);
  };

  const toggleStatus = async (mId) => {
    const newStatus = !attendanceMap[mId];
    setAttendanceMap(prev => ({ ...prev, [mId]: newStatus }));
    // Aquí llamas a tu servicio para guardar en tiempo real
    await attendanceService.saveAttendance({
      memberId: mId,
      date: new Date(date),
      status: newStatus ? 'present' : 'absent',
      className: selectedClass
    });
  };

  if (loading) return <div className="loading">Cargando lista...</div>;
  if (!selectedClass) return <div className="empty">Selecciona una clase primero</div>;

  return (
    <div className="att-list">
      {members.map(m => (
        <div key={m.id} className={`att-card ${attendanceMap[m.id] ? 'is-present' : ''}`} onClick={() => toggleStatus(m.id)}>
          <div className="member-info">
            {m.photoUrl && (
  <div className="att-avatar">
    <img src={m.photoUrl} alt="profile" />
  </div>
)}
            <span className="member-name">{m.nombreCompleto || `${m.nombre} ${m.apellido}`}</span>
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