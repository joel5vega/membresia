import React, { useState, useEffect, useMemo } from "react";
import { Phone, Mail } from "lucide-react";
import { memberService } from "../services/memberService";
import { getStatus } from "../services/constellationSettings";
import { parseBirth } from "../genograma/birthdate";
import { isAvanzada } from "../genograma/churches";
import { norm, fullName as fullNameOf } from "../genograma/names";
import "./BirthdaysView.css";

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const BirthdaysView = () => {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showAv, setShowAv] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [clase, setClase] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([memberService.getMembers(), getStatus().catch(() => ({}))])
      .then(([m, s]) => { setMembers(m); setStatus(s); })
      .catch((err) => { setError("Error al cargar miembros: " + err.message); console.error(err); })
      .finally(() => setLoading(false));
  }, []);

  // Clases disponibles según los filtros de avanzadas (para no ofrecer opciones ocultas)
  const clases = useMemo(
    () => [...new Set(members.filter((m) => showAv || !isAvanzada(m)).map((m) => m.clase).filter(Boolean))].sort(),
    [members, showAv]
  );

  // Miembros que pasan los filtros
  const visible = useMemo(() => members.filter((m) => {
    const st = status[norm(fullNameOf(m))];
    if (st === "fallecido") return false;
    if (st === "no-asiste" && !showInactive) return false;
    if (m.clase === "Inactive" && !showInactive) return false;
    if (isAvanzada(m) && !showAv) return false;
    if (clase !== "all" && m.clase !== clase) return false;
    return true;
  }), [members, status, showAv, showInactive, clase]);

  // { 1: [...], 2: [...] } leyendo día y mes del texto (sin Date)
  const byMonth = useMemo(() => {
    const grouped = {};
    visible.forEach((m) => {
      const { m: mm, d } = parseBirth(m.fechaNacimiento);
      const month = Number(mm), day = Number(d);
      if (!month || !day || month > 12) return;
      (grouped[month] ||= []).push({ ...m, dayOfMonth: day });
    });
    Object.values(grouped).forEach((l) => l.sort((a, b) => a.dayOfMonth - b.dayOfMonth));
    return grouped;
  }, [visible]);

  const current = byMonth[selectedMonth] || [];
  const total = Object.values(byMonth).reduce((s, l) => s + l.length, 0);
  const today = new Date();
  const isToday = (day) => selectedMonth === today.getMonth() + 1 && day === today.getDate();

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
          {/* Filtros */}
          <div className="bd-filters">
            <button className={`mt-chip ${showAv ? "is-on" : ""}`} onClick={() => { setShowAv((v) => !v); setClase("all"); }}>
              {showAv ? "✓ " : ""}Ver avanzadas
            </button>
            <button className={`mt-chip ${showInactive ? "is-on" : ""}`} onClick={() => setShowInactive((v) => !v)}>
              {showInactive ? "✓ " : ""}Ver no asisten
            </button>
            <select className="mt-input bd-select" value={clase} onChange={(e) => setClase(e.target.value)}>
              <option value="all">Todas las clases</option>
              {clases.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Meses */}
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

          <p className="bd-summary">
            {monthNames[selectedMonth - 1]}: {current.length} cumpleaño{current.length !== 1 ? "s" : ""} · {total} en el año
          </p>

          {/* Tarjetas compactas */}
          <div className="birthdays-compact-grid">
            {current.length ? (
              current.map((m) => (
                <div key={m.id} className={`bday-card-compact ${isToday(m.dayOfMonth) ? "is-today" : ""}`}>
                  <div className="bday-day-tag">{m.dayOfMonth}</div>

                  <div className="bday-avatar-sm">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt="" loading="lazy" />
                    ) : (
                      <div className="bday-avatar-placeholder">{(m.nombre || fullNameOf(m) || "?").charAt(0)}</div>
                    )}
                  </div>

                  <div className="bday-details-sm">
                    <h3 className="bday-name-sm" title={fullNameOf(m)}>{fullNameOf(m)}</h3>
                    <div className="bday-age-sm">{m.dayOfMonth} de {monthNames[selectedMonth - 1].toLowerCase()}</div>
                    <div className="bday-actions-sm">
                      {m.celular && <a href={`tel:${m.celular}`} className="action-icon" title={m.celular}><Phone size={16} /></a>}
                      {m.correo && <a href={`mailto:${m.correo}`} className="action-icon" title="Enviar correo"><Mail size={16} /></a>}
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