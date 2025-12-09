import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { calculateAllMetrics } from '../utils/studentAnalytics';
import { getAssetPrice } from '../utils/marketData';
import { Line } from 'react-chartjs-2';
import './StudentAnalysis.css';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity,
  Clock,
  PieChart,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { generateStudentReport } from '../utils/pdfExport';
import { Download } from 'lucide-react';
import { getMarketDay, calculateAnnualizedReturn } from '../utils/timeManager';
export default function StudentAnalysis() {
  const { email } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar que es un profesor
    if (currentUser?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    // Cargar datos del estudiante
    const key = `finmarket_userdata_${email}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      alert('Estudiante no encontrado');
      navigate('/teacher');
      return;
    }

    const userData = JSON.parse(data);
    
    // Actualizar precios actuales del portfolio
    const updatedPortfolio = userData.portfolio.map(asset => ({
      ...asset,
      currentPrice: getAssetPrice(asset.symbol),
      currentValue: asset.shares * getAssetPrice(asset.symbol)
    }));

    const fullData = {
      ...userData,
      portfolio: updatedPortfolio,
      email: email,
      name: email.split('@')[0]
    };

    setStudentData(fullData);
    
    // Calcular métricas
    const calculatedMetrics = calculateAllMetrics(fullData);
    setMetrics(calculatedMetrics);
    
    setLoading(false);
  }, [email, currentUser, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Cargando análisis...</div>
        </div>
      </div>
    );
  }

  if (!studentData || !metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error al cargar los datos del estudiante</h2>
        <Link to="/teacher" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Volver al panel de profesor
        </Link>
      </div>
    );
  }

  // Calcular valores totales
  const invested = studentData.portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalValue = studentData.balance + invested;
  const initialBalance = 50000;
  const performance = ((totalValue - initialBalance) / initialBalance) * 100;
  const profit = totalValue - initialBalance;

  return (
    <div className="student-analysis-container">
      {/* Header */}
      <div className="analysis-header">
  <div style={{ display: 'flex', gap: '1rem' }}>
    <button className="btn-back" onClick={() => navigate('/teacher')}>
      <ArrowLeft size={20} />
      Volver
    </button>
    <button 
      className="btn-download"
      onClick={() => generateStudentReport(studentData, metrics)}
    >
      <Download size={20} />
      Descargar PDF
    </button>
  </div>
        
        <div className="student-info-header">
          <div className="student-avatar-large">
            {studentData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="student-name-title">{studentData.name}</h1>
            <p className="student-email-subtitle">{studentData.email}</p>
          </div>
        </div>
      </div>

      {/* Resumen general */}
      <div className="summary-grid">
        <div className="metric-card highlight">
          <div className="metric-icon">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Valor Total</div>
            <div className="metric-value">€{totalValue.toLocaleString('es-ES')}</div>
            <div className={`metric-change ${performance >= 0 ? 'positive' : 'negative'}`}>
              {performance >= 0 ? '+' : ''}{performance.toFixed(2)}% (€{profit.toLocaleString('es-ES')})
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Target size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Win Rate</div>
            <div className="metric-value">{metrics.winRate}%</div>
            <div className="metric-subtitle">
              {metrics.winRate >= 50 ? '✓ Por encima del 50%' : '⚠ Por debajo del 50%'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <PieChart size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Diversificación</div>
            <div className="metric-value">{metrics.diversification.score}/4</div>
            <div className="metric-subtitle">
              {metrics.diversification.categories.join(', ') || 'Sin activos'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Retorno Promedio</div>
            <div className="metric-value">
              {metrics.avgReturnPerTrade >= 0 ? '+' : ''}{metrics.avgReturnPerTrade}%
            </div>
            <div className="metric-subtitle">Por operación</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Holding Promedio</div>
            <div className="metric-value">{metrics.avgHoldingTime} días</div>
            <div className="metric-subtitle">
              {metrics.avgHoldingTime < 7 ? 'Day trader' : metrics.avgHoldingTime < 30 ? 'Swing trader' : 'Largo plazo'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Award size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Operaciones</div>
            <div className="metric-value">{metrics.totalTrades}</div>
            <div className="metric-subtitle">
              {metrics.activeTrades} posiciones activas
            </div>
          </div>
        </div>
      </div>

<div className="metric-card">
  <div className="metric-icon">
    <TrendingUp size={24} />
  </div>
  <div className="metric-content">
    <div className="metric-label">Rendimiento Anualizado</div>
    <div className="metric-value">
      {metrics.annualizedReturn >= 0 ? '+' : ''}{metrics.annualizedReturn}%
    </div>
    <div className="metric-subtitle">
      Basado en {metrics.marketDay} días de mercado
    </div>
  </div>
</div>

      {/* Mejor y peor operación */}
      <div className="trades-comparison">
        <div className="trade-card best">
          <div className="trade-card-header">
            <TrendingUp size={20} />
            <h3>Mejor Operación</h3>
          </div>
          {metrics.bestTrade ? (
            <>
              <div className="trade-symbol">{metrics.bestTrade.symbol}</div>
              <div className="trade-profit positive">
                +€{metrics.bestTrade.profit.toFixed(2)} 
                <span className="trade-percent">(+{metrics.bestTrade.profitPercent.toFixed(2)}%)</span>
              </div>
              <div className="trade-details">
                <div>Compra: €{metrics.bestTrade.buyPrice.toFixed(2)}</div>
                <div>Venta: €{metrics.bestTrade.sellPrice.toFixed(2)}</div>
                <div>Acciones: {metrics.bestTrade.shares}</div>
              </div>
            </>
          ) : (
            <div className="no-trades">Sin operaciones cerradas</div>
          )}
        </div>

        <div className="trade-card worst">
          <div className="trade-card-header">
            <TrendingDown size={20} />
            <h3>Peor Operación</h3>
          </div>
          {metrics.worstTrade ? (
            <>
              <div className="trade-symbol">{metrics.worstTrade.symbol}</div>
              <div className="trade-profit negative">
                €{metrics.worstTrade.profit.toFixed(2)} 
                <span className="trade-percent">({metrics.worstTrade.profitPercent.toFixed(2)}%)</span>
              </div>
              <div className="trade-details">
                <div>Compra: €{metrics.worstTrade.buyPrice.toFixed(2)}</div>
                <div>Venta: €{metrics.worstTrade.sellPrice.toFixed(2)}</div>
                <div>Acciones: {metrics.worstTrade.shares}</div>
              </div>
            </>
          ) : (
            <div className="no-trades">Sin operaciones cerradas</div>
          )}
        </div>
      </div>

      {/* Portfolio Actual */}
      <div className="portfolio-section">
        <h2 className="section-title">
          <PieChart size={24} />
          Portfolio Actual
        </h2>
        
        {studentData.portfolio.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>El estudiante no tiene activos en su cartera</p>
          </div>
        ) : (
          <div className="portfolio-table">
            <div className="table-header">
              <div className="th">Activo</div>
              <div className="th">Cantidad</div>
              <div className="th">Precio Medio</div>
              <div className="th">Precio Actual</div>
              <div className="th">Valor</div>
              <div className="th">Ganancia/Pérdida</div>
            </div>
            {studentData.portfolio.map((asset) => {
              const profit = asset.currentValue - (asset.shares * asset.avgPrice);
              const profitPercent = (profit / (asset.shares * asset.avgPrice)) * 100;

              return (
                <div key={asset.symbol} className="table-row">
                  <div className="td asset-info">
                    <div className="asset-symbol">{asset.symbol}</div>
                    <div className="asset-name">{asset.name}</div>
                  </div>
                  <div className="td">{asset.shares.toFixed(2)}</div>
                  <div className="td">€{asset.avgPrice.toFixed(2)}</div>
                  <div className="td">€{asset.currentPrice.toFixed(2)}</div>
                  <div className="td">€{asset.currentValue.toFixed(2)}</div>
                  <div className={`td ${profit >= 0 ? 'positive' : 'negative'}`}>
                    {profit >= 0 ? '+' : ''}€{profit.toFixed(2)}
                    <span className="profit-percent">
                      ({profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial de Transacciones */}
      <div className="transactions-section">
        <h2 className="section-title">
          <Activity size={24} />
          Historial de Transacciones ({studentData.transactions.length})
        </h2>
        
        {studentData.transactions.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>El estudiante no ha realizado transacciones</p>
          </div>
        ) : (
          <div className="transactions-table">
            {studentData.transactions.slice(0, 20).map((tx, index) => (
              <div key={index} className={`transaction-row ${tx.type}`}>
                <div className="transaction-badge">
                  {tx.type === 'buy' ? 'COMPRA' : 'VENTA'}
                </div>
                <div className="transaction-content">
                  <div className="transaction-main">
                    <span className="transaction-symbol">{tx.symbol}</span>
                    <span className="transaction-details">
                      {tx.shares} acciones × €{tx.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{tx.date}</span>
                    <span className="transaction-time">{tx.time}</span>
                  </div>
                </div>
                <div className="transaction-total">
                  €{(tx.shares * tx.price).toFixed(2)}
                </div>
              </div>
            ))}
            
            {studentData.transactions.length > 20 && (
              <div className="show-more">
                Mostrando las 20 transacciones más recientes de {studentData.transactions.length} totales
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}