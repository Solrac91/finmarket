import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { getNews, getRelativeTime } from '../utils/marketData';
import './News.css';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Newspaper,
  AlertCircle,
  CheckCircle,
  Info,
  Book,
} from 'lucide-react';

export default function News() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterImpact, setFilterImpact] = useState('all');
  const [allNews, setAllNews] = useState([]);

// Cargar noticias desde Supabase al montar
useEffect(() => {
  const loadNews = async () => {
    const news = await getNews();
    setAllNews(news);
  };
  loadNews();
}, []);

  useEffect(() => {
  // Actualizar noticias cada 15 segundos
  const interval = setInterval(async () => {
    const news = await getNews();
    setAllNews(news);
  }, 15000); // 15 segundos para no sobrecargar

  return () => clearInterval(interval);
}, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNews = allNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesImpact = filterImpact === 'all' || news.impact === filterImpact;
    return matchesSearch && matchesImpact;
  });

  const getImpactIcon = (impact) => {
    switch(impact) {
      case 'positive':
        return <CheckCircle size={24} className="impact-icon positive" />;
      case 'negative':
        return <AlertCircle size={24} className="impact-icon negative" />;
      default:
        return <Info size={24} className="impact-icon neutral" />;
    }
  };

  const getImpactLabel = (impact) => {
    switch(impact) {
      case 'positive':
        return 'Positivo';
      case 'negative':
        return 'Negativo';
      default:
        return 'Neutral';
    }
  };

  return (
    <div className="news-container">
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
              placeholder="Buscar noticias..." 
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
            <Link to="/news" className="nav-item active">
              <Bell size={20} />
              <span>Noticias</span>
            </Link>
<Link to="/resources" className="nav-item">
  <Book size={20} />
  <span>Recursos</span>
</Link>
          </nav>
        </aside>

        <main className="dashboard-content">
          <div className="news-page-header">
            <div className="news-title-section">
              <Newspaper size={40} />
              <div>
                <h1 className="page-title">Noticias del Mercado</h1>
                <p className="page-subtitle">Mantente informado sobre los eventos que afectan a tus inversiones</p>
              </div>
            </div>

            <div className="impact-filters">
              <button
                className={`impact-filter ${filterImpact === 'all' ? 'active' : ''}`}
                onClick={() => setFilterImpact('all')}
              >
                Todas ({allNews.length})
              </button>
              <button
                className={`impact-filter positive ${filterImpact === 'positive' ? 'active' : ''}`}
                onClick={() => setFilterImpact('positive')}
              >
                Positivas ({allNews.filter(n => n.impact === 'positive').length})
              </button>
              <button
                className={`impact-filter negative ${filterImpact === 'negative' ? 'active' : ''}`}
                onClick={() => setFilterImpact('negative')}
              >
                Negativas ({allNews.filter(n => n.impact === 'negative').length})
              </button>
              <button
                className={`impact-filter neutral ${filterImpact === 'neutral' ? 'active' : ''}`}
                onClick={() => setFilterImpact('neutral')}
              >
                Neutrales ({allNews.filter(n => n.impact === 'neutral').length})
              </button>
            </div>
          </div>

          {filteredNews.length === 0 ? (
            <div className="empty-news-state">
              <Newspaper size={64} />
              <h3>No hay noticias disponibles</h3>
              <p>No se encontraron noticias que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <div className="news-grid">
              {filteredNews.map((news) => (
                <article key={news.id} className={`news-card ${news.impact}`}>
                  <div className="news-card-header">
                    <div className="news-impact">
                      {getImpactIcon(news.impact)}
                      <span className={`impact-label ${news.impact}`}>
                        {getImpactLabel(news.impact)}
                      </span>
                    </div>
                    <div className="news-time">{getRelativeTime(news.timestamp)}</div>
                  </div>
                  
                  <h2 className="news-card-title">{news.title}</h2>
                  
                  <p className="news-card-content">{news.content}</p>
                  
                  <div className="news-card-footer">
                    <div className="news-author">
                      <span>Publicado por: {news.author}</span>
                    </div>
                    <div className="news-date">
                      {new Date(news.timestamp).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}