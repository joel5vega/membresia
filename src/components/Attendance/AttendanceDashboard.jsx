import React, { useEffect, useState } from 'react';
import { classAttendanceService } from '../../services/classAttendanceService';

const PRIMARY = '#A63232';
const SECONDARY = '#E68A3E';
const BG = '#F9F7F5';

const buildSummary = (records) => {
  const summary = {
    totalAsistencia: 0,
    totalVisitantes: 0,
    porClase: {}
  };

  for (const r of records) {
    summary.totalAsistencia += r.conteo.total;
    summary.totalVisitantes += r.conteo.visitantes;

    if (!summary.porClase[r.clase_id]) {
      summary.porClase[r.clase_id] = { total: 0, visitantes: 0 };
    }
    summary.porClase[r.clase_id].total += r.conteo.total;
    summary.porClase[r.clase_id].visitantes += r.conteo.visitantes;
  }
  return summary;
};

const AttendanceDashboard = ({ onBack }) => {
  const today = new Date();
  const [periodoMes, setPeriodoMes] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
  );
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await classAttendanceService.getAttendanceByMonth(periodoMes);
        setRecords(res);
        setSummary(buildSummary(res));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [periodoMes]);

  const labels = Array.from(
    new Set(records.map(r => r.fecha.toDate ? r.fecha.toDate().getDate() : new Date(r.fecha.seconds * 1000).getDate())),
  ).sort((a, b) => a - b);

  const totalPorDia = labels.map(dia =>
    records
      .filter(r => {
        const date = r.fecha.toDate ? r.fecha.toDate() : new Date(r.fecha.seconds * 1000);
        return date.getDate() === dia;
      })
      .reduce((acc, r) => acc + r.conteo.total, 0),
  );

  const visitantesPorDia = labels.map(dia =>
    records
      .filter(r => {
        const date = r.fecha.toDate ? r.fecha.toDate() : new Date(r.fecha.seconds * 1000);
        return date.getDate() === dia;
      })
      .reduce((acc, r) => acc + r.conteo.visitantes, 0),
  );

  return (
    <div style={{
      minHeight: '100vh', background: BG, padding: '16px 12px 32px',
      fontFamily: 'Inter, Roboto, system-ui, sans-serif'
    }}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {onBack && (
            <button onClick={onBack} style={{
              background: 'transparent', border: 'none', fontSize: 24,
              cursor: 'pointer', color: PRIMARY
            }}>←</button>
          )}
          <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>
            Dashboard de Asistencia
          </h1>
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={{ fontSize: 12, marginRight: 8 }}>Mes</label>
          <input type="month" value={periodoMes} onChange={e => setPeriodoMes(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white'
          }} />
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#777' }}>Cargando...</div>
      ) : summary ? (
        <>
          <section style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16
          }}>
            <div style={{
              background: PRIMARY, borderRadius: 16, padding: 14, color: 'white'
            }}>
              <div style={{ fontSize: 11 }}>Asistencia del mes</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{summary.totalAsistencia}</div>
            </div>
            <div style={{
              background: SECONDARY, borderRadius: 16, padding: 14, color: 'white'
            }}>
              <div style={{ fontSize: 11 }}>Visitantes del mes</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{summary.totalVisitantes}</div>
            </div>
          </section>

          <section style={{
            background: 'white', borderRadius: 16, padding: 16, marginBottom: 16,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              Asistencia vs Visitantes
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: `repeat(${Math.min(labels.length, 7)}, 1fr)`,
              gap: 4, fontSize: 10
            }}>
              {labels.slice(0, 7).map((dia, idx) => (
                <div key={dia} style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: 4 }}>{dia}</div>
                  <div style={{
                    height: 40, display: 'flex', flexDirection: 'column-reverse',
                    gap: 2, alignItems: 'center'
                  }}>
                    <div style={{
                      width: 6, height: Math.min(36, totalPorDia[idx]),
                      borderRadius: 999, background: PRIMARY
                    }} />
                    <div style={{
                      width: 6, height: Math.min(36, visitantesPorDia[idx]),
                      borderRadius: 999, background: SECONDARY
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, fontSize: 10
            }}>
              <span>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                  background: PRIMARY, marginRight: 4
                }} />
                Asistencia
              </span>
              <span>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                  background: SECONDARY, marginRight: 4
                }} />
                Visitantes
              </span>
            </div>
          </section>

          <section style={{
            background: 'white', borderRadius: 16, padding: 16,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 8
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Clases</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(summary.porClase).map(([clase, data]) => (
                <div key={clase} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', borderRadius: 12, background: BG
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{clase}</div>
                    <div style={{ fontSize: 11, color: '#777' }}>
                      Visitantes: {data.visitantes}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: PRIMARY }}>
                    {data.total}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: '#777' }}>
          No hay datos para este mes
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
