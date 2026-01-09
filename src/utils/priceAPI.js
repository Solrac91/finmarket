// src/utils/priceAPI.js

const ALPHA_VANTAGE_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;

// ==========================================
// 1. OBTENER PRECIO DE CRIPTOMONEDAS (CoinGecko)
// ==========================================
export const getCryptoPrice = async (symbol) => {
  // Mapeo de símbolos a IDs de CoinGecko
  const cryptoMap = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'SOL': 'solana',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin',
    'MATIC': 'matic-network',
    'LTC': 'litecoin'
  };

  const coinId = cryptoMap[symbol];
  if (!coinId) {
    console.error(`Crypto symbol ${symbol} not mapped`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur`
    );
    const data = await response.json();
    
    if (data[coinId] && data[coinId].eur) {
      return data[coinId].eur;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
};

// ==========================================
// 2. OBTENER PRECIO DE ACCIONES (Alpha Vantage)
// ==========================================
export const getStockPrice = async (symbol) => {
  try {
    // Para acciones del IBEX 35, Alpha Vantage usa el sufijo .MAD (Madrid)
    const tickerSymbol = symbol.includes('.') ? symbol : `${symbol}.MAD`;
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tickerSymbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      return parseFloat(data['Global Quote']['05. price']);
    }
    
    // Si falla con .MAD, intentar sin sufijo
    if (tickerSymbol.includes('.MAD')) {
      const response2 = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      );
      const data2 = await response2.json();
      
      if (data2['Global Quote'] && data2['Global Quote']['05. price']) {
        return parseFloat(data2['Global Quote']['05. price']);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
};

// ==========================================
// 3. OBTENER PRECIO DE MATERIAS PRIMAS (Alpha Vantage)
// ==========================================
export const getCommodityPrice = async (symbol) => {
  // Alpha Vantage usa códigos específicos para commodities
  const commodityMap = {
    'GOLD': 'XAU/USD',
    'SILVER': 'XAG/USD',
    'OIL': 'WTI',
    'BRENT': 'BRENT',
    'GAS': 'NATURAL_GAS',
    'COPPER': 'COPPER',
    'WHEAT': 'WHEAT',
    'CORN': 'CORN',
    'COFFEE': 'COFFEE',
    'SUGAR': 'SUGAR'
  };

  const commodityCode = commodityMap[symbol] || symbol;

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${commodityCode}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      return parseFloat(data['Global Quote']['05. price']);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching commodity price for ${symbol}:`, error);
    return null;
  }
};

// ==========================================
// 4. OBTENER PRECIO SEGÚN CATEGORÍA
// ==========================================
export const getRealTimePrice = async (symbol, category) => {
  try {
    let price = null;

    if (category === 'Crypto') {
      price = await getCryptoPrice(symbol);
    } else if (category === 'IBEX 35') {
      price = await getStockPrice(symbol);
    } else if (category === 'Materias Primas') {
      price = await getCommodityPrice(symbol);
    } else if (category === 'ETF') {
      price = await getStockPrice(symbol);
    }

    return price;
  } catch (error) {
    console.error(`Error getting real-time price for ${symbol}:`, error);
    return null;
  }
};

// ==========================================
// 5. ACTUALIZAR MÚLTIPLES ACTIVOS A LA VEZ
// ==========================================
export const updateAllPrices = async (assets) => {
  const updatedAssets = [];

  for (const asset of assets) {
    // Solo actualizar si está en modo "auto"
    if (asset.price_mode === 'manual') {
      updatedAssets.push(asset);
      continue;
    }

    const newPrice = await getRealTimePrice(asset.symbol, asset.category);
    
    if (newPrice !== null) {
      updatedAssets.push({
        ...asset,
        current_price: newPrice,
        last_api_update: new Date().toISOString()
      });
    } else {
      // Si falla la API, mantener el precio anterior
      updatedAssets.push(asset);
    }

    // Pequeña pausa para no saturar las APIs
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return updatedAssets;
};

// ==========================================
// 6. VERIFICAR SI EL MERCADO ESTÁ ABIERTO
// ==========================================
export const isMarketOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Domingo, 6 = Sábado
  
  // Mercado español: Lunes-Viernes, 9:00-17:30
  const isWeekday = day >= 1 && day <= 5;
  const isDuringHours = hour >= 9 && hour < 18;
  
  return isWeekday && isDuringHours;
};