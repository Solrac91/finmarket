// src/utils/timeManager.js - Sistema de gestión temporal del mercado

// Obtener el día de mercado actual
export const getMarketDay = () => {
  const stored = localStorage.getItem('finmarket_market_day');
  return stored ? parseInt(stored) : 1;
};

// Avanzar el tiempo del mercado
export const advanceMarketTime = (days) => {
  const currentDay = getMarketDay();
  const newDay = currentDay + days;
  localStorage.setItem('finmarket_market_day', newDay.toString());
  
  // Registrar el avance en historial
  const history = getTimeHistory();
  history.push({
    id: Date.now(),
    previousDay: currentDay,
    newDay: newDay,
    daysAdvanced: days,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('finmarket_time_history', JSON.stringify(history));
  
  return newDay;
};

// Obtener historial de avances temporales
export const getTimeHistory = () => {
  const stored = localStorage.getItem('finmarket_time_history');
  return stored ? JSON.parse(stored) : [];
};

// Resetear tiempo de mercado
export const resetMarketTime = () => {
  localStorage.setItem('finmarket_market_day', '1');
  localStorage.setItem('finmarket_time_history', '[]');
};

// Calcular métricas basadas en tiempo
export const getMarketPeriodInfo = (day = getMarketDay()) => {
  const week = Math.ceil(day / 7);
  const month = Math.ceil(day / 30);
  const quarter = Math.ceil(day / 90);
  const year = Math.ceil(day / 365);
  
  const dayInWeek = ((day - 1) % 7) + 1;
  const dayInMonth = ((day - 1) % 30) + 1;
  const dayInQuarter = ((day - 1) % 90) + 1;
  
  return {
    day,
    week,
    month,
    quarter,
    year,
    dayInWeek,
    dayInMonth,
    dayInQuarter,
    weekInMonth: Math.ceil(dayInMonth / 7),
    monthInQuarter: ((month - 1) % 3) + 1,
    quarterInYear: ((quarter - 1) % 4) + 1
  };
};

// Verificar si es día de pago de dividendos (cada trimestre, día 1)
export const isDividendDay = (day = getMarketDay()) => {
  return day % 90 === 0;
};

// Calcular rendimiento anualizado
export const calculateAnnualizedReturn = (initialValue, currentValue, days) => {
  if (days === 0 || initialValue === 0) return 0;
  const totalReturn = (currentValue - initialValue) / initialValue;
  const annualizedReturn = Math.pow(1 + totalReturn, 365 / days) - 1;
  return (annualizedReturn * 100).toFixed(2);
};

// Generar eventos programados según el día
export const getScheduledEvents = (day) => {
  const events = [];
  
  // Eventos trimestrales
  if (day % 90 === 0) {
    events.push({
      type: 'dividend',
      title: 'Pago de Dividendos Trimestral',
      description: 'Las empresas del IBEX 35 pagan dividendos'
    });
  }
  
  // Eventos anuales
  if (day % 365 === 0) {
    events.push({
      type: 'annual',
      title: 'Cierre Anual',
      description: 'Fin del año fiscal'
    });
  }
  
  // Eventos mensuales
  if (day % 30 === 0) {
    events.push({
      type: 'monthly',
      title: 'Reporte Mensual',
      description: 'Publicación de datos económicos'
    });
  }
  
  return events;
};

// Aplicar dividendos a las carteras de todos los usuarios
export const applyDividends = () => {
  const dividendRate = 0.02; // 2% del valor por trimestre (ejemplo)
  const updatedUsers = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('finmarket_userdata_')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key));
        
        // Aplicar dividendos solo a acciones IBEX 35
        userData.portfolio.forEach(asset => {
          const assetCategory = getAssetCategory(asset.symbol);
          if (assetCategory === 'IBEX 35') {
            const dividend = asset.value * dividendRate;
            userData.balance += dividend;
            
            // Registrar transacción de dividendo
            userData.transactions.unshift({
              type: 'dividend',
              symbol: asset.symbol,
              amount: dividend,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              description: `Dividendo trimestral de ${asset.symbol}`
            });
          }
        });
        
        localStorage.setItem(key, JSON.stringify(userData));
        updatedUsers.push(key.replace('finmarket_userdata_', ''));
      } catch (e) {
        console.error('Error applying dividends:', e);
      }
    }
  }
  
  return updatedUsers;
};

// Función auxiliar para obtener categoría de activo
const getAssetCategory = (symbol) => {
  const ibex35 = ['SAN', 'BBVA', 'IBE', 'TEF', 'ITX', 'REP', 'CABK', 'ACS', 'FER', 'ENG', 
                  'AENA', 'IAG', 'NTGY', 'RED', 'ELE', 'GRF', 'MAP', 'COL', 'MRL', 'ACX',
                  'ANA', 'SAB', 'CLNX', 'FDR', 'IDR', 'LOG', 'MEL', 'PHM', 'ROVI', 'SLR',
                  'UNI', 'VIS', 'SGRE', 'AMA', 'ALM'];
  
  return ibex35.includes(symbol) ? 'IBEX 35' : null;
};

// Aplicar volatilidad diaria automática a todos los precios
export const applyDailyVolatility = () => {
  const customPrices = JSON.parse(localStorage.getItem('finmarket_custom_prices') || '{}');
  let changesCount = 0;
  
  Object.keys(customPrices).forEach(symbol => {
    const currentPrice = customPrices[symbol];
    // Volatilidad diaria: ±0.5% a ±2%
    const volatility = (Math.random() * 0.025) - 0.0125; // Entre -1.25% y +1.25%
    const newPrice = currentPrice * (1 + volatility);
    
    customPrices[symbol] = parseFloat(newPrice.toFixed(2));
    changesCount++;
  });
  
  localStorage.setItem('finmarket_custom_prices', JSON.stringify(customPrices));
  return changesCount;
};