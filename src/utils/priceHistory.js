// src/utils/priceHistory.js - VERSIÓN MEJORADA

// Obtener historial REAL de cambios de precios del profesor
export const getRealPriceHistory = (symbol) => {
  const history = JSON.parse(localStorage.getItem('finmarket_price_history') || '[]');
  return history
    .filter(entry => entry.symbol === symbol)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Generar historial combinado: REAL + SIMULADO
export const generatePriceHistory = (symbol, currentPrice, days = 30) => {
  const realHistory = getRealPriceHistory(symbol);
  
  // Si hay historial real, usarlo como base
  if (realHistory.length > 0) {
    const history = [];
    const oldestReal = new Date(realHistory[0].timestamp);
    const now = new Date();
    
    // Calcular cuántos días de simulación necesitamos ANTES del primer cambio real
    const daysBeforeReal = Math.ceil((now - oldestReal) / (1000 * 60 * 60 * 24));
    const simulatedDays = Math.max(days - daysBeforeReal, 0);
    
    // Generar datos SIMULADOS para días anteriores al primer cambio real
    if (simulatedDays > 0) {
      const firstRealPrice = realHistory[0].newPrice;
      const volatility = getVolatilityByCategory(symbol);
      let price = firstRealPrice * 0.95; // Empezar un poco más bajo
      
      for (let i = simulatedDays; i > 0; i--) {
        const date = new Date(oldestReal);
        date.setDate(date.getDate() - i);
        
        const dailyChange = (Math.random() - 0.5) * 2 * volatility;
        price = price * (1 + dailyChange);
        
        history.push({
          date: date.toISOString().split('T')[0],
          timestamp: date.getTime(),
          price: parseFloat(price.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000) + 100000,
          source: 'simulated'
        });
      }
    }
    
    // Añadir datos REALES del profesor
    realHistory.forEach((entry, index) => {
      const date = new Date(entry.timestamp);
      history.push({
        date: entry.date,
        timestamp: date.getTime(),
        price: entry.newPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        source: 'real',
        changeType: entry.changeType // crisis, bull, manual, etc.
      });
    });
    
    // Añadir punto actual si es diferente del último real
    const lastReal = realHistory[realHistory.length - 1];
    if (lastReal.newPrice !== currentPrice) {
      history.push({
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        price: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        source: 'current'
      });
    }
    
    return history;
  }
  
  // Si NO hay historial real, generar todo simulado (comportamiento original)
  const history = [];
  const volatility = getVolatilityByCategory(symbol);
  let price = currentPrice * 0.9;
  const trend = Math.random() > 0.5 ? 1 : -1;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dailyChange = (Math.random() - 0.5) * 2 * volatility;
    const trendInfluence = trend * 0.001;
    
    price = price * (1 + dailyChange + trendInfluence);
    
    if (i === 0) price = currentPrice;
    
    history.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      source: 'simulated'
    });
  }
  
  return history;
};

// Función auxiliar sin cambios
const getVolatilityByCategory = (symbol) => {
  const cryptos = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'LTC'];
  const commodities = ['GOLD', 'SILVER', 'WTI', 'BRENT', 'NATGAS', 'COPPER', 'PLAT', 'WHEAT', 'CORN', 'COFFEE'];
  
  if (cryptos.includes(symbol)) return 0.05;
  else if (commodities.includes(symbol)) return 0.03;
  else return 0.02;
};

// Resto de funciones sin cambios
export const getHistoryByPeriod = (fullHistory, period) => {
  const now = new Date();
  let startDate;
  
  switch(period) {
    case '7D':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3M':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return fullHistory.filter(item => item.timestamp >= startDate.getTime());
};

export const calculateStats = (history) => {
  if (history.length < 2) return null;
  
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;
  
  const prices = history.map(h => h.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  
  return {
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    high: high.toFixed(2),
    low: low.toFixed(2),
    current: lastPrice.toFixed(2)
  };
};