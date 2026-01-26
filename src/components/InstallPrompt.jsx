import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevenir que el mini-infobar aparezca en móvil
      e.preventDefault();
      // Guardar el evento para usarlo después
      setDeferredPrompt(e);
      // Mostrar nuestro prompt personalizado
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);

    // Limpiar el prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage para no molestar al usuario
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // No mostrar si ya fue descartado
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <button 
          className="install-prompt-close"
          onClick={handleDismiss}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        
        <div className="install-prompt-icon">
          <Download size={32} />
        </div>
        
        <div className="install-prompt-text">
          <h3>Instalar IglesiaFlow</h3>
          <p>Instala la app en tu dispositivo para acceder rápidamente y trabajar sin conexión</p>
        </div>
        
        <button 
          className="install-prompt-button"
          onClick={handleInstall}
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;