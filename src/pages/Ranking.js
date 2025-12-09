import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Ranking.css';
import { 
  TrendingUp, 
  Trophy,
  Medal,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  ChevronDown,
  Activity,
  Wallet,
  Bell,
  Settings,
  Search,
  Book,
} from 'lucide-react';

export default function Ranking() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener todos los usuarios del localStorage
  const getAllUsers = () => {
    const users = [];
    
    // Recorrer todas las keys del localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Buscar keys que contengan datos de usuario
      if (key && key.startsWith('finmarket_userdata_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          const email = key.replace('finmarket_userdata_', '');
          
          // Calcular totales
          const invested = userData.portfolio?.reduce((sum, item) => sum + item.value, 0) || 0;
          const totalValue = userData.balance + invested;
          const initialBalance = 50000;
          const performance = ((totalValue - initialBalance) / initialBalance) * 100;
          const profit = totalValue - initialBalance;
          
          users.push({
            email: email,
            name: email.split('@')[0],
            balance: userData.balance || 0,
            invested: invested,
            totalValue: totalValue,
            performance: performance,
            profit: profit,
            transactions: userData.transactions?.length || 0
          });
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
    // Ordenar por valor total (descendente)
    return users.sort((a, b) => b.totalValue - a.totalValue);
  };

  const [rankedUsers, setRankedUsers] = useState(getAllUsers());

  useEffect(() => {
    // Actualizar ranking cada 5 segundos
    const interval = setInterval(() => {
      setRankedUsers(getAllUsers());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredUsers = rankedUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMedalIcon = (position) => {
    if (position === 1) return <Trophy size={24} className="gold-medal" />;
    if (position === 2) return <Medal size={24} className="silver-medal" />;
    if (position === 3) return <Award size={24} className="bronze-medal" />;
    return <span className="position-number">#{position}</span>;
  };

  return (
    <div className="ranking-container">
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
              placeholder="Buscar usuarios..." 
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
            <Link to="/ranking" className="nav-item active">
              <TrendingUp size={20} />
              <span>Ranking</span>
            </Link>
            <Link to="/news" className="nav-item">
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
          <div className="ranking-header">
            <div className="ranking-title-section">
              <Trophy size={40} className="ranking-icon" />
              <div>
                <h1 className="ranking-title">Clasificación de Traders</h1>
                <p className="ranking-subtitle">Compite con tus compañeros y aprende de los mejores</p>
              </div>
            </div>
            <div className="ranking-stats">
              <div className="stat-box">
                <span className="stat-number">{rankedUsers.length}</span>
                <span className="stat-label">Participantes</span>
              </div>
            </div>
          </div>

          {/* Top 3 Podio */}
          {rankedUsers.length >= 3 && (
            <div className="podium">
              {/* Segundo lugar */}
              <div className="podium-item second">
                <div className="podium-medal">
                  <Medal size={40} className="silver-medal" />
                </div>
                <div className="podium-user">
                  <div className="podium-avatar">{rankedUsers[1].name.charAt(0).toUpperCase()}</div>
                  <div className="podium-name">{rankedUsers[1].name}</div>
                  <div className="podium-value">€{rankedUsers[1].totalValue.toLocaleString('es-ES')}</div>
                  <div className={`podium-performance ${rankedUsers[1].performance >= 0 ? 'positive' : 'negative'}`}>
                    {rankedUsers[1].performance >= 0 ? '+' : ''}{rankedUsers[1].performance.toFixed(2)}%
                  </div>
                </div>
                <div className="podium-rank">2</div>
              </div>

              {/* Primer lugar */}
              <div className="podium-item first">
                <div className="podium-medal">
                  <Trophy size={48} className="gold-medal" />
                </div>
                <div className="podium-user">
                  <div className="podium-avatar champion">{rankedUsers[0].name.charAt(0).toUpperCase()}</div>
                  <div className="podium-name">{rankedUsers[0].name}</div>
                  <div className="podium-value">€{rankedUsers[0].totalValue.toLocaleString('es-ES')}</div>
                  <div className={`podium-performance ${rankedUsers[0].performance >= 0 ? 'positive' : 'negative'}`}>
                    {rankedUsers[0].performance >= 0 ? '+' : ''}{rankedUsers[0].performance.toFixed(2)}%
                  </div>
                </div>
                <div className="podium-rank champion">1</div>
              </div>

              {/* Tercer lugar */}
              <div className="podium-item third">
                <div className="podium-medal">
                  <Award size={36} className="bronze-medal" />
                </div>
                <div className="podium-user">
                  <div className="podium-avatar">{rankedUsers[2].name.charAt(0).toUpperCase()}</div>
                  <div className="podium-name">{rankedUsers[2].name}</div>
                  <div className="podium-value">€{rankedUsers[2].totalValue.toLocaleString('es-ES')}</div>
                  <div className={`podium-performance ${rankedUsers[2].performance >= 0 ? 'positive' : 'negative'}`}>
                    {rankedUsers[2].performance >= 0 ? '+' : ''}{rankedUsers[2].performance.toFixed(2)}%
                  </div>
                </div>
                <div className="podium-rank">3</div>
              </div>
            </div>
          )}

          {/* Tabla completa */}
          <div className="ranking-table-section">
            <h2 className="section-title">Clasificación Completa</h2>
            <div className="ranking-table">
              <div className="table-header">
                <div className="th rank-col">Pos.</div>
                <div className="th">Usuario</div>
                <div className="th">Valor Total</div>
                <div className="th">Rendimiento</div>
                <div className="th">Beneficio</div>
                <div className="th">Operaciones</div>
              </div>
              {filteredUsers.map((user, index) => {
                const isCurrentUser = user.email === currentUser?.id;
                return (
                  <div 
                    key={user.email} 
                    className={`table-row ${isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}`}
                  >
                    <div className="td rank-col">
                      {getMedalIcon(index + 1)}
                    </div>
                    <div className="td user-info">
                      <div className="user-avatar-small">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="user-name">
                          {user.name}
                          {isCurrentUser && <span className="you-badge">Tú</span>}
                        </div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="td value-col">€{user.totalValue.toLocaleString('es-ES')}</div>
                    <div className={`td change ${user.performance >= 0 ? 'positive' : 'negative'}`}>
                      {user.performance >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {user.performance >= 0 ? '+' : ''}{user.performance.toFixed(2)}%
                    </div>
                    <div className={`td ${user.profit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                      €{user.profit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="td">{user.transactions}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}