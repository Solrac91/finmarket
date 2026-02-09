import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';
import { TrendingUp, Globe, Shield, Users, Trophy, BarChart3, BookOpen } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="welcome-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-logo">
            <div className="logo-icon">
              <TrendingUp size={24} />
            </div>
            <span className="logo-text">FinMarket</span>
          </div>
          <div className="nav-menu">
            <a href="#features" className="nav-link">Características</a>
            <a href="#how-it-works" className="nav-link">Cómo Funciona</a>
            <a href="#about" className="nav-link">Acerca De</a>
            <Link to="/login" className="btn-start">Empezar</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🚀 Plataforma Educativa de Trading</span>
          <h1 className="hero-title">Aprende a Invertir Sin Riesgo Real</h1>
          <p className="hero-subtitle">
            FinMarket es tu simulador profesional de trading. Practica con datos reales del IBEX 35, 
            criptomonedas y más. Perfecto para estudiantes y principiantes.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">Crear Cuenta Gratis</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Activos Disponibles</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">€50,000</div>
            <div className="stat-label">Capital Virtual Inicial</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Sin Riesgo Real</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Acceso Disponible</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="section-title">Todo lo que Necesitas para Aprender</h2>
          <p className="section-subtitle">
            Herramientas profesionales diseñadas específicamente para la educación financiera
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Globe size={32} />
              </div>
              <h3 className="feature-title">Mercados Reales</h3>
              <p className="feature-description">
                Opera con datos reales del IBEX 35, principales criptomonedas, 
                ETFs internacionales y materias primas. Experimenta las mismas 
                condiciones que los traders profesionales.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">Entorno Seguro</h3>
              <p className="feature-description">
                Practica sin miedo a perder dinero real. Comete errores, 
                aprende de ellos y mejora tu estrategia sin consecuencias 
                financieras reales.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3 className="feature-title">Control del Profesor</h3>
              <p className="feature-description">
                Los profesores pueden gestionar estudiantes, ajustar precios, 
                crear eventos de mercado y publicar noticias para simular 
                situaciones reales.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Trophy size={32} />
              </div>
              <h3 className="feature-title">Ranking Competitivo</h3>
              <p className="feature-description">
                Compite con tus compañeros en tiempo real. Ve quién obtiene 
                los mejores resultados y aprende de las estrategias ganadoras.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3 className="feature-title">Análisis Detallado</h3>
              <p className="feature-description">
                Gráficos profesionales, historial de transacciones y métricas 
                de rendimiento para entender y mejorar tu estrategia de inversión.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={32} />
              </div>
              <h3 className="feature-title">Noticias del Mercado</h3>
              <p className="feature-description">
                Sistema de noticias integrado donde los profesores pueden 
                publicar eventos que afectan al mercado, enseñando a reaccionar 
                ante la volatilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="features-container">
          <h2 className="section-title">Cómo Funciona</h2>
          <p className="section-subtitle">
            Empieza a operar en minutos con nuestro proceso simple
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-number">
                <span>1</span>
              </div>
              <h3 className="feature-title">Regístrate</h3>
              <p className="feature-description">
                Crea tu cuenta gratuita como estudiante o profesor. 
                Los estudiantes reciben €50,000 virtuales para empezar.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-number">
                <span>2</span>
              </div>
              <h3 className="feature-title">Explora los Mercados</h3>
              <p className="feature-description">
                Navega por los diferentes activos disponibles: acciones del IBEX 35, 
                criptomonedas, ETFs y materias primas.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-number">
                <span>3</span>
              </div>
              <h3 className="feature-title">Invierte y Aprende</h3>
              <p className="feature-description">
                Compra y vende activos, sigue las noticias, analiza tus resultados 
                y mejora tu estrategia con cada operación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para Empezar?</h2>
          <p className="cta-description">
            Únete a miles de estudiantes que ya están aprendiendo a invertir
          </p>
          <Link to="/login" className="btn-cta">Crear Cuenta Gratuita</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#terminos" className="footer-link">Términos de Uso</a>
            <a href="#privacidad" className="footer-link">Privacidad</a>
            <a href="#contacto" className="footer-link">Contacto</a>
            <a href="#ayuda" className="footer-link">Ayuda</a>
          </div>
          <p className="footer-copy">© 2025 FinMarket - Simulador Educativo de Trading. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}