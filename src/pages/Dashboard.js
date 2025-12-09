import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllAssets, getAssetPrice } from '../utils/assetService';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Bell,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  Filter,
  Shield,
  BarChart2,
  Book,
} from 'lucide-react';
import PriceChart from '../components/PriceChart';
import { createOrder, getOrders, checkAndExecuteOrders, validateOrder, deleteOrder, cancelOrder } from '../utils/orderManager';
import { getMarketDay, getMarketPeriodInfo } from '../utils/timeManager';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [activeTab, setActiveTab] = useState('mercado');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('buy');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedChartAsset, setSelectedChartAsset] = useState(null);
const [recentMarketEvents, setRecentMarketEvents] = useState([]);
const [settings] = useState(() => {
  const stored = localStorage.getItem('finmarket_settings');
  return stored ? JSON.parse(stored) : { commissionEnabled: false, commissionRate: 0.1 };
});
const [showOrdersModal, setShowOrdersModal] = useState(false);
const [stopLossPrice, setStopLossPrice] = useState('');
const [takeProfitPrice, setTakeProfitPrice] = useState('');
const [enableStopLoss, setEnableStopLoss] = useState(false);
const [enableTakeProfit, setEnableTakeProfit] = useState(false);
const [pendingOrders, setPendingOrders] = useState([]);
const [marketDay] = useState(getMarketDay());
const [periodInfo] = useState(getMarketPeriodInfo());

  // Cargar datos del usuario desde localStorage
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem(`finmarket_userdata_${currentUser?.id}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      balance: currentUser?.balance || 50000,
      portfolio: [],
      transactions: []
    };
  });

  // Guardar datos cuando cambien
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`finmarket_userdata_${currentUser.id}`, JSON.stringify(userData));
    }
  }, [userData, currentUser]);

  // Cargar eventos de mercado recientes
  useEffect(() => {
    const events = JSON.parse(localStorage.getItem('finmarket_market_events') || '[]');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recent = events.filter(event => 
      new Date(event.timestamp).getTime() > oneDayAgo
    ).slice(0, 3);
    setRecentMarketEvents(recent);
  }, [activeTab]);

  // Cargar órdenes pendientes al montar
  useEffect(() => {
    if (currentUser) {
      setPendingOrders(getOrders(currentUser.id, 'pending'));
    }
  }, [currentUser, userData]);

  // Declarar allAssets
  const [allAssets, setAllAssets] = useState([]);
const [loadingAssets, setLoadingAssets] = useState(true);

// Cargar activos desde Supabase al montar el componente
useEffect(() => {
  const loadAssets = async () => {
    setLoadingAssets(true);
    const assets = await getAllAssets();
    setAllAssets(assets);
    setLoadingAssets(false);
  };
  
  loadAssets();
}, []);

 // Verificar órdenes pendientes cuando cambien los precios
  useEffect(() => {
    if (currentUser) {
      const ordersWereExecuted = checkAndExecuteOrders(currentUser.id, userData, setUserData);
      if (ordersWereExecuted) {
        setPendingOrders(getOrders(currentUser.id, 'pending'));
      }
    }
  }, [allAssets, currentUser, userData]);

  // Calcular valores totales
  const calculateTotals = () => {
    const invested = userData.portfolio.reduce((sum, item) => sum + item.value, 0);
    const totalValue = userData.balance + invested;
    const initialBalance = 50000;
    const performance = ((totalValue - initialBalance) / initialBalance) * 100;
    const performanceAmount = totalValue - initialBalance;

    return { invested, totalValue, performance, performanceAmount };
  };

  const totals = calculateTotals();

  const filteredAssets = allAssets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'Todos', count: allAssets.length },
    { id: 'IBEX 35', name: 'IBEX 35', count: allAssets.filter(a => a.category === 'IBEX 35').length },
    { id: 'Crypto', name: 'Criptomonedas', count: allAssets.filter(a => a.category === 'Crypto').length },
    { id: 'Materias Primas', name: 'Materias Primas', count: allAssets.filter(a => a.category === 'Materias Primas').length },
    { id: 'ETF', name: 'ETFs', count: allAssets.filter(a => a.category === 'ETF').length }
  ];

  const recentNews = [
    { title: 'El IBEX 35 cierra con subidas del 1.2%', time: 'Hace 2 horas', impact: 'positive' },
    { title: 'Bitcoin alcanza nuevos máximos mensuales', time: 'Hace 5 horas', impact: 'positive' },
    { title: 'Telefónica anuncia dividendo extraordinario', time: 'Hace 1 día', impact: 'positive' }
  ];
const openBuyModal = (asset) => {
    setSelectedAsset(asset);
    setModalType('buy');
    setQuantity('');
    setShowModal(true);
  };

  const openSellModal = (portfolioAsset) => {
    const currentPrice = allAssets.find(a => a.symbol === portfolioAsset.symbol)?.price || portfolioAsset.currentPrice;
    setSelectedAsset({...portfolioAsset, currentPrice});
    setModalType('sell');
    setQuantity('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
    setQuantity('');
  };

  const openChart = (asset) => {
    setSelectedChartAsset(asset);
    setShowChartModal(true);
  };
 
 const calculateTotal = () => {
  if (!selectedAsset || !quantity) return 0;
  const price = selectedAsset.price || selectedAsset.currentPrice;
  const baseTotal = price * parseFloat(quantity);
  
  if (settings.commissionEnabled && modalType === 'buy') {
    const commission = baseTotal * (settings.commissionRate / 100);
    return baseTotal + commission;
  }
  
  return baseTotal;
};

const calculateCommission = () => {
  if (!selectedAsset || !quantity || !settings.commissionEnabled || modalType !== 'buy') return 0;
  const price = selectedAsset.price || selectedAsset.currentPrice;
  const baseTotal = price * parseFloat(quantity);
  return baseTotal * (settings.commissionRate / 100);
};

const getBaseTotal = () => {
  if (!selectedAsset || !quantity) return 0;
  const price = selectedAsset.price || selectedAsset.currentPrice;
  return price * parseFloat(quantity);
};

  const handleTransaction = () => {
  const total = calculateTotal();
  const qty = parseFloat(quantity);
  
  if (!qty || qty <= 0) {
    alert('Ingresa una cantidad válida');
    return;
  }

  if (modalType === 'buy') {
    // COMPRA
    if (total > userData.balance) {
      alert('Saldo insuficiente');
      return;
    }

    // Validar órdenes si están activadas
    const currentPrice = selectedAsset.price;
    
    if (enableStopLoss) {
      const slValidation = validateOrder('stop-loss', parseFloat(stopLossPrice), currentPrice);
      if (!slValidation.valid) {
        alert(slValidation.error);
        return;
      }
    }
    
    if (enableTakeProfit) {
      const tpValidation = validateOrder('take-profit', parseFloat(takeProfitPrice), currentPrice);
      if (!tpValidation.valid) {
        alert(tpValidation.error);
        return;
      }
    }

    const newBalance = userData.balance - total;
    const existingAsset = userData.portfolio.find(p => p.symbol === selectedAsset.symbol);
    let newPortfolio;

    if (existingAsset) {
      const totalShares = existingAsset.shares + qty;
      const newAvgPrice = ((existingAsset.avgPrice * existingAsset.shares) + (selectedAsset.price * qty)) / totalShares;
      newPortfolio = userData.portfolio.map(p => 
        p.symbol === selectedAsset.symbol
          ? {
              ...p,
              shares: totalShares,
              avgPrice: newAvgPrice,
              currentPrice: selectedAsset.price,
              value: totalShares * selectedAsset.price
            }
          : p
      );
    } else {
      newPortfolio = [...userData.portfolio, {
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        shares: qty,
        avgPrice: selectedAsset.price,
        currentPrice: selectedAsset.price,
        value: total
      }];
    }

    const newTransaction = {
      type: 'buy',
      symbol: selectedAsset.symbol,
      shares: qty,
      price: selectedAsset.price,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setUserData({
      balance: newBalance,
      portfolio: newPortfolio,
      transactions: [newTransaction, ...userData.transactions]
    });

    // Crear órdenes si están activadas
    if (enableStopLoss && stopLossPrice) {
      createOrder(currentUser.id, selectedAsset.symbol, 'stop-loss', parseFloat(stopLossPrice), qty);
    }
    
    if (enableTakeProfit && takeProfitPrice) {
      createOrder(currentUser.id, selectedAsset.symbol, 'take-profit', parseFloat(takeProfitPrice), qty);
    }
    
    // Actualizar lista de órdenes
    setPendingOrders(getOrders(currentUser.id, 'pending'));

  } else {
    // VENTA (sin cambios)
    const portfolioAsset = userData.portfolio.find(p => p.symbol === selectedAsset.symbol);
    
    if (!portfolioAsset) {
      alert('No tienes este activo en tu cartera');
      return;
    }

    if (qty > portfolioAsset.shares) {
      alert(`Solo tienes ${portfolioAsset.shares} unidades disponibles`);
      return;
    }

    const currentPrice = selectedAsset.currentPrice;
    const newBalance = userData.balance + total;
    let newPortfolio;

    if (qty === portfolioAsset.shares) {
      newPortfolio = userData.portfolio.filter(p => p.symbol !== selectedAsset.symbol);
    } else {
      newPortfolio = userData.portfolio.map(p =>
        p.symbol === selectedAsset.symbol
          ? {
              ...p,
              shares: p.shares - qty,
              value: (p.shares - qty) * currentPrice
            }
          : p
      );
    }

    const newTransaction = {
      type: 'sell',
      symbol: selectedAsset.symbol,
      shares: qty,
      price: currentPrice,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setUserData({
      balance: newBalance,
      portfolio: newPortfolio,
      transactions: [newTransaction, ...userData.transactions]
    });
  }

  setShowSuccess(true);
  setTimeout(() => {
    setShowSuccess(false);
    closeModal();
    // Reset órdenes
    setEnableStopLoss(false);
    setEnableTakeProfit(false);
    setStopLossPrice('');
    setTakeProfitPrice('');
  }, 2000);
};

  const handleLogout = () => {
    logout();
    navigate('/');
  };

const getEventIcon = (eventType) => {
  switch(eventType) {
    case 'crisis': return '🔴';
    case 'crash': return '💥';
    case 'bull': return '🚀';
    case 'crypto-crash': return '₿';
    case 'commodities-boom': return '⛏️';
    default: return '📊';
  }
};

const getEventColor = (eventType) => {
  switch(eventType) {
    case 'crisis':
    case 'crash':
    case 'crypto-crash':
      return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' };
    case 'bull':
    case 'commodities-boom':
      return { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46' };
    default:
      return { bg: '#e0e7ff', border: '#c7d2fe', text: '#3730a3' };
  }
};

return (
    <div className="dashboard-container">
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
              placeholder="Buscar activos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

<div className="header-center">
  <div className="search-bar">
    <Search size={18} />
    <input 
      type="text" 
      placeholder="Buscar activos..." 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
  
  {/* NUEVO: Indicador de día de mercado */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginLeft: '1rem'
  }}>
    <Activity size={16} />
    <div>
      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Día de Mercado</div>
      <div>{marketDay}</div>
    </div>
    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
      Trimestre {periodInfo.quarter} • Año {periodInfo.year}
    </div>
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
            <Link to="/dashboard" className="nav-item active">
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
            <Link to="/news" className="nav-item">
              <Bell size={20} />
              <span>Noticias</span>
            </Link>
<Link to="/resources" className="nav-item">
  <Book size={20} />
  <span>Recursos</span>
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
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-label">Saldo Disponible</span>
                <Wallet size={20} className="card-icon" />
              </div>
              <div className="card-value">€{userData.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <span className="card-label">Valor Invertido</span>
                <Activity size={20} className="card-icon" />
              </div>
              <div className="card-value">€{totals.invested.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
            </div>

            <div className="summary-card highlight">
              <div className="card-header">
                <span className="card-label">Valor Total</span>
                <TrendingUp size={20} className="card-icon" />
              </div>
              <div className="card-value">€{totals.totalValue.toLocaleString('es-ES')}</div>
              <div className={`card-change ${totals.performance >= 0 ? 'positive' : 'negative'}`}>
                {totals.performance >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{totals.performance >= 0 ? '+' : ''}{totals.performance.toFixed(2)}% ({totals.performance >= 0 ? '+' : ''}€{totals.performanceAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })})</span>
              </div>
            </div>
          </div>

{/* Banner de Alertas de Mercado */}
          {recentMarketEvents.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%)',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              animation: 'slideDown 0.4s ease'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
                  ⚠️
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: '#991b1b',
                    marginBottom: '0.75rem'
                  }}>
                    Eventos de Mercado Recientes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentMarketEvents.map((event) => {
                      const colors = getEventColor(event.type);
                      return (
                        <div 
                          key={event.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px'
                          }}
                        >
                          <span style={{ fontSize: '1.25rem' }}>
                            {getEventIcon(event.type)}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: 600, 
                              color: colors.text,
                              fontSize: '0.9rem'
                            }}>
                              {event.title}
                            </div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: '#6b7280',
                              marginTop: '0.25rem'
                            }}>
                              {new Date(event.timestamp).toLocaleString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link 
                    to="/news" 
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      color: '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textDecoration: 'none'
                    }}
                  >
                    Ver todas las noticias →
                  </Link>
                </div>
              </div>
            </div>
          )}

  {/* Tabs */}
<div className="content-tabs">
  <button 
    className={`tab-btn ${activeTab === 'mercado' ? 'active' : ''}`}
    onClick={() => setActiveTab('mercado')}
  >
    Mercado
  </button>

  <button 
    className={`tab-btn ${activeTab === 'ordenes' ? 'active' : ''}`}
    onClick={() => setActiveTab('ordenes')}
  >
    Órdenes Pendientes
  </button>
  
  <button 
    className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
    onClick={() => setActiveTab('portfolio')}
  >
    Mi Portfolio
  </button>

  <button 
    className={`tab-btn ${activeTab === 'transacciones' ? 'active' : ''}`}
    onClick={() => setActiveTab('transacciones')}
  >
    Transacciones
  </button>
</div>

{/* Tab Content */}
<div className="tab-content">
  {activeTab === 'mercado' && (
    <div className="market-section">
      <div className="market-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title">Activos Disponibles</h2>
        <div className="filter-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <Filter size={16} />
          <span>{filteredAssets.length} activos</span>
        </div>
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      <div className="assets-table">
        <div className="table-header">
          <div className="th">Activo</div>
          <div className="th">Categoría</div>
          <div className="th">Precio</div>
          <div className="th">Cambio 24h</div>
          <div className="th">Acción</div>
        </div>
        <div className="assets-table-body">
          {filteredAssets.map((asset) => (
            <div key={asset.symbol} className="table-row">
              <div className="td asset-info">
                <div className="asset-symbol">{asset.symbol}</div>
                <div className="asset-name">{asset.name}</div>
              </div>
              <div className="td">
                <span className="category-badge">{asset.category}</span>
              </div>
              <div className="td">€{asset.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
              <div className={`td change ${asset.change >= 0 ? 'positive' : 'negative'}`}>
                {asset.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(asset.change)}%
              </div>
              <div className="td">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-chart" 
                    onClick={() => openChart(asset)}
                    title="Ver gráfico"
                  >
                    <BarChart2 size={16} />
                  </button>
                  <button className="btn-buy" onClick={() => openBuyModal(asset)}>Comprar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {activeTab === 'ordenes' && (
    <div className="orders-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title">Órdenes Pendientes</h2>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {pendingOrders.length} orden{pendingOrders.length !== 1 ? 'es' : ''} activa{pendingOrders.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {pendingOrders.length === 0 ? (
        <div className="empty-state">
          <p>No tienes órdenes pendientes. Las órdenes stop-loss y take-profit aparecerán aquí.</p>
        </div>
      ) : (
        <div className="assets-table">
          <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr' }}>
            <div className="th">Activo</div>
            <div className="th">Tipo</div>
            <div className="th">Precio Trigger</div>
            <div className="th">Cantidad</div>
            <div className="th">Precio Actual</div>
            <div className="th">Acción</div>
          </div>
          <div className="assets-table-body">
            {pendingOrders.map((order) => {
              const currentPrice = getAssetPrice(order.symbol);
              const distance = ((currentPrice - order.triggerPrice) / currentPrice * 100).toFixed(2);
              
              return (
                <div key={order.id} className="table-row">
                  <div className="td asset-info">
                    <div className="asset-symbol">{order.symbol}</div>
                    <div className="asset-name" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Creada: {new Date(order.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div className="td">
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: order.type === 'stop-loss' ? '#fee2e2' : '#d1fae5',
                      color: order.type === 'stop-loss' ? '#991b1b' : '#065f46'
                    }}>
                      {order.type === 'stop-loss' ? 'STOP-LOSS' : 'TAKE-PROFIT'}
                    </span>
                  </div>
                  <div className="td">€{order.triggerPrice.toFixed(2)}</div>
                  <div className="td">{order.shares}</div>
                  <div className="td">
                    <div>€{currentPrice.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: parseFloat(distance) > 0 ? '#10b981' : '#ef4444' }}>
                      {parseFloat(distance) > 0 ? '+' : ''}{distance}%
                    </div>
                  </div>
                  <div className="td">
                    <button 
                      onClick={() => {
                        if (window.confirm('¿Cancelar esta orden?')) {
                          deleteOrder(currentUser.id, order.id);
                          setPendingOrders(getOrders(currentUser.id, 'pending'));
                        }
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )}

  {activeTab === 'portfolio' && (
              <div className="portfolio-section">
                <h2 className="section-title">Mi Cartera</h2>
                {userData.portfolio.length === 0 ? (
                  <div className="empty-state">
                    <p>No tienes activos en tu cartera. ¡Empieza a invertir!</p>
                  </div>
                ) : (
                  <div className="assets-table">
                    <div className="table-header">
                      <div className="th">Activo</div>
                      <div className="th">Cantidad</div>
                      <div className="th">Precio Medio</div>
                      <div className="th">Precio Actual</div>
                      <div className="th">Valor</div>
                      <div className="th">Beneficio</div>
                      <div className="th">Acción</div>
                    </div>
                    <div className="assets-table-body">
                      {userData.portfolio.map((asset) => {
                        const currentPrice = allAssets.find(a => a.symbol === asset.symbol)?.price || asset.currentPrice;
                        const currentValue = asset.shares * currentPrice;
                        const profit = currentValue - (asset.shares * asset.avgPrice);
                        const profitPercent = (profit / (asset.shares * asset.avgPrice)) * 100;

                        return (
                          <div key={asset.symbol} className="table-row">
                            <div className="td asset-info">
                              <div className="asset-symbol">{asset.symbol}</div>
                              <div className="asset-name">{asset.name}</div>
                            </div>
                            <div className="td">{asset.shares}</div>
                            <div className="td">€{asset.avgPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                            <div className="td">€{currentPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                            <div className="td">€{currentValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                            <div className={`td change ${profit >= 0 ? 'positive' : 'negative'}`}>
                              {profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              €{Math.abs(profit).toLocaleString('es-ES', { minimumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)
                            </div>
                            <div className="td">
                              <button className="btn-sell" onClick={() => openSellModal({...asset, currentPrice})}>Vender</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transacciones' && (
              <div className="transactions-section">
                <h2 className="section-title">Historial de Transacciones</h2>
                {userData.transactions.length === 0 ? (
                  <div className="empty-state">
                    <p>No tienes transacciones registradas aún.</p>
                  </div>
                ) : (
                  <div className="transactions-list">
                    {userData.transactions.map((transaction, index) => (
                      <div key={index} className="transaction-item">
                        <div className={`transaction-type ${transaction.type}`}>
                          {transaction.type === 'buy' ? 'COMPRA' : 'VENTA'}
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-asset">{transaction.symbol}</div>
                          <div className="transaction-info">
                            {transaction.shares} acciones a €{transaction.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="transaction-date">
                          <div>{transaction.date}</div>
                          <div className="transaction-time">{transaction.time}</div>
                        </div>
                        <div className="transaction-total">
                          €{(transaction.shares * transaction.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
{/* Modal de Compra/Venta */}
      {showModal && selectedAsset && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'buy' ? 'Comprar' : 'Vender'} {selectedAsset.symbol}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="asset-details">
                <div className="asset-detail-row">
                  <span className="detail-label">Activo:</span>
                  <span className="detail-value">{selectedAsset.name || selectedAsset.symbol}</span>
                </div>
                <div className="asset-detail-row">
                  <span className="detail-label">Precio actual:</span>
                  <span className="detail-value">€{(selectedAsset.price || selectedAsset.currentPrice).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="asset-detail-row">
                  <span className="detail-label">Tu saldo:</span>
                  <span className="detail-value">€{userData.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="quantity-input-group">
                <label className="input-label">Cantidad</label>
                <input
                  type="number"
                  className="quantity-input"
                  placeholder="Ej: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

{modalType === 'buy' && (
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ 
      background: '#f9fafb', 
      padding: '1rem', 
      borderRadius: '10px',
      marginBottom: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={enableStopLoss}
            onChange={(e) => setEnableStopLoss(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          Stop-Loss (protección)
        </label>
        {enableStopLoss && (
          <input
            type="number"
            placeholder="Precio"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(e.target.value)}
            step="0.01"
            style={{
              width: '120px',
              padding: '0.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          />
        )}
      </div>
      {enableStopLoss && (
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '1.5rem' }}>
          Venta automática si el precio baja a €{stopLossPrice || '0'}
        </div>
      )}
    </div>

    <div style={{ 
      background: '#f9fafb', 
      padding: '1rem', 
      borderRadius: '10px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={enableTakeProfit}
            onChange={(e) => setEnableTakeProfit(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          Take-Profit (objetivo)
        </label>
        {enableTakeProfit && (
          <input
            type="number"
            placeholder="Precio"
            value={takeProfitPrice}
            onChange={(e) => setTakeProfitPrice(e.target.value)}
            step="0.01"
            style={{
              width: '120px',
              padding: '0.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          />
        )}
      </div>
      {enableTakeProfit && (
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '1.5rem' }}>
          Venta automática si el precio sube a €{takeProfitPrice || '0'}
        </div>
      )}
    </div>
  </div>
)}

         {quantity && (
  <div className="transaction-summary">
    <div className="summary-row">
      <span>Subtotal:</span>
      <span>€{getBaseTotal().toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
    </div>
    
    {settings.commissionEnabled && modalType === 'buy' && (
      <div className="summary-row commission">
        <span>Comisión ({settings.commissionRate}%):</span>
        <span>€{calculateCommission().toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
      </div>
    )}
    
    <div className="summary-row total">
      <span>Total:</span>
      <span className="total-amount">€{calculateTotal().toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
    </div>
    
    {modalType === 'buy' && (
      <div className="summary-row">
        <span>Saldo después:</span>
        <span className={calculateTotal() > userData.balance ? 'insufficient' : ''}>
          €{(userData.balance - calculateTotal()).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </span>
      </div>
    )}
  </div>
)}

              {showSuccess && (
                <div className="success-message">
                  ✓ Transacción realizada con éxito
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button 
                className={`btn-confirm ${modalType === 'buy' ? 'buy' : 'sell'}`}
                onClick={handleTransaction}
              >
                {modalType === 'buy' ? 'Comprar' : 'Vender'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gráfico */}
      {showChartModal && selectedChartAsset && (
        <PriceChart 
          asset={selectedChartAsset} 
          onClose={() => setShowChartModal(false)} 
        />
      )}
    </div>
  );
}