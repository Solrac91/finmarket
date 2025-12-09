import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateAssetPrice, publishNews as publishNewsUtil, getNews, deleteNews, getRelativeTime, getAssetPrice, getPriceHistory, clearPriceHistory, triggerMarketEvent } from '../utils/marketData';
import './TeacherPanel.css';
import { 
  getMarketDay, 
  advanceMarketTime, 
  getMarketPeriodInfo, 
  resetMarketTime,
  isDividendDay,
  applyDividends,
  applyDailyVolatility,
  getScheduledEvents
} from '../utils/timeManager';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Newspaper,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';

export default function TeacherPanel() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('students');
  const [selectedPriceCategory, setSelectedPriceCategory] = useState('all');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [publishedNews, setPublishedNews] = useState(getNews());
  const [priceHistory, setPriceHistory] = useState(getPriceHistory());
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsImpact, setNewsImpact] = useState('positive');
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem('finmarket_settings');
  return stored ? JSON.parse(stored) : { commissionEnabled: false, commissionRate: 0.1 };
});
const [marketDay, setMarketDay] = useState(getMarketDay());
const [periodInfo, setPeriodInfo] = useState(getMarketPeriodInfo());

  useEffect(() => {
    if (currentUser?.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const getAllStudents = () => {
    const students = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('finmarket_userdata_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          const email = key.replace('finmarket_userdata_', '');
          
          const invested = userData.portfolio?.reduce((sum, item) => sum + item.value, 0) || 0;
          const totalValue = userData.balance + invested;
          const initialBalance = 50000;
          const performance = ((totalValue - initialBalance) / initialBalance) * 100;
          
          students.push({
            email: email,
            name: email.split('@')[0],
            balance: userData.balance || 0,
            invested: invested,
            totalValue: totalValue,
            performance: performance,
            transactions: userData.transactions?.length || 0,
            portfolioCount: userData.portfolio?.length || 0
          });
        } catch (e) {
          console.error('Error parsing student data:', e);
        }
      }
    }
    
    return students.sort((a, b) => b.totalValue - a.totalValue);
  };

  const [students, setStudents] = useState(getAllStudents());
const updateSettings = (newSettings) => {
  setSettings(newSettings);
  localStorage.setItem('finmarket_settings', JSON.stringify(newSettings));
  alert('✅ Configuración actualizada correctamente');
};

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resetStudent = (studentEmail) => {
    if (window.confirm(`¿Seguro que quieres resetear la cuenta de ${studentEmail}?`)) {
      const key = `finmarket_userdata_${studentEmail}`;
      const resetData = {
        balance: 50000,
        portfolio: [],
        transactions: []
      };
      localStorage.setItem(key, JSON.stringify(resetData));
      setStudents(getAllStudents());
      alert('Cuenta reseteada correctamente');
    }
  };

  const deleteStudent = (studentEmail) => {
    if (window.confirm(`¿Seguro que quieres eliminar permanentemente a ${studentEmail}?`)) {
      const key = `finmarket_userdata_${studentEmail}`;
      localStorage.removeItem(key);
      setStudents(getAllStudents());
      alert('Estudiante eliminado correctamente');
    }
  };

  const getAllAssets = () => [
    { symbol: 'SAN', name: 'Banco Santander', category: 'IBEX 35' },
    { symbol: 'BBVA', name: 'Banco Bilbao Vizcaya', category: 'IBEX 35' },
    { symbol: 'IBE', name: 'Iberdrola', category: 'IBEX 35' },
    { symbol: 'TEF', name: 'Telefónica', category: 'IBEX 35' },
    { symbol: 'ITX', name: 'Inditex', category: 'IBEX 35' },
    { symbol: 'REP', name: 'Repsol', category: 'IBEX 35' },
    { symbol: 'CABK', name: 'CaixaBank', category: 'IBEX 35' },
    { symbol: 'ACS', name: 'ACS', category: 'IBEX 35' },
    { symbol: 'FER', name: 'Ferrovial', category: 'IBEX 35' },
    { symbol: 'ENG', name: 'Enagás', category: 'IBEX 35' },
    { symbol: 'AENA', name: 'Aena', category: 'IBEX 35' },
    { symbol: 'IAG', name: 'IAG', category: 'IBEX 35' },
    { symbol: 'NTGY', name: 'Naturgy', category: 'IBEX 35' },
    { symbol: 'RED', name: 'Red Eléctrica', category: 'IBEX 35' },
    { symbol: 'ELE', name: 'Endesa', category: 'IBEX 35' },
    { symbol: 'GRF', name: 'Grifols', category: 'IBEX 35' },
    { symbol: 'MAP', name: 'Mapfre', category: 'IBEX 35' },
    { symbol: 'COL', name: 'Inmobiliaria Colonial', category: 'IBEX 35' },
    { symbol: 'MRL', name: 'Merlin Properties', category: 'IBEX 35' },
    { symbol: 'ACX', name: 'Acerinox', category: 'IBEX 35' },
    { symbol: 'ANA', name: 'Acciona', category: 'IBEX 35' },
    { symbol: 'SAB', name: 'Banco Sabadell', category: 'IBEX 35' },
    { symbol: 'CLNX', name: 'Cellnex', category: 'IBEX 35' },
    { symbol: 'FDR', name: 'Fluidra', category: 'IBEX 35' },
    { symbol: 'IDR', name: 'Indra', category: 'IBEX 35' },
    { symbol: 'LOG', name: 'Logista', category: 'IBEX 35' },
    { symbol: 'MEL', name: 'Meliá Hotels', category: 'IBEX 35' },
    { symbol: 'PHM', name: 'PharmaMar', category: 'IBEX 35' },
    { symbol: 'ROVI', name: 'Laboratorios Rovi', category: 'IBEX 35' },
    { symbol: 'SLR', name: 'Solaria', category: 'IBEX 35' },
    { symbol: 'UNI', name: 'Unicaja', category: 'IBEX 35' },
    { symbol: 'VIS', name: 'Viscofan', category: 'IBEX 35' },
    { symbol: 'SGRE', name: 'Siemens Gamesa', category: 'IBEX 35' },
    { symbol: 'AMA', name: 'Amadeus', category: 'IBEX 35' },
    { symbol: 'ALM', name: 'Almirall', category: 'IBEX 35' },
    { symbol: 'BTC', name: 'Bitcoin', category: 'Crypto' },
    { symbol: 'ETH', name: 'Ethereum', category: 'Crypto' },
    { symbol: 'BNB', name: 'Binance Coin', category: 'Crypto' },
    { symbol: 'XRP', name: 'Ripple', category: 'Crypto' },
    { symbol: 'ADA', name: 'Cardano', category: 'Crypto' },
    { symbol: 'SOL', name: 'Solana', category: 'Crypto' },
    { symbol: 'DOGE', name: 'Dogecoin', category: 'Crypto' },
    { symbol: 'DOT', name: 'Polkadot', category: 'Crypto' },
    { symbol: 'MATIC', name: 'Polygon', category: 'Crypto' },
    { symbol: 'LTC', name: 'Litecoin', category: 'Crypto' },
    { symbol: 'GOLD', name: 'Oro', category: 'Materias Primas' },
    { symbol: 'SILVER', name: 'Plata', category: 'Materias Primas' },
    { symbol: 'WTI', name: 'Petróleo WTI', category: 'Materias Primas' },
    { symbol: 'BRENT', name: 'Petróleo Brent', category: 'Materias Primas' },
    { symbol: 'NATGAS', name: 'Gas Natural', category: 'Materias Primas' },
    { symbol: 'COPPER', name: 'Cobre', category: 'Materias Primas' },
    { symbol: 'PLAT', name: 'Platino', category: 'Materias Primas' },
    { symbol: 'WHEAT', name: 'Trigo', category: 'Materias Primas' },
    { symbol: 'CORN', name: 'Maíz', category: 'Materias Primas' },
    { symbol: 'COFFEE', name: 'Café', category: 'Materias Primas' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', category: 'ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'ETF' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market', category: 'ETF' },
    { symbol: 'IWM', name: 'iShares Russell 2000', category: 'ETF' },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets', category: 'ETF' },
    { symbol: 'GLD', name: 'SPDR Gold Shares', category: 'ETF' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond', category: 'ETF' },
    { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets', category: 'ETF' },
    { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', category: 'ETF' },
    { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets', category: 'ETF' }
  ].map(asset => ({
    ...asset,
    price: getAssetPrice(asset.symbol)
  }));

  const [allAssets, setAllAssets] = useState(getAllAssets());

  const openPriceModal = (asset) => {
    setSelectedAsset(asset);
    setNewPrice(asset.price.toString());
    setShowPriceModal(true);
    setPriceHistory(getPriceHistory());
  };

  const updatePrice = () => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      alert('Ingresa un precio válido');
      return;
    }
    
    updateAssetPrice(selectedAsset.symbol, newPrice);
    setAllAssets(getAllAssets());
    alert(`✅ Precio de ${selectedAsset.symbol} actualizado a €${parseFloat(newPrice).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
    setShowPriceModal(false);
    setSelectedAsset(null);
    setNewPrice('');
    setPriceHistory(getPriceHistory());
  };

  const publishNews = () => {
    if (!newsTitle || !newsContent) {
      alert('Completa todos los campos');
      return;
    }
    
    if (editingNewsId) {
      deleteNews(editingNewsId);
      publishNewsUtil(newsTitle, newsContent, newsImpact);
      alert('Noticia actualizada correctamente');
    } else {
      publishNewsUtil(newsTitle, newsContent, newsImpact);
      alert('Noticia publicada correctamente');
    }
    
    setShowNewsModal(false);
    setNewsTitle('');
    setNewsContent('');
    setNewsImpact('positive');
    setEditingNewsId(null);
    setPublishedNews(getNews());
  };


const handleAdvanceTime = (days, label) => {
  if (!window.confirm(`¿Avanzar ${label}? Esto aplicará cambios automáticos de precios y puede disparar eventos.`)) {
    return;
  }
  
  // Avanzar el tiempo
  const newDay = advanceMarketTime(days);
  
  // Aplicar volatilidad diaria por cada día avanzado
  for (let i = 0; i < days; i++) {
    applyDailyVolatility();
  }
  
  // Verificar eventos programados
  const events = getScheduledEvents(newDay);
  
  // Si es día de dividendos, aplicarlos
  if (isDividendDay(newDay)) {
    const updatedUsers = applyDividends();
    alert(`✅ Dividendos pagados a ${updatedUsers.length} estudiantes`);
  }
  
  // Actualizar estados
  setMarketDay(newDay);
  setPeriodInfo(getMarketPeriodInfo(newDay));
  setAllAssets(getAllAssets());
  setStudents(getAllStudents());
  
  // Mostrar eventos si los hay
  if (events.length > 0) {
    const eventMessages = events.map(e => `• ${e.title}: ${e.description}`).join('\n');
    alert(`✅ Tiempo avanzado a Día ${newDay}\n\nEventos:\n${eventMessages}`);
  } else {
    alert(`✅ Tiempo avanzado a Día ${newDay}`);
  }
};

 const applyMassEvent = (eventType) => {
  const customPrices = JSON.parse(localStorage.getItem('finmarket_custom_prices') || '{}');
  
  allAssets.forEach(asset => {
    let currentPrice = asset.price;
    let newPrice = currentPrice;
    
    switch(eventType) {
      case 'crisis':
        newPrice = currentPrice * (1 - (Math.random() * 0.15 + 0.15));
        break;
      case 'crash':
        newPrice = currentPrice * (1 - (Math.random() * 0.20 + 0.40));
        break;
      case 'bull':
        newPrice = currentPrice * (1 + (Math.random() * 0.10 + 0.15));
        break;
      case 'crypto-crash':
        if (asset.category === 'Crypto') {
          newPrice = currentPrice * 0.5;
        }
        break;
      case 'commodities-boom':
        if (asset.category === 'Materias Primas') {
          newPrice = currentPrice * 1.20;
        }
        break;
      case 'reset':
        return;
      default:
        return;
    }
    
    if (eventType !== 'reset') {
      updateAssetPrice(asset.symbol, newPrice.toFixed(2), eventType);
    }
  });
  
  if (eventType === 'reset') {
    localStorage.removeItem('finmarket_custom_prices');
    // Limpiar también los eventos al resetear
    localStorage.removeItem('finmarket_market_events');
  } else {
    localStorage.setItem('finmarket_custom_prices', JSON.stringify(customPrices));
    
    // Generar noticia automática y limpiar eventos antiguos
    const existingEvents = JSON.parse(localStorage.getItem('finmarket_market_events') || '[]');
    
    // Mantener solo los últimos 30 eventos
    const recentEvents = existingEvents.slice(-29); // 29 + el nuevo = 30
    
    localStorage.setItem('finmarket_market_events', JSON.stringify(recentEvents));
    triggerMarketEvent(eventType);
  }
  
  setAllAssets(getAllAssets());
  alert(`✅ Evento "${eventType}" aplicado correctamente. Se ha publicado una alerta para los estudiantes.`);
};
return (
    <div className="teacher-panel-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <TrendingUp size={24} />
            </div>
            <span className="logo-text">FinMarket</span>
            <span className="teacher-badge">Profesor</span>
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
            <div className="user-avatar teacher">{currentUser?.name?.charAt(0).toUpperCase()}</div>
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
            <button 
              className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <Users size={20} />
              <span>Estudiantes</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'prices' ? 'active' : ''}`}
              onClick={() => setActiveTab('prices')}
            >
              <DollarSign size={20} />
              <span>Gestión de Precios</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <Newspaper size={20} />
              <span>Publicar Noticias</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <TrendingDown size={20} />
              <span>Eventos de Mercado</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Activity size={20} />
              <span>Historial de Cambios</span>
            </button>

<button 
  className={`nav-item ${activeTab === 'time' ? 'active' : ''}`}
  onClick={() => setActiveTab('time')}
>
  <Activity size={20} />
  <span>Control de Tiempo</span>
</button>

<button 
  className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
  onClick={() => setActiveTab('settings')}
>
  <Settings size={20} />
  <span>Configuración</span>
</button>

            <Link to="/ranking" className="nav-item">
              <BarChart3 size={20} />
              <span>Ver Ranking</span>
            </Link>
          </nav>
          <div style={{ padding: '1rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <Link to="/dashboard" className="nav-item" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Activity size={20} />
              <span>Ir al Dashboard</span>
            </Link>
          </div>
        </aside>

        <main className="dashboard-content">
          {activeTab === 'students' && (
            <div className="students-section">
              <div className="section-header">
                <h1 className="section-title">Gestión de Estudiantes</h1>
                <div className="stats-summary">
                  <div className="stat-card">
                    <Users size={24} />
                    <div>
                      <div className="stat-number">{students.length}</div>
                      <div className="stat-label">Estudiantes</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="students-table">
                <div className="table-header">
                  <div className="th">Estudiante</div>
                  <div className="th">Saldo</div>
                  <div className="th">Valor Total</div>
                  <div className="th">Rendimiento</div>
                  <div className="th">Operaciones</div>
                  <div className="th">Activos</div>
                  <div className="th">Acciones</div>
                </div>
                {students.map((student) => (
                  <div key={student.email} className="table-row">
                    <div className="td student-info">
                      <div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                    <div className="td">€{student.balance.toLocaleString('es-ES')}</div>
                    <div className="td">€{student.totalValue.toLocaleString('es-ES')}</div>
                    <div className={`td ${student.performance >= 0 ? 'positive' : 'negative'}`}>
                      {student.performance >= 0 ? '+' : ''}{student.performance.toFixed(2)}%
                    </div>
                    <div className="td">{student.transactions}</div>
                    <div className="td">{student.portfolioCount}</div>
              <div className="td actions">
  <button 
    className="action-btn view"
    onClick={() => navigate(`/teacher/student/${student.email}`)}
    title="Ver análisis detallado"
  >
    <BarChart3 size={16} />
  </button>
  <button 
    className="action-btn reset"
    onClick={() => resetStudent(student.email)}
    title="Resetear cuenta"
  >
    <Edit size={16} />
  </button>
  <button 
    className="action-btn delete"
    onClick={() => deleteStudent(student.email)}
    title="Eliminar estudiante"
  >
    <Trash2 size={16} />
  </button>
</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prices' && (
            <div className="prices-section">
              <div className="section-header">
                <h1 className="section-title">Gestión de Precios</h1>
                <p className="section-subtitle">Ajusta los precios de los activos para crear escenarios de mercado</p>
              </div>

              <div className="category-filters">
                <button
                  className={`filter-btn ${selectedPriceCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedPriceCategory('all')}
                >
                  Todos ({allAssets.length})
                </button>
                <button
                  className={`filter-btn ${selectedPriceCategory === 'IBEX 35' ? 'active' : ''}`}
                  onClick={() => setSelectedPriceCategory('IBEX 35')}
                >
                  IBEX 35 ({allAssets.filter(a => a.category === 'IBEX 35').length})
                </button>
                <button
                  className={`filter-btn ${selectedPriceCategory === 'Crypto' ? 'active' : ''}`}
                  onClick={() => setSelectedPriceCategory('Crypto')}
                >
                  Criptomonedas ({allAssets.filter(a => a.category === 'Crypto').length})
                </button>
                <button
                  className={`filter-btn ${selectedPriceCategory === 'Materias Primas' ? 'active' : ''}`}
                  onClick={() => setSelectedPriceCategory('Materias Primas')}
                >
                  Materias Primas ({allAssets.filter(a => a.category === 'Materias Primas').length})
                </button>
                <button
                  className={`filter-btn ${selectedPriceCategory === 'ETF' ? 'active' : ''}`}
                  onClick={() => setSelectedPriceCategory('ETF')}
                >
                  ETFs ({allAssets.filter(a => a.category === 'ETF').length})
                </button>
              </div>

              <div className="assets-grid">
                {allAssets
                  .filter(asset => selectedPriceCategory === 'all' || asset.category === selectedPriceCategory)
                  .map((asset) => (
                    <div key={asset.symbol} className="asset-card">
                      <div className="asset-header">
                        <div>
                          <div className="asset-symbol">{asset.symbol}</div>
                          <div className="asset-name">{asset.name}</div>
                        </div>
                        <span className="asset-category">{asset.category}</span>
                      </div>
                      <div className="asset-price">€{asset.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                      <button 
                        className="btn-edit-price"
                        onClick={() => openPriceModal(asset)}
                      >
                        <Edit size={16} />
                        Modificar Precio
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="news-section-teacher">
              <div className="section-header">
                <h1 className="section-title">Publicar Noticias del Mercado</h1>
                <p className="section-subtitle">Crea eventos que afecten al mercado para enseñar a reaccionar ante la volatilidad</p>
              </div>

              <button 
                className="btn-publish-news"
                onClick={() => setShowNewsModal(true)}
              >
                <Plus size={20} />
                Nueva Noticia
              </button>

              <div className="published-news">
                <h2>Noticias Publicadas</h2>
                {publishedNews.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    No hay noticias publicadas aún
                  </p>
                ) : (
                  publishedNews.map((news) => (
                    <div key={news.id} className="news-item">
                      <div className="news-header">
                        <h3>{news.title}</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span className="news-date">{getRelativeTime(news.timestamp)}</span>
                          <button 
                            className="action-btn reset"
                            onClick={() => {
                              setNewsTitle(news.title);
                              setNewsContent(news.content);
                              setNewsImpact(news.impact || 'positive');
                              setEditingNewsId(news.id);
                              setShowNewsModal(true);
                            }}
                            title="Editar noticia"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => {
                              if (window.confirm('¿Eliminar esta noticia?')) {
                                deleteNews(news.id);
                                setPublishedNews(getNews());
                              }
                            }}
                            title="Eliminar noticia"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="news-preview">{news.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
{activeTab === 'events' && (
            <div className="events-section">
              <div className="section-header">
                <h1 className="section-title">Eventos de Mercado</h1>
                <p className="section-subtitle">Simula crisis económicas y eventos masivos para crear escenarios de aprendizaje realistas</p>
              </div>

              <div className="events-grid">
                <div className="event-card crisis">
                  <h3>📉 Crisis Económica Global</h3>
                  <p>Reduce todos los activos entre -15% y -30%</p>
                  <button 
                    className="btn-event danger"
                    onClick={() => {
                      if (window.confirm('¿Aplicar crisis económica global? Esto reducirá el valor de TODOS los activos.')) {
                        applyMassEvent('crisis');
                      }
                    }}
                  >
                    Aplicar Crisis
                  </button>
                </div>

                <div className="event-card crash">
                  <h3>💥 Crash del Mercado</h3>
                  <p>Reduce todos los activos entre -40% y -60%</p>
                  <button 
                    className="btn-event danger"
                    onClick={() => {
                      if (window.confirm('¿Aplicar crash del mercado? ¡Esto causará grandes pérdidas!')) {
                        applyMassEvent('crash');
                      }
                    }}
                  >
                    Aplicar Crash
                  </button>
                </div>

                <div className="event-card bull">
                  <h3>🚀 Bull Market</h3>
                  <p>Aumenta todos los activos entre +15% y +25%</p>
                  <button 
                    className="btn-event success"
                    onClick={() => {
                      if (window.confirm('¿Aplicar bull market? Todos los activos subirán.')) {
                        applyMassEvent('bull');
                      }
                    }}
                  >
                    Aplicar Bull Market
                  </button>
                </div>

                <div className="event-card crypto-crash">
                  <h3>₿ Crisis de Criptomonedas</h3>
                  <p>Reduce solo las criptomonedas -50%</p>
                  <button 
                    className="btn-event warning"
                    onClick={() => {
                      if (window.confirm('¿Aplicar crisis de criptomonedas?')) {
                        applyMassEvent('crypto-crash');
                      }
                    }}
                  >
                    Aplicar Crisis Crypto
                  </button>
                </div>

                <div className="event-card commodities-boom">
                  <h3>⛏️ Boom de Materias Primas</h3>
                  <p>Aumenta materias primas +20%</p>
                  <button 
                    className="btn-event success"
                    onClick={() => {
                      if (window.confirm('¿Aplicar boom de materias primas?')) {
                        applyMassEvent('commodities-boom');
                      }
                    }}
                  >
                    Aplicar Boom
                  </button>
                </div>

                <div className="event-card reset">
                  <h3>🔄 Resetear Precios</h3>
                  <p>Vuelve todos los precios a sus valores originales</p>
                  <button 
                    className="btn-event neutral"
                    onClick={() => {
                      if (window.confirm('¿Resetear TODOS los precios a valores originales?')) {
                        applyMassEvent('reset');
                      }
                    }}
                  >
                    Resetear Todo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              <div className="section-header">
                <h1 className="section-title">Historial de Cambios de Precios</h1>
                <p className="section-subtitle">Registro completo de todas las modificaciones de precios realizadas</p>
                <button 
                  className="btn-clear-history"
                  onClick={() => {
                    if (window.confirm('¿Eliminar todo el historial? Esta acción no se puede deshacer.')) {
                      clearPriceHistory();
                      setPriceHistory([]);
                      alert('Historial limpiado correctamente');
                    }
                  }}
                >
                  <Trash2 size={16} />
                  Limpiar Historial
                </button>
              </div>

              {priceHistory.length === 0 ? (
                <div className="empty-state">
                  <p>No hay cambios registrados aún</p>
                </div>
              ) : (
                <div className="history-table">
                  <div className="table-header">
                    <div className="th">Fecha y Hora</div>
                    <div className="th">Activo</div>
                    <div className="th">Precio Anterior</div>
                    <div className="th">Precio Nuevo</div>
                    <div className="th">Cambio</div>
                    <div className="th">Tipo</div>
                  </div>
                  {priceHistory.map((entry) => (
                    <div key={entry.id} className="table-row">
                      <div className="td">
                        <div>{entry.date}</div>
                        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{entry.time}</div>
                      </div>
                      <div className="td">
                        <strong>{entry.symbol}</strong>
                      </div>
                      <div className="td">€{entry.oldPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                      <div className="td">€{entry.newPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                      <div className={`td change ${parseFloat(entry.changePercent) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(entry.changePercent) >= 0 ? '+' : ''}{entry.changePercent}%
                      </div>
                      <div className="td">
                        <span className={`type-badge ${entry.changeType}`}>
                          {entry.changeType === 'manual' ? 'Manual' : 
                           entry.changeType === 'crisis' ? 'Crisis' :
                           entry.changeType === 'crash' ? 'Crash' :
                           entry.changeType === 'bull' ? 'Bull Market' :
                           entry.changeType === 'crypto-crash' ? 'Crisis Crypto' :
                           entry.changeType === 'commodities-boom' ? 'Boom Materias' :
                           entry.changeType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

{activeTab === 'settings' && (
            <div className="settings-section">
              <div className="section-header">
                <h1 className="section-title">Configuración del Simulador</h1>
                <p className="section-subtitle">Ajusta parámetros globales que afectan a todos los estudiantes</p>
              </div>

              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Comisiones por Transacción</h3>
                    <p>Cobra una comisión porcentual en cada compra/venta para simular costes reales de trading</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.commissionEnabled}
                      onChange={(e) => updateSettings({...settings, commissionEnabled: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {settings.commissionEnabled && (
                  <div className="setting-item commission-rate">
                    <div className="setting-info">
                      <h3>Porcentaje de Comisión</h3>
                      <p>Se aplicará este % sobre el valor total de cada transacción</p>
                    </div>
                    <div className="rate-input-group">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        max="5"
                        value={settings.commissionRate}
                        onChange={(e) => updateSettings({...settings, commissionRate: parseFloat(e.target.value)})}
                        className="rate-input"
                      />
                      <span className="rate-symbol">%</span>
                    </div>
                  </div>
                )}

                <div className="setting-preview">
                  <strong>Vista previa:</strong> 
                  {settings.commissionEnabled ? (
                    <span> Una compra de €1,000 costaría €{(1000 * (1 + settings.commissionRate/100)).toFixed(2)} (comisión: €{(1000 * settings.commissionRate/100).toFixed(2)})</span>
                  ) : (
                    <span> Sin comisiones activas</span>
                  )}
                </div>
              </div>
            </div>
          )}

{activeTab === 'time' && (
  <div className="time-section">
    <div className="section-header">
      <h1 className="section-title">Control del Tiempo de Mercado</h1>
      <p className="section-subtitle">Avanza el tiempo para simular períodos realistas de inversión</p>
    </div>

    {/* Indicador actual */}
    <div className="current-time-card">
      <div className="time-display">
        <div className="time-main">
          <span className="time-label">Día de Mercado</span>
          <span className="time-value">{marketDay}</span>
        </div>
        <div className="time-details">
          <div className="time-detail">
            <span>Semana {periodInfo.week}</span>
            <span>Mes {periodInfo.month}</span>
            <span>Trimestre {periodInfo.quarter}</span>
            <span>Año {periodInfo.year}</span>
          </div>
        </div>
      </div>
      
      {isDividendDay(marketDay) && (
        <div className="dividend-alert">
          💰 ¡Día de pago de dividendos!
        </div>
      )}
    </div>

    {/* Controles de avance */}
    <div className="time-controls-grid">
      <div className="time-control-card">
        <h3>📅 Avanzar 1 Día</h3>
        <p>Simula un día de trading</p>
        <button 
          className="btn-time-advance day"
          onClick={() => handleAdvanceTime(1, '1 día')}
        >
          Avanzar 1 Día
        </button>
      </div>

      <div className="time-control-card">
        <h3>📆 Avanzar 1 Semana</h3>
        <p>7 días de mercado</p>
        <button 
          className="btn-time-advance week"
          onClick={() => handleAdvanceTime(7, '1 semana')}
        >
          Avanzar 1 Semana
        </button>
      </div>

      <div className="time-control-card">
        <h3>🗓️ Avanzar 1 Mes</h3>
        <p>30 días de mercado</p>
        <button 
          className="btn-time-advance month"
          onClick={() => handleAdvanceTime(30, '1 mes')}
        >
          Avanzar 1 Mes
        </button>
      </div>

      <div className="time-control-card">
        <h3>📊 Avanzar 1 Trimestre</h3>
        <p>90 días - Incluye dividendos</p>
        <button 
          className="btn-time-advance quarter"
          onClick={() => handleAdvanceTime(90, '1 trimestre')}
        >
          Avanzar 1 Trimestre
        </button>
      </div>

      <div className="time-control-card">
        <h3>📈 Avanzar 1 Año</h3>
        <p>365 días de mercado completo</p>
        <button 
          className="btn-time-advance year"
          onClick={() => handleAdvanceTime(365, '1 año')}
        >
          Avanzar 1 Año
        </button>
      </div>

      <div className="time-control-card danger">
        <h3>🔄 Resetear Tiempo</h3>
        <p>Volver al día 1</p>
        <button 
          className="btn-time-reset"
          onClick={() => {
            if (window.confirm('¿Resetear el tiempo a Día 1? Esto no afectará los precios ni las carteras.')) {
              resetMarketTime();
              setMarketDay(1);
              setPeriodInfo(getMarketPeriodInfo(1));
              alert('✅ Tiempo reseteado al Día 1');
            }
          }}
        >
          Resetear Tiempo
        </button>
      </div>
    </div>

    {/* Información educativa */}
    <div className="time-info-panel">
      <h3>ℹ️ Efectos del avance temporal</h3>
      <ul>
        <li>Los precios fluctúan automáticamente con volatilidad realista</li>
        <li>Cada 90 días (trimestre) se pagan dividendos a acciones IBEX 35</li>
        <li>Las órdenes stop-loss y take-profit se verifican automáticamente</li>
        <li>Las métricas de rendimiento se calculan en base al tiempo transcurrido</li>
      </ul>
    </div>
  </div>
)}


        </main>
      </div>

      {showPriceModal && selectedAsset && (
        <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modificar Precio - {selectedAsset.symbol}</h3>
              <button className="modal-close" onClick={() => setShowPriceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Precio Actual</label>
                <div className="current-price">€{selectedAsset.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="form-group">
                <label>Nuevo Precio</label>
                <input
                  type="number"
                  className="price-input"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPriceModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={updatePrice}>Actualizar Precio</button>
            </div>
          </div>
        </div>
      )}

      {showNewsModal && (
        <div className="modal-overlay" onClick={() => {
          setShowNewsModal(false);
          setEditingNewsId(null);
          setNewsTitle('');
          setNewsContent('');
          setNewsImpact('positive');
        }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingNewsId ? 'Editar Noticia' : 'Publicar Nueva Noticia'}</h3>
              <button className="modal-close" onClick={() => {
                setShowNewsModal(false);
                setEditingNewsId(null);
                setNewsTitle('');
                setNewsContent('');
                setNewsImpact('positive');
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título de la Noticia</label>
                <input
                  type="text"
                  className="news-title-input"
                  placeholder="Ej: Bitcoin alcanza nuevos máximos"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Impacto en el Mercado</label>
                <div className="impact-selector">
                  <button
                    type="button"
                    className={`impact-option positive ${newsImpact === 'positive' ? 'active' : ''}`}
                    onClick={() => setNewsImpact('positive')}
                  >
                    ✓ Positivo
                  </button>
                  <button
                    type="button"
                    className={`impact-option negative ${newsImpact === 'negative' ? 'active' : ''}`}
                    onClick={() => setNewsImpact('negative')}
                  >
                    ✗ Negativo
                  </button>
                  <button
                    type="button"
                    className={`impact-option neutral ${newsImpact === 'neutral' ? 'active' : ''}`}
                    onClick={() => setNewsImpact('neutral')}
                  >
                    − Neutral
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Contenido</label>
                <textarea
                  className="news-content-input"
                  placeholder="Escribe el contenido de la noticia..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  rows="6"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setShowNewsModal(false);
                setEditingNewsId(null);
                setNewsTitle('');
                setNewsContent('');
                setNewsImpact('positive');
              }}>Cancelar</button>
              <button className="btn-confirm" onClick={publishNews}>
                {editingNewsId ? 'Actualizar' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}