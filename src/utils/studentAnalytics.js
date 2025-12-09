// src/utils/studentAnalytics.js

// Calcular Win Rate (porcentaje de operaciones ganadoras)
export const calculateWinRate = (transactions, portfolio) => {
  if (!transactions || transactions.length === 0) return 0;

  const closedTrades = [];
  const holdings = {};

  // Procesar todas las transacciones
  transactions.forEach(tx => {
    if (tx.type === 'buy') {
      if (!holdings[tx.symbol]) {
        holdings[tx.symbol] = [];
      }
      holdings[tx.symbol].push({
        shares: tx.shares,
        buyPrice: tx.price,
        date: tx.date
      });
    } else if (tx.type === 'sell') {
      if (holdings[tx.symbol] && holdings[tx.symbol].length > 0) {
        let sharesToSell = tx.shares;
        
        while (sharesToSell > 0 && holdings[tx.symbol].length > 0) {
          const position = holdings[tx.symbol][0];
          const soldShares = Math.min(sharesToSell, position.shares);
          
          closedTrades.push({
            symbol: tx.symbol,
            profit: (tx.price - position.buyPrice) * soldShares,
            buyPrice: position.buyPrice,
            sellPrice: tx.price,
            shares: soldShares
          });

          if (soldShares === position.shares) {
            holdings[tx.symbol].shift();
          } else {
            position.shares -= soldShares;
          }
          
          sharesToSell -= soldShares;
        }
      }
    }
  });

  if (closedTrades.length === 0) return 0;

  const winningTrades = closedTrades.filter(trade => trade.profit > 0).length;
  return ((winningTrades / closedTrades.length) * 100).toFixed(2);
};

// Calcular Sharpe Ratio simplificado (rendimiento ajustado al riesgo)
export const calculateSharpeRatio = (portfolioHistory) => {
  if (!portfolioHistory || portfolioHistory.length < 2) return 0;

  // Calcular retornos diarios
  const returns = [];
  for (let i = 1; i < portfolioHistory.length; i++) {
    const dailyReturn = (portfolioHistory[i] - portfolioHistory[i-1]) / portfolioHistory[i-1];
    returns.push(dailyReturn);
  }

  if (returns.length === 0) return 0;

  // Media de retornos
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Desviación estándar
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Sharpe = (retorno promedio - tasa libre de riesgo) / volatilidad
  // Asumimos tasa libre de riesgo = 0 para simplificar
  const sharpe = avgReturn / stdDev;
  return sharpe.toFixed(2);
};

// Calcular diversificación (número de categorías diferentes)
export const calculateDiversification = (portfolio) => {
  if (!portfolio || portfolio.length === 0) return { score: 0, categories: [] };

  const categories = new Set();
  
  // Mapeo de símbolos a categorías (basado en tu lista de activos)
  const categoryMap = {
    // IBEX 35
    'SAN': 'IBEX 35', 'BBVA': 'IBEX 35', 'IBE': 'IBEX 35', 'TEF': 'IBEX 35',
    'ITX': 'IBEX 35', 'REP': 'IBEX 35', 'CABK': 'IBEX 35', 'ACS': 'IBEX 35',
    'FER': 'IBEX 35', 'ENG': 'IBEX 35', 'AENA': 'IBEX 35', 'IAG': 'IBEX 35',
    'NTGY': 'IBEX 35', 'RED': 'IBEX 35', 'ELE': 'IBEX 35', 'GRF': 'IBEX 35',
    'MAP': 'IBEX 35', 'COL': 'IBEX 35', 'MRL': 'IBEX 35', 'ACX': 'IBEX 35',
    'ANA': 'IBEX 35', 'SAB': 'IBEX 35', 'CLNX': 'IBEX 35', 'FDR': 'IBEX 35',
    'IDR': 'IBEX 35', 'LOG': 'IBEX 35', 'MEL': 'IBEX 35', 'PHM': 'IBEX 35',
    'ROVI': 'IBEX 35', 'SLR': 'IBEX 35', 'UNI': 'IBEX 35', 'VIS': 'IBEX 35',
    'SGRE': 'IBEX 35', 'AMA': 'IBEX 35', 'ALM': 'IBEX 35',
    // Crypto
    'BTC': 'Crypto', 'ETH': 'Crypto', 'BNB': 'Crypto', 'XRP': 'Crypto',
    'ADA': 'Crypto', 'SOL': 'Crypto', 'DOGE': 'Crypto', 'DOT': 'Crypto',
    'MATIC': 'Crypto', 'LTC': 'Crypto',
    // Materias Primas
    'GOLD': 'Materias Primas', 'SILVER': 'Materias Primas', 'WTI': 'Materias Primas',
    'BRENT': 'Materias Primas', 'NATGAS': 'Materias Primas', 'COPPER': 'Materias Primas',
    'PLAT': 'Materias Primas', 'WHEAT': 'Materias Primas', 'CORN': 'Materias Primas',
    'COFFEE': 'Materias Primas',
    // ETF
    'SPY': 'ETF', 'QQQ': 'ETF', 'VTI': 'ETF', 'IWM': 'ETF',
    'EEM': 'ETF', 'GLD': 'ETF', 'TLT': 'ETF', 'VEA': 'ETF',
    'AGG': 'ETF', 'VWO': 'ETF'
  };

  portfolio.forEach(asset => {
    const category = categoryMap[asset.symbol];
    if (category) {
      categories.add(category);
    }
  });

  return {
    score: categories.size,
    categories: Array.from(categories)
  };
};

// Encontrar mejor y peor operación
export const getBestWorstTrades = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { best: null, worst: null };
  }

  const closedTrades = [];
  const holdings = {};

  transactions.forEach(tx => {
    if (tx.type === 'buy') {
      if (!holdings[tx.symbol]) {
        holdings[tx.symbol] = [];
      }
      holdings[tx.symbol].push({
        shares: tx.shares,
        buyPrice: tx.price,
        date: tx.date
      });
    } else if (tx.type === 'sell') {
      if (holdings[tx.symbol] && holdings[tx.symbol].length > 0) {
        let sharesToSell = tx.shares;
        
        while (sharesToSell > 0 && holdings[tx.symbol].length > 0) {
          const position = holdings[tx.symbol][0];
          const soldShares = Math.min(sharesToSell, position.shares);
          
          const profit = (tx.price - position.buyPrice) * soldShares;
          const profitPercent = ((tx.price - position.buyPrice) / position.buyPrice) * 100;
          
          closedTrades.push({
            symbol: tx.symbol,
            profit: profit,
            profitPercent: profitPercent,
            buyPrice: position.buyPrice,
            sellPrice: tx.price,
            shares: soldShares,
            buyDate: position.date,
            sellDate: tx.date
          });

          if (soldShares === position.shares) {
            holdings[tx.symbol].shift();
          } else {
            position.shares -= soldShares;
          }
          
          sharesToSell -= soldShares;
        }
      }
    }
  });

  if (closedTrades.length === 0) {
    return { best: null, worst: null };
  }

  const best = closedTrades.reduce((max, trade) => 
    trade.profit > max.profit ? trade : max
  );

  const worst = closedTrades.reduce((min, trade) => 
    trade.profit < min.profit ? trade : min
  );

  return { best, worst };
};

// Calcular promedio de retorno por operación
export const calculateAvgReturnPerTrade = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;

  const closedTrades = [];
  const holdings = {};

  transactions.forEach(tx => {
    if (tx.type === 'buy') {
      if (!holdings[tx.symbol]) {
        holdings[tx.symbol] = [];
      }
      holdings[tx.symbol].push({
        shares: tx.shares,
        buyPrice: tx.price,
        date: tx.date
      });
    } else if (tx.type === 'sell') {
      if (holdings[tx.symbol] && holdings[tx.symbol].length > 0) {
        let sharesToSell = tx.shares;
        
        while (sharesToSell > 0 && holdings[tx.symbol].length > 0) {
          const position = holdings[tx.symbol][0];
          const soldShares = Math.min(sharesToSell, position.shares);
          
          const profitPercent = ((tx.price - position.buyPrice) / position.buyPrice) * 100;
          
          closedTrades.push({
            profitPercent: profitPercent
          });

          if (soldShares === position.shares) {
            holdings[tx.symbol].shift();
          } else {
            position.shares -= soldShares;
          }
          
          sharesToSell -= soldShares;
        }
      }
    }
  });

  if (closedTrades.length === 0) return 0;

  const totalReturn = closedTrades.reduce((sum, trade) => sum + trade.profitPercent, 0);
  return (totalReturn / closedTrades.length).toFixed(2);
};

// Calcular tiempo promedio de holding (en días)
export const calculateAvgHoldingTime = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;

  const holdingTimes = [];
  const holdings = {};

  transactions.forEach(tx => {
    if (tx.type === 'buy') {
      if (!holdings[tx.symbol]) {
        holdings[tx.symbol] = [];
      }
      holdings[tx.symbol].push({
        shares: tx.shares,
        buyDate: new Date(tx.date)
      });
    } else if (tx.type === 'sell') {
      if (holdings[tx.symbol] && holdings[tx.symbol].length > 0) {
        const position = holdings[tx.symbol][0];
        const sellDate = new Date(tx.date);
        const daysHeld = Math.floor((sellDate - position.buyDate) / (1000 * 60 * 60 * 24));
        
        holdingTimes.push(daysHeld);
        holdings[tx.symbol].shift();
      }
    }
  });

  if (holdingTimes.length === 0) return 0;

  const totalDays = holdingTimes.reduce((sum, days) => sum + days, 0);
  return Math.round(totalDays / holdingTimes.length);
};

// Calcular todas las métricas de una vez
export const calculateAllMetrics = (userData) => {
  const winRate = calculateWinRate(userData.transactions, userData.portfolio);
  const diversification = calculateDiversification(userData.portfolio);
  const { best, worst } = getBestWorstTrades(userData.transactions);
  const avgReturn = calculateAvgReturnPerTrade(userData.transactions);
  const avgHoldingTime = calculateAvgHoldingTime(userData.transactions);

  return {
    winRate: parseFloat(winRate),
    diversification,
    bestTrade: best,
    worstTrade: worst,
    avgReturnPerTrade: parseFloat(avgReturn),
    avgHoldingTime,
    totalTrades: userData.transactions.length,
    activeTrades: userData.portfolio.length
  };
};