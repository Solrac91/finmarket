import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { generatePriceHistory, getHistoryByPeriod, calculateStats, getRealPriceHistory } from '../utils/priceHistory';
import './PriceChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

export default function PriceChart({ asset, onClose }) {
  const [period, setPeriod] = useState('1M');
  const [fullHistory, setFullHistory] = useState([]);
  const [displayHistory, setDisplayHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [realEvents, setRealEvents] = useState([]);

  useEffect(() => {
    // Obtener eventos reales del profesor
    const realChanges = getRealPriceHistory(asset.symbol);
    setRealEvents(realChanges);
    
    // Generar historial completo (combina real + simulado)
    const history = generatePriceHistory(asset.symbol, asset.price, 365);
    setFullHistory(history);
  }, [asset]);

  useEffect(() => {
    if (fullHistory.length > 0) {
      const filtered = getHistoryByPeriod(fullHistory, period);
      setDisplayHistory(filtered);
      setStats(calculateStats(filtered));
    }
  }, [fullHistory, period]);

  // Crear anotaciones para eventos del profesor
  const getAnnotations = () => {
    if (!displayHistory.length) return {};

    const annotations = {};
    const displayTimestamps = displayHistory.map(h => h.timestamp);
    
    realEvents.forEach((event, idx) => {
      const eventTimestamp = new Date(event.timestamp).getTime();
      
      // Solo mostrar eventos dentro del período visible
      if (eventTimestamp >= displayTimestamps[0] && 
          eventTimestamp <= displayTimestamps[displayTimestamps.length - 1]) {
        
        const eventIndex = displayHistory.findIndex(h => h.timestamp >= eventTimestamp);
        
        if (eventIndex !== -1) {
          annotations[`event${idx}`] = {
            type: 'line',
            xMin: eventIndex,
            xMax: eventIndex,
            borderColor: getEventColor(event.changeType),
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: getEventLabel(event.changeType),
              enabled: true,
              position: 'top',
              backgroundColor: getEventColor(event.changeType),
              color: 'white',
              font: {
                size: 10,
                weight: 'bold'
              }
            }
          };
        }
      }
    });

    return annotations;
  };

  const getEventColor = (changeType) => {
    switch(changeType) {
      case 'crisis':
      case 'crash':
      case 'crypto-crash':
        return '#ef4444'; // Rojo
      case 'bull':
      case 'commodities-boom':
        return '#10b981'; // Verde
      case 'manual':
        return '#667eea'; // Morado
      default:
        return '#6b7280'; // Gris
    }
  };

  const getEventLabel = (changeType) => {
    switch(changeType) {
      case 'crisis': return '📉 Crisis';
      case 'crash': return '💥 Crash';
      case 'bull': return '🚀 Bull';
      case 'crypto-crash': return '₿ Crypto Crisis';
      case 'commodities-boom': return '⛏️ Boom';
      case 'manual': return '✏️ Ajuste';
      default: return '📊 Evento';
    }
  };

  const chartData = {
    labels: displayHistory.map(item => item.date),
    datasets: [
      {
        label: `${asset.symbol} - ${asset.name}`,
        data: displayHistory.map(item => item.price),
        borderColor: stats && parseFloat(stats.changePercent) >= 0 ? '#10b981' : '#ef4444',
        backgroundColor: stats && parseFloat(stats.changePercent) >= 0 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: displayHistory.map(item => item.source === 'real' ? 4 : 0),
        pointBackgroundColor: displayHistory.map(item => 
          item.source === 'real' ? '#667eea' : 'transparent'
        ),
        pointBorderColor: displayHistory.map(item => 
          item.source === 'real' ? '#ffffff' : 'transparent'
        ),
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        borderWidth: 2,
        segment: {
          borderColor: (ctx) => {
            const curr = displayHistory[ctx.p0DataIndex];
            const next = displayHistory[ctx.p1DataIndex];
            // Línea más gruesa entre puntos reales
            if (curr?.source === 'real' || next?.source === 'real') {
              return '#667eea';
            }
            return undefined;
          },
          borderWidth: (ctx) => {
            const curr = displayHistory[ctx.p0DataIndex];
            const next = displayHistory[ctx.p1DataIndex];
            if (curr?.source === 'real' || next?.source === 'real') {
              return 3;
            }
            return 2;
          }
        }
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const dataPoint = displayHistory[context.dataIndex];
            const price = `€${context.parsed.y.toFixed(2)}`;
            
            if (dataPoint.source === 'real') {
              return [
                price,
                '🔵 Precio modificado por profesor'
              ];
            } else if (dataPoint.source === 'simulated') {
              return [
                price,
                '📊 Dato simulado'
              ];
            }
            return price;
          }
        }
      },
      annotation: {
        annotations: getAnnotations()
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 8,
          color: '#9ca3af'
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          callback: (value) => `€${value.toFixed(0)}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const periods = ['7D', '1M', '3M', '1Y'];

  // Contar eventos reales en el período visible
  const visibleEvents = realEvents.filter(event => {
    const eventTime = new Date(event.timestamp).getTime();
    return displayHistory.some(h => Math.abs(h.timestamp - eventTime) < 86400000); // 1 día
  });

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chart-header">
          <div className="chart-title-section">
            <h2 className="chart-title">{asset.symbol}</h2>
            <p className="chart-subtitle">{asset.name}</p>
          </div>
          <button className="chart-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {stats && (
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Precio Actual</span>
              <span className="stat-value">€{stats.current}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cambio</span>
              <span className={`stat-value ${parseFloat(stats.changePercent) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(stats.changePercent) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {parseFloat(stats.changePercent) >= 0 ? '+' : ''}{stats.changePercent}% (€{stats.change})
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">€{stats.high}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">€{stats.low}</span>
            </div>
          </div>
        )}

        {visibleEvents.length > 0 && (
          <div style={{ 
            padding: '1rem 2rem', 
            background: '#fffbeb', 
            borderBottom: '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            <AlertCircle size={16} />
            <span>
              <strong>{visibleEvents.length}</strong> evento{visibleEvents.length > 1 ? 's' : ''} del profesor en este período
            </span>
          </div>
        )}

        <div className="period-selector">
          {periods.map(p => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Leyenda */}
        <div style={{ 
          padding: '1rem 2rem', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '2rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#667eea' }}></div>
            <span>Cambio del profesor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '2px', background: '#10b981' }}></div>
            <span>Datos simulados</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '2px', background: '#ef4444', borderStyle: 'dashed' }}></div>
            <span>Eventos de mercado</span>
          </div>
        </div>
      </div>
    </div>
  );
}