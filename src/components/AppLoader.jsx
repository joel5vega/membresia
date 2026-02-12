import React, { useMemo } from 'react';
import MembresiaIcon from '../assets/membresia-icon.png';
import './AppLoader.css';

const VERSES = [
  { text: 'Todo lo puedo en Cristo que me fortalece.', ref: 'Filipenses 4:13' },
  { text: 'Jehová es mi pastor; nada me faltará.', ref: 'Salmos 23:1' },
  { text: 'La paz de Dios, que sobrepasa todo entendimiento.', ref: 'Filipenses 4:7' },
  { text: 'Pon en manos del Señor todas tus obras.', ref: 'Proverbios 16:3' },
  { text: 'Yo estoy con vosotros todos los días.', ref: 'Mateo 28:20' },
  { text: 'Sed fuertes y valientes, no temáis.', ref: 'Josué 1:9' },
];

const AppLoader = ({ message = 'Cargando comunidad...' }) => {
  const verse = useMemo(
    () => VERSES[Math.floor(Math.random() * VERSES.length)],
    []
  );

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="logo-pulse-wrapper">
          <img
            src={MembresiaIcon}
            alt="Canaán Logo"
            className="loader-logo"
          />
        </div>

        <div className="loading-bar-container">
          <div className="loading-bar-fill" />
        </div>

        <div className="verse-container">
          <p className="verse-text">"{verse.text}"</p>
          <span className="verse-ref">{verse.ref}</span>
        </div>

        <p className="loader-status">Sincronizando comunidad...</p>
        <p className="loader-text">{message}</p>
      </div>
    </div>
  );
};

export default AppLoader;
