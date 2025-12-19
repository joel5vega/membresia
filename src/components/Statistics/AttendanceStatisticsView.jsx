import React, { useState, useEffect } from 'react';
import { 
  getWeeklyStatistics, 
  getMonthlyStatistics, 
  getQuarterlyStatistics, 
  getYearlyStatistics 
} from '../../services/attendanceStatisticsService';
import {
  getDonesEspirituales,
  getEstadoCivil,
  getClassStatistics,
  getBaptizedCount
} from '../../services/memberStatisticsService';

import PeriodSelector from './PeriodSelector';
import StatisticsCard from './StatisticsCard'; 
import './AttendanceStatisticsView.css';

const AttendanceStatisticsView = () => {
                            
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [baptizedStats, setBaptizedStats] = useState(null);
  const [giftStats, setGiftStats] = useState(null);
  const [maritalStats, setMaritalStats] = useState(null);


  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      
              console.log('=== INICIANDO FETCH ESTADISTICAS ===');
      try {
        let data;
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        
        switch (selectedPeriod) {
          case 'weekly':
                    console.log('CASO: weekly - Llamando getWeeklyStatistics con:', selectedDate);

            data = await getWeeklyStatistics(selectedDate);
                    console.log('DATA RETORNADA de getWeeklyStatistics:', data);
            break;
          case 'monthly':
            data = await getMonthlyStatistics(selectedDate);
            break;
          case 'quarterly':
            data = await getQuarterlyStatistics(year, month);
            break;
          case 'yearly':
            data = await getYearlyStatistics(year);
            break;
          default:
            throw new Error('Período no válido');
        }
        setStatistics(data);
              console.log('Datos de estadísticas:', data);
                      console.log('classesByName:', data?.classesByName, 'Keys:', Object.keys(data?.classesByName || {}));
                      console.log('Type of classesByName:', typeof data?.classesByName, 'Is it object?', data?.classesByName instanceof Object);
                      console.log('classesByName JSON:', JSON.stringify(data?.classesByName));
                      
        
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Error cargando estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedPeriod, selectedDate]);

  // Fetch member statistics when class is selected
  useEffect(() => {
    if (selectedClass) {
getClassStatistics(selectedClass).then(stats => {
        if (stats) {
          setBaptizedStats({
            'Bautizados': stats.baptizedCount,
            'No Bautizados': stats.unBaptizedCount
          });
          setGiftStats(stats.donesEspirituales || {});
          setMaritalStats(stats.estadoCivil || {});
        }
      }).catch(err => console.error('Error fetching class statistics:', err));
    }  }, [selectedClass]);

  // DEBUG: Log the stats
  console.log('baptizedStats:', baptizedStats);
  console.log('giftStats:', giftStats);
  console.log('maritalStats:', maritalStats);
  console.log('selectedClass:', selectedClass);


  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (loading && !statistics) {
    return (
      <div className="attendance-stats-container">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-stats-container error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="attendance-stats-container">
        <div className="no-data">No hay datos disponibles</div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPeriodLabel = () => {
    if (selectedPeriod === 'weekly') {
      return `Semana del ${formatDate(statistics.startDate)} al ${formatDate(statistics.endDate)}`;
    } else if (selectedPeriod === 'monthly') {
      const month = new Date(statistics.startDate).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });
      return `Mes de ${month}`;
    } else if (selectedPeriod === 'quarterly') {
      return `Trimestre ${statistics.quarter || 'Actual'} ${statistics.year || selectedDate.getFullYear()}`;
    } else {
      return `Año ${statistics.year || selectedDate.getFullYear()}`;
    }
  };

  return (
    <div className="attendance-stats-container">
      <h1>Estadísticas de Asistencia</h1>
      
      <div className="period-selector-wrapper">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="period-label">{getPeriodLabel()}</div>

      <div className="stats-summary">
        <div className="summary-card overall">
          <h3>Resumen General</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="label">Total Sesiones:</span>
              <span className="value">{statistics.totalSessions?.toLocaleString() || 0}</span>
            </div>
            <div className="stat-item">
              <span className="label">Tasa de Asistencia:</span>
              <span className="value percentage">
                {statistics.overallAttendanceRate?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(statistics.overallAttendanceRate || 0, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="statistics-section">
        
        <h2>Estadísticas por Clase</h2>
{statistics?.classesByName ? (
          <div className="stats-grid">
                                {Object.entries(statistics.classesByName).map(([className, classStats]) => (
            
            <div className="class-card">
                  <h4>{className}</h4>
                  <div className="class-stats">
                    <div><span>Total Sesiones:</span> <span>{classStats.totalSessions}</span></div>
                    <div><span>Presentes:</span> <span>{classStats.totalAttendances}</span></div>
                    <div><span>Tasa de Asistencia:</span> <span>{classStats.attendanceRate.toFixed(1)}%</span></div>
                  </div>
                </div>
                                    ))}
          </div>
        ) : (
          <p className="no-data">Las estadísticas por clase se están procesando para este período</p>
        )}
              </div>
      <div className="statistics-section">
        <h2>Estadísticas por Miembro</h2>
        {statistics.memberStats?.length > 0 ? (
          <div className="members-table-wrapper">
            <table className="members-table">
          <thead>
                <tr>                  <th>Miembro</th>
                  <th>Presentes</th>                  <th>Ausentes</th>                  <th>Justificado</th>                  <th>Tasa de Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {statistics.memberStats.map((memberStat) => (                  <tr key={memberStat.memberId}>
                <td className="member-name">{(memberStat.memberName || '').replace(/^Member-/, '').replace(/-\d+$/, '')}</td>                    <td className="present">{memberStat.totalAttendances?.toLocaleString() || 0}</td>
                    <td className="absent">{memberStat.totalAbsences?.toLocaleString() || 0}</td>
                    <td className="justified">{memberStat.totalJustified?.toLocaleString() || 0}</td>
                    <td className="attendance-rate">
                      <span className="percentage">
                        {memberStat.attendanceRate?.toFixed(1) || 0}%
                      </span>
                      <div className="mini-progress">
                        <div 
                          className="mini-progress-fill" 
                          style={{ 
                            width: `${Math.min(memberStat.attendanceRate || 0, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

      {/* Miembro Estadísticas Section */}
      <div className="members-statistics-section">
        <h2>Estadísticas Adicionales de Miembros</h2>
        <div className="class-selector">
          <label htmlFor="class-select">Seleccionar Clase: </label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: '8px', marginLeft: '10px' }}
          >
                            {statistics && Object.keys(statistics.classesByName || {}).map(className => (
                  <option key={className} value={className}>{className}</option>
                ))
                

            }
                        </select>
                                </div>
                                
        
        {selectedClass && (
          <div className="member-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
{Object.entries(baptizedStats|| {}).map(([key, value]) => (
              <StatisticsCard key={key} title={key} value={value} stats={{[key]: value}} />
                        ))}

{Object.entries(giftStats|| {}).map(([key, value]) => (
              <StatisticsCard key={key} title={key} value={value} stats={{[key]: value}} />
                        ))}

{Object.entries(maritalStats|| {}).map(([key, value]) => (
              <StatisticsCard key={key} title={key} value={value} stats={{[key]: value}} />
                        ))}

          </div>
        )}
      </div>

          </div>
        ) : (
          <p className="no-data">No hay datos de miembros para este período</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceStatisticsView;
