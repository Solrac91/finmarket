// src/utils/priceAPI.js

// ==========================================
// OBTENER PRECIO DE CRIPTOMONEDAS (CoinGecko)
// ==========================================
export const getCryptoPrice = async (symbol) => {
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
// OBTENER PRECIO DE ACCIONES (Twelve Data)
// ==========================================
export const getStockPrice = async (symbol) => {
  const TWELVE_DATA_KEY = process.env.REACT_APP_TWELVE_DATA_KEY;
  
  if (!TWELVE_DATA_KEY) {
    console.error('Twelve Data API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`
    );
    const data = await response.json();
    
    if (data.price) {
      return parseFloat(data.price);
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
};

// ==========================================
// OBTENER PRECIO SEGÚN CATEGORÍA
// ==========================================
export const getRealTimePrice = async (symbol, category) => {
  try {
    let price = null;

    if (category === 'Crypto') {
      price = await getCryptoPrice(symbol);
    } else if (category === 'IBEX 35' || category === 'ETF' || category === 'Materias Primas') {
      price = await getStockPrice(symbol);
    }

    return price;
  } catch (error) {
    console.error(`Error getting real-time price for ${symbol}:`, error);
    return null;
  }
};

// ==========================================
// ACTUALIZAR TODOS LOS PRECIOS (función principal)
// ==========================================
export const updateAllRealPrices = async (onProgress) => {
  const { supabase } = await import('../supabaseClient');
  
  try {
    // 1. Obtener todos los activos en modo AUTO
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('price_mode', 'auto');

    if (error) {
      throw new Error(`Error fetching assets: ${error.message}`);
    }

    console.log(`📊 Found ${assets.length} assets in AUTO mode`);

    let updatedCount = 0;
    let errorCount = 0;
    const results = [];

    // 2. Actualizar precios de cada activo
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      
      try {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: assets.length,
            symbol: asset.symbol,
            status: 'updating'
          });
        }

        console.log(`Updating ${asset.symbol} (${asset.category})...`);
        
        const newPrice = await getRealTimePrice(asset.symbol, asset.category);
        
        if (newPrice !== null && newPrice > 0) {
          // Actualizar precio en Supabase
          const { error: updateError } = await supabase
            .from('assets')
            .update({
              current_price: newPrice,
              last_api_update: new Date().toISOString()
            })
            .eq('id', asset.id);

          if (updateError) {
            console.error(`Error updating ${asset.symbol}:`, updateError);
            errorCount++;
            results.push({ symbol: asset.symbol, status: 'error', error: updateError.message });
          } else {
            console.log(`✅ Updated ${asset.symbol}: €${newPrice}`);
            updatedCount++;
            results.push({ symbol: asset.symbol, status: 'success', price: newPrice });
          }
        } else {
          console.log(`⚠️ No price available for ${asset.symbol}`);
          errorCount++;
          results.push({ symbol: asset.symbol, status: 'no_price' });
        }

        // Pequeña pausa para no saturar las APIs (solo para acciones, crypto es más tolerante)
        if (asset.category !== 'Crypto') {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo entre llamadas
        } else {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms para crypto
        }

      } catch (error) {
        console.error(`Error processing ${asset.symbol}:`, error);
        errorCount++;
        results.push({ symbol: asset.symbol, status: 'error', error: error.message });
      }
    }

    console.log(`✅ Update complete: ${updatedCount} updated, ${errorCount} errors`);

    return {
      success: true,
      updated: updatedCount,
      errors: errorCount,
      total: assets.length,
      results: results
    };

  } catch (error) {
    console.error('Fatal error in update process:', error);
    return {
      success: false,
      error: error.message
    };
  }
};