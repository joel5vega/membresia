import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginView.css';

const LoginView = () => {
  const { login, register } = useAuth();
    const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
                navigate('/dashboard');
      } else {
        await register(email, password);
                navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo autenticar. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
          <p className="subtitle">
            {mode === 'login' 
              ? 'Bienvenido de vuelta' 
              : 'Únete a IglesiaFlow'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <div className="divider"></div>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="toggle-button"
        >
          Iniciar Sesión
          {/* {mode === 'login' 
            ? '¿No tienes cuenta? Crear una' 
            : '¿Ya tienes cuenta? Inicia sesión'} */}
        </button>
      </div>
    </div>
  );
};

export default LoginView;