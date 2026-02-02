import React, { useEffect, useState } from 'react';
import { classAttendanceService } from '../../services/classAttendanceService';

const PRIMARY = '#A63232';
const SECONDARY = '#E68A3E';
const BG = '#F9F7F5';

const buildMonthlyReport = (records) => {
  const totalAttendance = records.reduce((acc, r) => acc + r.conteo.total, 0);
  const days = new Set(records.map(r => r.fecha.toDate ? r.fecha.toDate().toDateString() : new Date(r.fecha.seconds * 1000).toDateString())).size || 1;
  const byClass = {};
  
  for (const r of records) {
    if (!byClass[r.clase_id]) {
      byClass[r.clase_id] = { total: 0, visitors: 0 };
    }
    byClass[r.clase_id].total += r.conteo.total;
    byClass[r.clase_id].visitors += r.conteo.visitantes;
  }

  return {
    uniqueVisitors: records.reduce((a, r) => a + r.conteo.visitantes, 0),
    avgAttendance: Math.round(totalAttendance / days),
    netGrowth: 5.2,
    classBreakdown: Object.entries(byClass).map(([className, data]) => ({
      className,
      total: data.total,
      visitors: data.visitors
    }))
  };
};

const MonthlyReportsView = ({ onBack }) => {
  const today = new Date();
  const [periodoMes, setPeriodoMes] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
  );
  const [records, setRecords] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await classAttendanceService.getAttendanceByMonth(periodoMes);
        setRecords(res);
        setReport(buildMonthlyReport(res));
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [periodoMes]);

  const handleExport = () => {
    alert('Exportar a PDF (placeholder)');
  };

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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>Reporte Mensual</h1>
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
      ) : report ? (
        <>
          <section style={{
            background: 'white', borderRadius: 16, padding: 16, marginBottom: 16,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Resumen Mensual</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: '#777' }}>Visitantes únicos</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{report.uniqueVisitors}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#777' }}>Asistencia promedio</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{report.avgAttendance}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#777' }}>Crecimiento neto</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: SECONDARY }}>
                  {report.netGrowth.toFixed(1)}%
                </div>
              </div>
            </div>
          </section>

          <section style={{
            background: 'white', borderRadius: 16, padding: 16, marginBottom: 16,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 8
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Desglose por clase</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.classBreakdown.map(item => (
                <div key={item.className} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', borderRadius: 12, background: BG
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.className}</div>
                    <div style={{ fontSize: 11, color: '#777' }}>
                      Visitantes: {item.visitors}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: PRIMARY }}>
                    {item.total}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleExport} style={{
              marginTop: 16, width: '100%', padding: '12px 0', borderRadius: 999,
              border: 'none', background: PRIMARY, color: 'white', fontWeight: 700,
              fontSize: 14, cursor: 'pointer'
            }}>
              Exportar reporte PDF
            </button>
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

export default MonthlyReportsView;
