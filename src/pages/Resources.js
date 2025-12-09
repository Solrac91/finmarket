import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Resources.css';
import { downloadEducationalPDF } from '../utils/educationalPDFs';
import {
  TrendingUp,
  BookOpen,
  Download,
  Upload,
  Trash2,
  Search,
  Filter,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  Wallet,
  Shield
} from 'lucide-react';

export default function Resources() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'Fundamentos',
    fileUrl: ''
  });

  // Cargar recursos desde localStorage
 const [resources, setResources] = useState(() => {
  const stored = localStorage.getItem('finmarket_resources');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Filtrar solo recursos subidos por profesores, no los del sistema
    const userResources = parsed.filter(r => !r.isDefault);
    // Combinar con recursos por defecto actualizados
    return [...getDefaultResources(), ...userResources];
  }
  return getDefaultResources();
});

  // Guardar cuando cambien
  useEffect(() => {
    localStorage.setItem('finmarket_resources', JSON.stringify(resources));
  }, [resources]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categories = [
    { id: 'all', name: 'Todos', icon: '📚' },
    { id: 'Fundamentos', name: 'Fundamentos', icon: '📖' },
    { id: 'Análisis Técnico', name: 'Análisis Técnico', icon: '📊' },
    { id: 'Gestión de Riesgo', name: 'Gestión de Riesgo', icon: '🛡️' },
    { id: 'Estrategias', name: 'Estrategias', icon: '🎯' },
    { id: 'Psicología', name: 'Psicología', icon: '🧠' }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpload = () => {
    if (!uploadData.title || !uploadData.description) {
      alert('Completa todos los campos');
      return;
    }

    const newResource = {
      id: Date.now(),
      ...uploadData,
      uploadedBy: currentUser.email,
      uploadDate: new Date().toISOString(),
      downloads: 0
    };

    setResources([newResource, ...resources]);
    setShowUploadModal(false);
    setUploadData({
      title: '',
      description: '',
      category: 'Fundamentos',
      fileUrl: ''
    });
    alert('✅ Recurso añadido correctamente');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este recurso?')) {
      setResources(resources.filter(r => r.id !== id));
    }
  };

const handleDownload = (resource) => {
  // Incrementar contador de descargas
  setResources(resources.map(r => 
    r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r
  ));

  // Si es recurso por defecto, generar PDF
  if (resource.isDefault) {
    downloadEducationalPDF(resource.id);
  } else if (resource.fileUrl) {
    // Si tiene fileUrl (subido por profesor), abrir
    window.open(resource.fileUrl, '_blank');
  } else {
    alert('Este recurso no está disponible');
  }
};

  return (
    <div className="resources-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <TrendingUp size={24} />
            </div>
            <span className="logo-text">FinMarket</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar recursos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <button className="icon-btn">
            <Settings size={20} />
          </button>
          <div className="user-menu">
            <div className="user-avatar">{currentUser?.name?.charAt(0).toUpperCase()}</div>
            <span>{currentUser?.name}</span>
            <ChevronDown size={16} />
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-item">
              <Activity size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/portfolio" className="nav-item">
              <Wallet size={20} />
              <span>Mi Cartera</span>
            </Link>
            <Link to="/ranking" className="nav-item">
              <TrendingUp size={20} />
              <span>Ranking</span>
            </Link>
            <Link to="/resources" className="nav-item active">
              <BookOpen size={20} />
              <span>Recursos</span>
            </Link>
            <Link to="/news" className="nav-item">
              <Bell size={20} />
              <span>Noticias</span>
            </Link>
          </nav>
          {currentUser?.role === 'teacher' && (
            <div style={{ padding: '1rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <Link to="/teacher" className="nav-item" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                <Shield size={20} />
                <span>Panel de Profesor</span>
              </Link>
            </div>
          )}
        </aside>

        <main className="dashboard-content">
          <div className="resources-header">
            <div className="header-title-section">
              <BookOpen size={40} />
              <div>
                <h1 className="page-title">Recursos Educativos</h1>
                <p className="page-subtitle">Material didáctico para aprender trading profesional</p>
              </div>
            </div>

            {currentUser?.role === 'teacher' && (
              <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
                <Upload size={20} />
                Subir Recurso
              </button>
            )}
          </div>

          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.name}
                {cat.id === 'all' && ` (${resources.length})`}
              </button>
            ))}
          </div>

          <div className="resources-grid">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <div className="resource-icon">
                  <FileText size={32} />
                </div>
                <div className="resource-content">
                  <div className="resource-category">{resource.category}</div>
                  <h3 className="resource-title">{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                  
                  <div className="resource-meta">
                    <span className="resource-downloads">
                      <Download size={14} />
                      {resource.downloads} descargas
                    </span>
                    <span className="resource-date">
                      {new Date(resource.uploadDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                <div className="resource-actions">
                  <button 
                    className="btn-download-resource"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download size={16} />
                    Descargar PDF
                  </button>
                  
                  {currentUser?.role === 'teacher' && (
                    <button 
                      className="btn-delete-resource"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="empty-state">
              <FileText size={64} />
              <h3>No se encontraron recursos</h3>
              <p>Prueba con otra categoría o búsqueda</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subir Nuevo Recurso</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Introducción al Trading"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  className="form-input"
                  value={uploadData.category}
                  onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Describe el contenido del recurso..."
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>URL del archivo PDF</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://tu-servidor.com/archivo.pdf"
                  value={uploadData.fileUrl}
                  onChange={(e) => setUploadData({...uploadData, fileUrl: e.target.value})}
                />
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  Sube el PDF a Google Drive, Dropbox o similar y pega el enlace público
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowUploadModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={handleUpload}>Subir Recurso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Recursos por defecto
function getDefaultResources() {
  return [
    {
      id: 1,
      title: 'Introducción al Trading',
      description: 'Conceptos básicos sobre qué es el trading, tipos de mercados, horizontes temporales y reglas de oro para principiantes.',
      category: 'Fundamentos',
      uploadedBy: 'system',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      isDefault: true
    },
    {
      id: 2,
      title: 'Tipos de Activos Financieros',
      description: 'Guía completa sobre acciones, criptomonedas, ETFs y materias primas. Ventajas, riesgos y características de cada uno.',
      category: 'Fundamentos',
      uploadedBy: 'system',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      isDefault: true
    },
    {
      id: 3,
      title: 'Cómo Leer Gráficos de Precios',
      description: 'Aprende a interpretar gráficos de velas, líneas de tendencia y patrones básicos de análisis técnico.',
      category: 'Análisis Técnico',
      uploadedBy: 'system',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      isDefault: true
    },
    {
      id: 4,
      title: 'Gestión de Riesgo',
      description: 'Estrategias para proteger tu capital: stop-loss, position sizing y diversificación de cartera.',
      category: 'Gestión de Riesgo',
      uploadedBy: 'system',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      isDefault: true
    },
    {
      id: 5,
      title: 'Métricas de Rendimiento',
      description: 'Entiende el Win Rate, Sharpe Ratio, drawdown y otras métricas clave para evaluar tu desempeño.',
      category: 'Análisis Técnico',
      uploadedBy: 'system',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      isDefault: true
    },
    {
      id: 6,
      title: 'Psicología del Trading',
      description: 'Controla el miedo y la codicia. Aprende a mantener la disciplina y evitar decisiones emocionales.',
      category: 'Psicología',
      uploadedBy: 'system',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      isDefault: true
    }
  ];
}