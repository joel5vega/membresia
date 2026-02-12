import React, { useState, useEffect } from "react";
import { Cake, Phone, Mail } from "lucide-react";
import { memberService } from "../services/memberService";
import "./BirthdaysView.css";

const BirthdaysView = () => {
  const [members, setMembers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [birthdaysByMonth, setBirthdaysByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const allMembers = await memberService.getMembers();
        setMembers(allMembers);
        organizeBirthdaysByMonth(allMembers);
      } catch (err) {
        setError("Error loading members: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const organizeBirthdaysByMonth = (membersList) => {
    const grouped = {};

    membersList.forEach((member) => {
      if (member.fechaNacimiento) {
        try {
          const date = new Date(member.fechaNacimiento);
          const month = date.getUTCMonth() + 1; // 1-12

          if (!grouped[month]) grouped[month] = [];

          grouped[month].push({
            ...member,
            dayOfMonth: date.getUTCDate(),
          });
        } catch (e) {
          console.error("Invalid date for member:", member.id, member.fechaNacimiento);
        }
      }
    });

    Object.keys(grouped).forEach((month) => {
      grouped[month].sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    });

    setBirthdaysByMonth(grouped);
  };

  const getMonthBirthdays = () => birthdaysByMonth[selectedMonth] || [];

  const getBirthdayCount = (month) =>
    (birthdaysByMonth[month] || []).length;

  const getAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate())
    ) {
      age--;
    }
    return age;
  };

  const currentBirthdays = getMonthBirthdays();

  return (
    <div className="birthdays-view">
      <div className="birthdays-header">
        <h1>Cumpleaños</h1>
       
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando miembros...</div>
      ) : (
        <>
          {/* Selector de meses compacto */}
          <div className="month-selector">
            <div className="month-buttons month-selector-scroll">
              {monthNames.map((month, index) => {
                const monthNum = index + 1;
                const count = getBirthdayCount(monthNum);
                return (
                  <button
                    key={monthNum}
                    className={`month-button month-chip ${
                      selectedMonth === monthNum ? "active" : ""
                    } ${count > 0 ? "has-birthdays" : ""}`}
                    onClick={() => setSelectedMonth(monthNum)}
                    title={`${month}: ${count} cumpleaños`}
                  >
                    <span className="month-name m-name">
                      {month.substring(0, 3)}
                    </span>
                    {count > 0 && (
                      <span className="birthday-badge m-count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Versión de tarjetas grande (desktop) */}
          <div className="birthdays-container birthdays-desktop">
            <div className="birthdays-header-info">
              <h2>{monthNames[selectedMonth - 1]}</h2>
              <p className="count-info">
                {currentBirthdays.length} cumpleaño
                {currentBirthdays.length !== 1 ? "s" : ""} este mes
              </p>
            </div>

            {currentBirthdays.length > 0 ? (
              <div className="birthdays-grid">
                {currentBirthdays.map((member) => {
                  const birthDate = new Date(member.fechaNacimiento);
                  const today = new Date();
                  const isUpcoming =
                    birthDate.getMonth() === today.getUTCMonth() &&
                    birthDate.getUTCDate() >= today.getUTCDate();

                  const fullName =
                    member.nombreCompleto ||
                    `${member.nombre || ""} ${member.apellido || ""}`.trim();

                  return (
                    <div
                      key={member.id}
                      className={`birthday-card ${
                        isUpcoming ? "upcoming" : ""
                      }`}
                    >
                      <div className="birthday-card-content">
                        <div className="birthday-date">
                          <span className="day">{member.dayOfMonth}</span>
                          <span className="month">
                            de {monthNames[selectedMonth - 1].toLowerCase()}
                          </span>
                        </div>
                        <div className="member-info">
                          <h3>{fullName}</h3>

                          {getAge(member.fechaNacimiento) && (
                            <p className="age-badge">
                              <Cake size={12} /> {member.dayOfMonth} / {selectedMonth}
                            </p>
                          )}

                          {member.celular && (
                            <p className="contact">
                              <i className="phone-icon">📱</i> {member.celular}
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

          {/* Versión compacta (móvil / tarjetas pequeñas) */}
          <div className="birthdays-compact-grid">
            {currentBirthdays.length > 0 ? (
              currentBirthdays.map((member) => {
                const fullName =
                  member.nombreCompleto ||
                  `${member.nombre || ""} ${member.apellido || ""}`.trim();

                return (
                  <div key={member.id} className="bday-card-compact">
                    <div className="bday-day-tag">{member.dayOfMonth}</div>

                    <div className="bday-avatar-sm">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt="profile" />
                      ) : (
                        <div className="bday-avatar-placeholder">
                          {(member.nombre || fullName || "?").charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="bday-details-sm">
                      <h3 className="bday-name-sm">{fullName}</h3>

                      {getAge(member.fechaNacimiento) && (
                        <div className="bday-age-sm">
                          <Cake size={12} /> {member.dayOfMonth} / {selectedMonth}
                        </div>
                      )}

                      <div className="bday-actions-sm">
                        {member.celular && (
                          <a
                            href={`tel:${member.celular}`}
                            className="action-icon"
                            title="Llamar"
                          >
                            <Phone size={14} />
                          </a>
                        )}
                        {member.correo && (
                          <a
                            href={`mailto:${member.correo}`}
                            className="action-icon"
                            title="Enviar correo"
                          >
                            <Mail size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-bdays">Sin celebraciones este mes 🎈</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BirthdaysView;
