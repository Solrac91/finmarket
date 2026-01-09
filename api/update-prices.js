// api/update-prices.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TWELVE_DATA_KEY = process.env.REACT_APP_TWELVE_DATA_KEY;
const ALPHA_VANTAGE_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;
const FINNHUB_KEY = process.env.REACT_APP_FINNHUB_KEY;

// ==========================================
// OBTENER PRECIO DE CRIPTOMONEDAS (CoinGecko)
// ==========================================
async function getCryptoPrice(symbol) {
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
}

// ==========================================
// OBTENER PRECIO DE ACCIONES (Twelve Data)
// ==========================================
async function getStockPriceTwelveData(symbol) {
  try {
    // Para IBEX 35, algunos símbolos necesitan el sufijo .MAD
    const tickerSymbol = symbol;
    
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${tickerSymbol}&apikey=${TWELVE_DATA_KEY}`
    );
    const data = await response.json();
    
    if (data.price) {
      return parseFloat(data.price);
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching stock price from Twelve Data for ${symbol}:`, error);
    return null;
  }
}

// ==========================================
// OBTENER PRECIO DE ACCIONES (Alpha Vantage - Respaldo)
// ==========================================
async function getStockPriceAlphaVantage(symbol) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      return parseFloat(data['Global Quote']['05. price']);
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching stock price from Alpha Vantage for ${symbol}:`, error);
    return null;
  }
}

// ==========================================
// OBTENER PRECIO SEGÚN CATEGORÍA
// ==========================================
async function getRealTimePrice(symbol, category) {
  try {
    let price = null;

    if (category === 'crypto') {
      price = await getCryptoPrice(symbol);
    } else if (category === 'ibex35' || category === 'etf') {
      // Intentar primero con Twelve Data
      price = await getStockPriceTwelveData(symbol);
      
      // Si falla, intentar con Alpha Vantage
      if (price === null) {
        price = await getStockPriceAlphaVantage(symbol);
      }
    } else if (category === 'commodity') {
      // Para materias primas, usar Twelve Data
      price = await getStockPriceTwelveData(symbol);
    }

    return price;
  } catch (error) {
    console.error(`Error getting real-time price for ${symbol}:`, error);
    return null;
  }
}

// ==========================================
// FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN
// ==========================================
export default async function handler(req, res) {
  // Verificar que es una petición autorizada (cron job o manual)
  const authHeader = req.headers.authorization;
  
  // Para Vercel Cron, no se requiere auth
  // Para llamadas manuales, puedes añadir seguridad después
  
  console.log('🚀 Starting price update...');
  
  try {
    // 1. Obtener todos los activos en modo AUTO
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('price_mode', 'auto');

    if (error) {
      console.error('Error fetching assets:', error);
      return res.status(500).json({ error: 'Error fetching assets' });
    }

    console.log(`📊 Found ${assets.length} assets in AUTO mode`);

    let updatedCount = 0;
    let errorCount = 0;

    // 2. Actualizar precios de cada activo
    for (const asset of assets) {
      try {
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
          } else {
            console.log(`✅ Updated ${asset.symbol}: €${newPrice}`);
            updatedCount++;
          }
        } else {
          console.log(`⚠️ No price available for ${asset.symbol}`);
          errorCount++;
        }

        // Pequeña pausa para no saturar las APIs
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Error processing ${asset.symbol}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Update complete: ${updatedCount} updated, ${errorCount} errors`);

    return res.status(200).json({
      success: true,
      message: 'Prices updated successfully',
      updated: updatedCount,
      errors: errorCount,
      total: assets.length
    });

  } catch (error) {
    console.error('Fatal error in update process:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}