import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { migrateDataToChurch } from '../utils/migrateData';

const MigrationPage = () => {
  const { user } = useAuth();
  const [churchName, setChurchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleMigration = async () => {
    if (!churchName.trim()) {
      alert('Por favor ingresa el nombre de tu iglesia');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const migrationResult = await migrateDataToChurch(
        user.uid,
        user.email,
        churchName
      );

      setResult(migrationResult);

      if (migrationResult.success) {
        alert('¡Migración completada! Recargando la página...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error en migración:', error);
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔄 Migración de Datos</h1>
      <p>
        Para usar la nueva estructura de iglesias, necesitamos migrar tus datos
        existentes.
      </p>

      <div style={{ marginTop: '30px' }}>
        <label>
          <strong>Nombre de tu Iglesia:</strong>
        </label>
        <input
          type="text"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          placeholder="Ej: Iglesia Evangélica Central"
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>
          <strong>Email del administrador:</strong> {user?.email}
        </p>
        <p>
          <strong>User ID:</strong> {user?.uid}
        </p>
      </div>

      <button
        onClick={handleMigration}
        disabled={loading || !churchName.trim()}
        style={{
          marginTop: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Migrando datos...' : 'Iniciar Migración'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '5px',
          }}
        >
          <h3>{result.success ? '✅ Éxito' : '❌ Error'}</h3>
          <p>{result.message || result.error}</p>
          {result.churchId && (
            <p>
              <strong>Church ID:</strong> {result.churchId}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '5px',
        }}
      >
        <h4>⚠️ Importante:</h4>
        <ul style={{ marginLeft: '20px' }}>
          <li>Esta operación copiará todos tus datos a la nueva estructura</li>
          <li>Los datos originales NO se eliminarán automáticamente</li>
          <li>Asegúrate de tener las reglas de Firestore configuradas para permitir escritura</li>
          <li>El proceso puede tomar varios minutos si tienes muchos datos</li>
        </ul>
      </div>
    </div>
  );
};

export default MigrationPage;
