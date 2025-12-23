import React from "react";
import "./SundaySchoolReportPage.css";
import { SundaySchoolReport } from "../types/sundaySchoolReport";

const mockReport: SundaySchoolReport = {
  logoText: "LOGO",
  churchName: "Iglesia Evangélica de Dios Boliviana 'Canaan'",
  reportTitle: "Informe de Escuela Dominical",
  reportDate: "21/12/2025",
  serviceName: "Escuela Dominical",
  location: "Canaan",
  adultos: { maestro: "Nombre", varones: 7, mujeres: 15, bebes: 0, total: 35, biblias: 31, ofrendas: 75.5 },
  jovCasados: { maestro: "", varones: 1, mujeres: 4, bebes: 0, total: 10, biblias: 5, ofrendas: 17 },
  jovenes: { maestro: "", varones: 7, mujeres: 2, bebes: 0, total: 9, biblias: 5, ofrendas: 9.5 },
  prejuveniles: { maestro: "", varones: 7, mujeres: 3, bebes: 0, total: 9, biblias: 4, ofrendas: 2 },
  exploradores: { maestro: "", varones: 1, mujeres: 4, bebes: 0, total: 10, biblias: 10, ofrendas: 3 },
  estrellitas: { maestro: "", varones: 2, mujeres: 3, bebes: 0, total: 5, biblias: 3, ofrendas: 0 },
  joyitas: { maestro: "", varones: 0, mujeres: 3, bebes: 0, total: 3, biblias: 0, ofrendas: 0 },
  subtotal: {
    maestros: 9,
    varones: 40,
    mujeres: 35,
    bebes: 1,
    total: 76,
    biblias: 58,
    ofrendas: 305,
  },
  numeroVisitas: 0,
  asistenciaFinal: 100,
  nuevosConvertidos: "",
  hermanosConPermiso: "",
  economico: {
    diezmos: 75.4,
    ofrendas: 108.5,
    ofrendaEspecial: 100,
    otros: 0,
    total: 1726.5,
  },
  limpieza: ["", "", "", "", "", ""],
  predica: {
    pastor: "Pr. Mario",
    tema: "Nombre del mensaje",
    textoBiblico: "Lucas 8:4-15",
  },
  jueves: { fecha: "Jueves", director: "", voces: "", ministerio: "" },
  domingo1: { fecha: "Domingo 1ra parte", director: "", voces: "", ministerio: "" },
  domingo2: { fecha: "Domingo 2da parte", director: "", voces: "", ministerio: "" },
  actividades: [
    { nombre: "Culto", fecha: "24/12/2025", hora: "19:00", participantes: "Iglesia", responsable: "Líder" },
  ],
  observaciones: "",
};

const SundaySchoolReportPage: React.FC = () => {
  const data = mockReport; // luego vendrá de Firestore

  return (
    <div className="report-root">
      {/* HEADER */}
      <header className="section header">
        <div className="logo-box">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt="Logo"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            data.logoText ?? "LOGO"
          )}
        </div>
        <div>
          <h1>{data.churchName}</h1>
          <h2>{data.reportTitle}</h2>
          <p>
            <span className="label">Fecha:</span> {data.reportDate} &nbsp;|&nbsp;
            <span className="label">Culto:</span> {data.serviceName} &nbsp;|&nbsp;
            <span className="label">Lugar:</span> {data.location}
          </p>
        </div>
      </header>

      {/* ASISTENCIA */}
      <section className="section">
        <h2>Asistencia</h2>
        <table>
          <thead>
            <tr>
              <th>Clase</th>
              <th>Maestro</th>
              <th>Varones</th>
              <th>Mujeres</th>
              <th>Bebés</th>
              <th>Total</th>
              <th>Biblias</th>
              <th>Ofrendas</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Adultos", data.adultos],
              ["Jov. casados", data.jovCasados],
              ["Jóvenes", data.jovenes],
              ["Prejuveniles", data.prejuveniles],
              ["Exploradores", data.exploradores],
              ["Estrellitas", data.estrellitas],
              ["Joyitas", data.joyitas],
            ].map(([label, cls]) => {
              const c = cls as any;
              return (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{c.maestro}</td>
                  <td>{c.varones}</td>
                  <td>{c.mujeres}</td>
                  <td>{c.bebes}</td>
                  <td>{c.total}</td>
                  <td>{c.biblias}</td>
                  <td>{c.ofrendas}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="label">Subtotal</td>
              <td>{data.subtotal.maestros}</td>
              <td>{data.subtotal.varones}</td>
              <td>{data.subtotal.mujeres}</td>
              <td>{data.subtotal.bebes}</td>
              <td>{data.subtotal.total}</td>
              <td>{data.subtotal.biblias}</td>
              <td>{data.subtotal.ofrendas}</td>
            </tr>
            <tr>
              <td className="label">N° de visitas</td>
              <td colSpan={2}>{data.numeroVisitas}</td>
              <td className="label">Asist. final</td>
              <td colSpan={4}>{data.asistenciaFinal}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* CONVERTIDOS / PERMISOS */}
      <section className="section flex-row">
        <div className="flex-col">
          <div className="label">Nuevos convertidos (nombres):</div>
          <textarea value={data.nuevosConvertidos} readOnly />
        </div>
        <div className="flex-col">
          <div className="label">Hnos(as) con permisos:</div>
          <textarea value={data.hermanosConPermiso} readOnly />
        </div>
      </section>

      {/* ECONÓMICO + LIMPIEZA */}
      <section className="section flex-row">
        <div className="flex-col">
          <h2>Informe económico</h2>
          <table>
            <thead>
              <tr>
                <th>Diezmos</th>
                <th>Ofrendas</th>
                <th>Ofr. especial</th>
                <th>Otros</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.economico.diezmos}</td>
                <td>{data.economico.ofrendas}</td>
                <td>{data.economico.ofrendaEspecial}</td>
                <td>{data.economico.otros}</td>
                <td>{data.economico.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex-col">
          <h2>Limpieza</h2>
          <ol>
            {data.limpieza.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* PREDICACIÓN */}
      <section className="section">
        <h2>Predicación</h2>
        <p>
          <span className="label">Pastor/Hermano(a):</span> {data.predica.pastor}
        </p>
        <p>
          <span className="label">Tema del mensaje:</span> {data.predica.tema}
        </p>
        <p>
          <span className="label">Texto bíblico:</span> {data.predica.textoBiblico}
        </p>
      </section>

      {/* DIRECTORES DE CULTO */}
      <section className="section">
        <h2>Directores de culto</h2>
        <table>
          <thead>
            <tr>
              <th>Día/fecha</th>
              <th>Director</th>
              <th>Voces</th>
              <th>Ministerio</th>
            </tr>
          </thead>
          <tbody>
            {[data.jueves, data.domingo1, data.domingo2].map((d, i) => (
              <tr key={i}>
                <td>{d.fecha}</td>
                <td>{d.director}</td>
                <td>{d.voces}</td>
                <td>{d.ministerio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ACTIVIDADES */}
      <section className="section">
        <h2>Actividades / invitaciones</h2>
        <table>
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Día/fecha</th>
              <th>Hora</th>
              <th>Participantes</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td>{a.nombre}</td>
                <td>{a.fecha}</td>
                <td>{a.hora}</td>
                <td>{a.participantes}</td>
                <td>{a.responsable}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="label">Observaciones:</p>
        <textarea value={data.observaciones} readOnly />
      </section>
    </div>
  );
};

export default SundaySchoolReportPage;
