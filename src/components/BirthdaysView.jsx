import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import './BirthdaysView.css';

const BirthdaysView = () => {
  const [members, setMembers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [birthdaysByMonth, setBirthdaysByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Load members and organize by birthday month
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const allMembers = await memberService.getMembers();
        setMembers(allMembers);
        organizeBirthdaysByMonth(allMembers);
      } catch (err) {
        setError('Error loading members: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Organize members by their birthday month
  const organizeBirthdaysByMonth = (membersList) => {
    const grouped = {};
    
    membersList.forEach(member => {
      if (member.fechaNacimiento) {
        try {
          const date = new Date(member.fechaNacimiento);
          const month = date.getMonth() + 1; // 1-12
          
          if (!grouped[month]) {
            grouped[month] = [];
          }
          
          grouped[month].push({
            ...member,
            dayOfMonth: date.getDate()
          });
        } catch (e) {
          console.error('Invalid date for member:', member.id, member.fechaNacimiento);
        }
      }
    });

    // Sort each month's birthdays by day
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    });

    setBirthdaysByMonth(grouped);
  };

  // Get birthdays for the selected month
  const getMonthBirthdays = () => {
    return birthdaysByMonth[selectedMonth] || [];
  };

  // Get number of birthdays in a month
  const getBirthdayCount = (month) => {
    return (birthdaysByMonth[month] || []).length;
  };

  // Calculate age from birth date
const getAge = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const today = new Date();
  const birthDate = new Date(fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

  const currentBirthdays = getMonthBirthdays();

  return (
    <div className="birthdays-view">
      <div className="birthdays-header">
        <h1>Cumpleaños del Mes</h1>
        <p className="subtitle">Celebra con los miembros de nuestra comunidad</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando miembros...</div>
      ) : (
        <>
          {/* Month Selector */}
          <div className="month-selector">
            <div className="month-buttons">
              {monthNames.map((month, index) => {
                const monthNum = index + 1;
                const count = getBirthdayCount(monthNum);
                return (
                  <button
                    key={monthNum}
                    className={`month-button ${selectedMonth === monthNum ? 'active' : ''} ${count > 0 ? 'has-birthdays' : ''}`}
                    onClick={() => setSelectedMonth(monthNum)}
                    title={`${month}: ${count} cumpleaños`}
                  >
                    <span className="month-name">{month.substring(0, 3)}</span>
                    {count > 0 && <span className="birthday-badge">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Birthdays List */}
          <div className="birthdays-container">
            <div className="birthdays-header-info">
              <h2>{monthNames[selectedMonth - 1]}</h2>
              <p className="count-info">
                {currentBirthdays.length} cumpleaño{currentBirthdays.length !== 1 ? 's' : ''} este mes
              </p>
            </div>

            {currentBirthdays.length > 0 ? (
              <div className="birthdays-grid">
                {currentBirthdays.map(member => {
                  const birthDate = new Date(member.fechaNacimiento);
                  const today = new Date();
                  const isUpcoming = 
                    birthDate.getMonth() === today.getMonth() &&
                    birthDate.getDate() >= today.getDate();

                  return (
                    <div
                      key={member.id}
                      className={`birthday-card ${isUpcoming ? 'upcoming' : ''}`}
                    >
                      <div className="birthday-card-content">
                        <div className="birthday-date">
                          <span className="day">{member.dayOfMonth}</span>
                          <span className="month">de {monthNames[selectedMonth - 1].toLowerCase()}</span>
                        </div>
                        <div className="member-info">
                          <h3>{member.nombreCompleto || `${member.nombre || ''} ${member.apellido || ''}`.trim()}</h3>
                                        {getAge(member.fechaNacimiento) && (
                                                          <p className="age-badge">
                                                                              🎂 {getAge(member.fechaNacimiento)} años
                                                                                              </p>
                                                                                                            )}
                          {member.celular && (
                            <p className="contact">
                              <i className="phone-icon">📱</i> {member.celular}
                            </p>
                          )}
                          {member.correo && (
                            <p className="contact">
                              <i className="email-icon">✉️</i> {member.correo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="birthday-icon">🎂</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-birthdays">
                <p>No hay cumpleaños registrados para este mes</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BirthdaysView;