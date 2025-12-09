import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import { TrendingUp, User, Mail, Lock, Eye, EyeOff, BarChart3, Shield, Award, Key } from 'lucide-react';

// Código de acceso para profesores - Cámbialo por el que quieras
const TEACHER_ACCESS_CODE = 'FINMARKET2025';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    teacherCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          setError('Por favor completa todos los campos');
          setLoading(false);
          return;
        }

        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Redirigir según rol
          navigate(result.user.role === 'teacher' ? '/teacher' : '/dashboard');
        } else {
          setError(result.error || 'Error al iniciar sesión. Verifica tus credenciales.');
          setLoading(false);
        }
        
      } else {
        // Registro
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('Por favor completa todos los campos');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        
        // Validar código de profesor
        if (formData.role === 'teacher') {
          if (!formData.teacherCode) {
            setError('Debes ingresar el código de acceso para profesores');
            setLoading(false);
            return;
          }
          if (formData.teacherCode !== TEACHER_ACCESS_CODE) {
            setError('Código de acceso incorrecto. Contacta al administrador para obtenerlo.');
            setLoading(false);
            return;
          }
        }
        
        const result = await register(
          formData.name, 
          formData.email, 
          formData.password, 
          formData.role
        );
        
        if (result.success) {
          // Redirigir según rol
          navigate(result.user.role === 'teacher' ? '/teacher' : '/dashboard');
        } else {
          setError(result.error || 'Error al crear la cuenta. El email puede estar en uso.');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form-box">
          <Link to="/" className="back-link">
            ← Volver al inicio
          </Link>
          
          <div className="logo-container">
            <div className="logo-box">
              <div className="logo-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="logo-text">FinMarket</div>
                <div className="logo-subtitle">Simulador Profesional de Trading</div>
              </div>
            </div>
          </div>

          <div className="toggle-buttons">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <div className="input-container">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <div className="input-container">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Tipo de cuenta</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, role: 'student', teacherCode: ''})}
                  >
                    <User size={20} />
                    <span>Estudiante</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'teacher' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, role: 'teacher'})}
                  >
                    <Shield size={20} />
                    <span>Profesor</span>
                  </button>
                </div>
              </div>
            )}

            {!isLogin && formData.role === 'teacher' && (
              <div className="form-group">
                <label className="form-label">Código de acceso para profesores</label>
                <div className="input-container">
                  <Key className="input-icon" size={20} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingresa el código de acceso"
                    value={formData.teacherCode}
                    onChange={(e) => setFormData({...formData, teacherCode: e.target.value})}
                  />
                </div>
                <p className="input-hint">Solicita el código al administrador del sistema</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>
        </div>
      </div>

      <div className="login-right">
        <div className="hero-content">
          <h2 className="hero-title">Domina los mercados financieros</h2>
          <p className="hero-description">
            Aprende a invertir sin riesgo real. Opera con cotizaciones reales, 
            gestiona carteras y desarrolla estrategias ganadoras.
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <BarChart3 size={20} />
              </div>
              <div className="feature-text">
                <h3>Mercados en Tiempo Real</h3>
                <p>IBEX 35, criptomonedas, ETFs y materias primas</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Shield size={20} />
              </div>
              <div className="feature-text">
                <h3>100% Seguro</h3>
                <p>Practica sin arriesgar dinero real</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Award size={20} />
              </div>
              <div className="feature-text">
                <h3>Ranking Competitivo</h3>
                <p>Compite y aprende de otros inversores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}