import React, { useState, useEffect, useMemo } from "react";
import { Cake, Phone, Mail } from "lucide-react";
import { memberService } from "../services/memberService";
import { parseBirth } from "../genograma/birthdate";
import "./BirthdaysView.css";

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const fullName = (m) =>
  m.nombreCompleto || `${m.nombre || ""} ${m.apellido || ""}`.trim();

const BirthdaysView = () => {
  const [members, setMembers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    memberService.getMembers()
      .then(setMembers)
      .catch((err) => {
        setError("Error al cargar miembros: " + err.message);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // { 1: [...], 2: [...] } con día y mes leídos directo del texto (sin Date)
  const byMonth = useMemo(() => {
    const grouped = {};
    members.forEach((m) => {
      const { m: mm, d } = parseBirth(m.fechaNacimiento);
      const month = Number(mm);
      const day = Number(d);
      if (!month || !day || month > 12) return;
      (grouped[month] ||= []).push({ ...m, dayOfMonth: day });
    });
    Object.values(grouped).forEach((list) => list.sort((a, b) => a.dayOfMonth - b.dayOfMonth));
    return grouped;
  }, [members]);

  const current = byMonth[selectedMonth] || [];
  const today = new Date();
  const isUpcoming = (day) =>
    selectedMonth === today.getMonth() + 1 && day >= today.getDate();

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
          <div className="month-selector">
            <div className="month-buttons month-selector-scroll">
              {monthNames.map((name, i) => {
                const num = i + 1;
                const count = (byMonth[num] || []).length;
                return (
                  <button
                    key={num}
                    className={`month-button month-chip ${selectedMonth === num ? "active" : ""} ${count ? "has-birthdays" : ""}`}
                    onClick={() => setSelectedMonth(num)}
                    title={`${name}: ${count} cumpleaños`}
                  >
                    <span className="month-name m-name">{name.substring(0, 3)}</span>
                    {count > 0 && <span className="birthday-badge m-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Versión grande (escritorio) */}
          <div className="birthdays-container birthdays-desktop">
            <div className="birthdays-header-info">
              <h2>{monthNames[selectedMonth - 1]}</h2>
              <p className="count-info">
                {current.length} cumpleaño{current.length !== 1 ? "s" : ""} este mes
              </p>
            </div>

            {current.length ? (
              <div className="birthdays-grid">
                {current.map((m) => (
                  <div key={m.id} className={`birthday-card ${isUpcoming(m.dayOfMonth) ? "upcoming" : ""}`}>
                    <div className="birthday-card-content">
                      <div className="birthday-date">
                        <span className="day">{m.dayOfMonth}</span>
                        <span className="month">de {monthNames[selectedMonth - 1].toLowerCase()}</span>
                      </div>
                      <div className="member-info">
                        <h3>{fullName(m)}</h3>
                        {m.celular && (
                          <p className="contact"><i className="phone-icon">📱</i> {m.celular}</p>
                        )}
                      </div>
                    </div>
                    <div className="birthday-icon">🎂</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-birthdays">
                <p>No hay cumpleaños registrados para este mes</p>
              </div>
            )}
          </div>

          {/* Versión compacta (móvil) */}
          <div className="birthdays-compact-grid">
            {current.length ? (
              current.map((m) => (
                <div key={m.id} className="bday-card-compact">
                  <div className="bday-day-tag">{m.dayOfMonth}</div>

                  <div className="bday-avatar-sm">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt="" />
                    ) : (
                      <div className="bday-avatar-placeholder">{(m.nombre || fullName(m) || "?").charAt(0)}</div>
                    )}
                  </div>

                  <div className="bday-details-sm">
                    <h3 className="bday-name-sm">{fullName(m)}</h3>
                    <div className="bday-age-sm">
                      <Cake size={12} /> {m.dayOfMonth} / {selectedMonth}
                    </div>
                    <div className="bday-actions-sm">
                      {m.celular && (
                        <a href={`tel:${m.celular}`} className="action-icon" title="Llamar"><Phone size={14} /></a>
                      )}
                      {m.correo && (
                        <a href={`mailto:${m.correo}`} className="action-icon" title="Enviar correo"><Mail size={14} /></a>
                      )}
                    </div>
                  </div>
                </div>
              ))
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