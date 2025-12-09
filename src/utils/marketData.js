// src/utils/marketData.js

// Precios base de los activos (valores por defecto)
const BASE_PRICES = {
  'SAN': 3.89,
  'BBVA': 8.45,
  'IBE': 11.23,
  'TEF': 4.12,
  'ITX': 35.67,
  'REP': 14.89,
  'CABK': 4.23,
  'ACS': 39.45,
  'FER': 28.34,
  'ENG': 16.78,
  'AENA': 152.30,
  'IAG': 2.34,
  'NTGY': 22.45,
  'RED': 18.90,
  'ELE': 19.67,
  'GRF': 9.87,
  'MAP': 2.12,
  'COL': 6.45,
  'MRL': 9.34,
  'ACX': 10.23,
  'ANA': 98.45,
  'SAB': 1.23,
  'CLNX': 34.56,
  'FDR': 18.90,
  'IDR': 12.34,
  'LOG': 19.78,
  'MEL': 6.78,
  'PHM': 45.67,
  'ROVI': 52.34,
  'SLR': 14.56,
  'UNI': 1.05,
  'VIS': 56.78,
  'SGRE': 17.89,
  'AMA': 62.45,
  'ALM': 11.23,
  'BTC': 43250.00,
  'ETH': 2840.50,
  'BNB': 312.45,
  'XRP': 0.62,
  'ADA': 0.48,
  'SOL': 98.34,
  'DOGE': 0.089,
  'DOT': 7.23,
  'MATIC': 0.92,
  'LTC': 72.45,
  'GOLD': 1987.50,
  'SILVER': 23.45,
  'WTI': 78.34,
  'BRENT': 82.67,
  'NATGAS': 2.87,
  'COPPER': 3.89,
  'PLAT': 945.23,
  'WHEAT': 5.67,
  'CORN': 4.23,
  'COFFEE': 1.78,
  'SPY': 445.67,
  'QQQ': 378.90,
  'VTI': 234.56,
  'IWM': 189.34,
  'EEM': 41.23,
  'GLD': 182.45,
  'TLT': 92.34,
  'VEA': 48.67,
  'AGG': 101.23,
  'VWO': 43.89
};

// Obtener precio actual de un activo
export const getAssetPrice = (symbol) => {
  const customPrices = JSON.parse(localStorage.getItem('finmarket_custom_prices') || '{}');
  return customPrices[symbol] !== undefined ? customPrices[symbol] : BASE_PRICES[symbol];
};

// Actualizar precio de un activo (solo profesores)
export const updateAssetPrice = (symbol, newPrice, changeType = 'manual') => {
  const customPrices = JSON.parse(localStorage.getItem('finmarket_custom_prices') || '{}');
  const oldPrice = customPrices[symbol] !== undefined ? customPrices[symbol] : BASE_PRICES[symbol];
  
  customPrices[symbol] = parseFloat(newPrice);
  localStorage.setItem('finmarket_custom_prices', JSON.stringify(customPrices));
  
  // Guardar en historial
  const history = JSON.parse(localStorage.getItem('finmarket_price_history') || '[]');
  const historyEntry = {
    id: Date.now(),
    symbol: symbol,
    oldPrice: oldPrice,
    newPrice: parseFloat(newPrice),
    changePercent: ((parseFloat(newPrice) - oldPrice) / oldPrice * 100).toFixed(2),
    changeType: changeType, // 'manual', 'crisis', 'bull', etc.
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES'),
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
  
  history.unshift(historyEntry); // Añadir al principio
  
  // Mantener solo los últimos 500 cambios
  if (history.length > 500) {
    history.pop();
  }
  
  localStorage.setItem('finmarket_price_history', JSON.stringify(history));
  
  return true;
};

// Resetear todos los precios a valores base
export const resetAllPrices = () => {
  localStorage.removeItem('finmarket_custom_prices');
  return true;
};

// Obtener todas las noticias
export const getNews = () => {
  const news = JSON.parse(localStorage.getItem('finmarket_news') || '[]');
  return news.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Publicar noticia (solo profesores)
export const publishNews = (title, content, impact = 'neutral') => {
  const news = getNews();
  const newArticle = {
    id: Date.now(),
    title,
    content,
    impact, // 'positive', 'negative', 'neutral'
    timestamp: new Date().toISOString(),
    author: 'Profesor'
  };
  news.unshift(newArticle);
  localStorage.setItem('finmarket_news', JSON.stringify(news));
  return newArticle;
};

// Eliminar noticia
export const deleteNews = (newsId) => {
  const news = getNews();
  const filtered = news.filter(n => n.id !== newsId);
  localStorage.setItem('finmarket_news', JSON.stringify(filtered));
  return true;
};

// Obtener tiempo relativo (ej: "Hace 2 horas")
export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return past.toLocaleDateString('es-ES');
};
// Obtener historial de cambios de precios
export const getPriceHistory = () => {
  const history = JSON.parse(localStorage.getItem('finmarket_price_history') || '[]');
  return history;
};

// Limpiar historial
export const clearPriceHistory = () => {
  localStorage.removeItem('finmarket_price_history');
  return true;
};

// Obtener historial filtrado por símbolo
export const getPriceHistoryBySymbol = (symbol) => {
  const history = getPriceHistory();
  return history.filter(entry => entry.symbol === symbol);
};
// En utils/marketData.js - AÑADIR esta función

export const triggerMarketEvent = (eventType) => {
  const eventDetails = {
    'crisis': {
      title: '🔴 ALERTA: Crisis Económica Global Declarada',
      content: 'Los mercados mundiales experimentan una fuerte caída debido a incertidumbre económica. Todos los activos han sido impactados negativamente entre -15% y -30%.',
      impact: 'negative'
    },
    'crash': {
      title: '💥 CRASH DEL MERCADO: Caída Histórica',
      content: 'Se ha registrado una de las mayores caídas históricas del mercado. Los activos han perdido entre -40% y -60% de su valor. Los inversores están en modo pánico.',
      impact: 'negative'
    },
    'bull': {
      title: '🚀 Bull Market: Mercado Alcista Confirmado',
      content: 'Los mercados globales experimentan un rally alcista. El optimismo impulsa todos los activos al alza con ganancias entre +15% y +25%.',
      impact: 'positive'
    },
    'crypto-crash': {
      title: '₿ Crisis en Criptomonedas: Colapso del 50%',
      content: 'El mercado de criptomonedas sufre un desplome masivo. Bitcoin, Ethereum y todas las altcoins pierden la mitad de su valor en cuestión de horas.',
      impact: 'negative'
    },
    'commodities-boom': {
      title: '⛏️ Boom de Materias Primas',
      content: 'Las materias primas experimentan una subida explosiva del +20% debido a escasez global y alta demanda. Oro, petróleo y metales industriales lideran las ganancias.',
      impact: 'positive'
    }
  };

  const event = eventDetails[eventType];
  if (event) {
    // Publicar noticia automática con timestamp especial
    publishNews(event.title, event.content, event.impact);
    
    // Marcar como evento importante en localStorage
    const events = JSON.parse(localStorage.getItem('finmarket_market_events') || '[]');
    events.unshift({
      id: Date.now(),
      type: eventType,
      timestamp: new Date().toISOString(),
      title: event.title
    });
    localStorage.setItem('finmarket_market_events', JSON.stringify(events));
  }
};