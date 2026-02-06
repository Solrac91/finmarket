// api/update-prices.js
// Función Serverless de Vercel para actualizar precios de activos financieros
// Se ejecuta via Cron Job automático (cada 15 min) o manualmente desde el panel de profesor

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Configurar CORS para permitir llamadas desde el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Variables de entorno
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const TWELVE_DATA_KEY = process.env.REACT_APP_TWELVE_DATA_KEY;
  const ALPHA_VANTAGE_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;
  const FINNHUB_KEY = process.env.REACT_APP_FINNHUB_KEY;

  // Verificar variables de entorno
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      success: false,
      error: 'Missing Supabase environment variables',
      debug: { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const startTime = Date.now();
  console.log('🚀 Starting price update at', new Date().toISOString());

  // ==========================================
  // FUNCIONES PARA OBTENER PRECIOS REALES
  // ==========================================

  // --- CRIPTOMONEDAS via CoinGecko (GRATIS, sin API key) ---
  async function getCryptoPrices(symbols) {
    // Mapeo de símbolos a IDs de CoinGecko
    const symbolToId = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'LTC': 'litecoin',
      'ALGO': 'algorand',
      'NEAR': 'near',
      'FTM': 'fantom',
      'SAND': 'the-sandbox',
      'MANA': 'decentraland',
      'AXS': 'axie-infinity',
      'SHIB': 'shiba-inu',
      'CRO': 'crypto-com-chain',
      'AAVE': 'aave',
      'GRT': 'the-graph',
      'FIL': 'filecoin',
      'ICP': 'internet-computer',
      'VET': 'vechain',
      'HBAR': 'hedera-hashgraph',
      'EOS': 'eos',
      'THETA': 'theta-token',
      'XLM': 'stellar',
      'TRX': 'tron',
      'XMR': 'monero',
      'PEPE': 'pepe',
      'ARB': 'arbitrum',
      'OP': 'optimism',
      'SUI': 'sui',
      'APT': 'aptos',
      'SEI': 'sei-network',
      'TIA': 'celestia',
      'INJ': 'injective-protocol',
      'RENDER': 'render-token',
      'FET': 'fetch-ai',
      'WLD': 'worldcoin-wld',
      'BONK': 'bonk',
      'JUP': 'jupiter-exchange-solana',
    };

    const results = {};

    // Obtener IDs de CoinGecko para los símbolos que tenemos
    const cryptoSymbols = symbols.filter(s => symbolToId[s.toUpperCase()]);
    if (cryptoSymbols.length === 0) return results;

    const ids = cryptoSymbols.map(s => symbolToId[s.toUpperCase()]).join(',');

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000) // 10s timeout
        }
      );

      if (!response.ok) {
        console.error('CoinGecko API error:', response.status);
        return results;
      }

      const data = await response.json();

      for (const symbol of cryptoSymbols) {
        const id = symbolToId[symbol.toUpperCase()];
        if (data[id] && data[id].eur) {
          results[symbol.toUpperCase()] = data[id].eur;
        }
      }

      console.log(`✅ CoinGecko: ${Object.keys(results).length} crypto prices fetched`);
    } catch (error) {
      console.error('CoinGecko error:', error.message);
    }

    return results;
  }

  // --- ACCIONES/ETFs/ÍNDICES via Twelve Data ---
  async function getTwelveDataPrices(symbols) {
    const results = {};
    if (!TWELVE_DATA_KEY || symbols.length === 0) return results;

    // Twelve Data permite hasta 8 símbolos por llamada
    const batches = [];
    for (let i = 0; i < symbols.length; i += 8) {
      batches.push(symbols.slice(i, i + 8));
    }

    for (const batch of batches) {
      try {
        const symbolList = batch.join(',');
        const response = await fetch(
          `https://api.twelvedata.com/price?symbol=${symbolList}&apikey=${TWELVE_DATA_KEY}`,
          { signal: AbortSignal.timeout(10000) }
        );

        if (!response.ok) {
          console.error('Twelve Data API error:', response.status);
          continue;
        }

        const data = await response.json();

        // Si es un solo símbolo, la respuesta es directa
        if (batch.length === 1) {
          if (data.price) {
            results[batch[0]] = parseFloat(data.price);
          }
        } else {
          // Si son múltiples, la respuesta es un objeto con cada símbolo
          for (const symbol of batch) {
            if (data[symbol] && data[symbol].price) {
              results[symbol] = parseFloat(data[symbol].price);
            }
          }
        }

        // Esperar 300ms entre batches para no saturar la API
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Twelve Data error for batch:`, error.message);
      }
    }

    console.log(`✅ Twelve Data: ${Object.keys(results).length} prices fetched`);
    return results;
  }

  // --- ACCIONES via Finnhub (backup) ---
  async function getFinnhubPrice(symbol) {
    if (!FINNHUB_KEY) return null;

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.c && data.c > 0) {
        return data.c; // Current price
      }
      return null;
    } catch (error) {
      console.error(`Finnhub error for ${symbol}:`, error.message);
      return null;
    }
  }

  // --- ACCIONES via Alpha Vantage (backup) ---
  async function getAlphaVantagePrice(symbol) {
    if (!ALPHA_VANTAGE_KEY) return null;

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        return parseFloat(data['Global Quote']['05. price']);
      }
      return null;
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error.message);
      return null;
    }
  }

  // ==========================================
  // LÓGICA PRINCIPAL
  // ==========================================

  try {
    // 1. Obtener todos los activos en modo AUTO
    const { data: assets, error: fetchError } = await supabase
      .from('assets')
      .select('id, symbol, name, category, current_price, price_mode')
      .eq('price_mode', 'auto');

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Error fetching assets from Supabase',
        details: fetchError.message
      });
    }

    if (!assets || assets.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No assets in AUTO mode to update',
        updated: 0
      });
    }

    console.log(`📊 Found ${assets.length} assets in AUTO mode`);

    // 2. Separar activos por categoría
    const cryptoAssets = assets.filter(a => a.category === 'crypto');
    const stockAssets = assets.filter(a => 
      a.category === 'ibex35' || a.category === 'stock' || 
      a.category === 'international' || a.category === 'sp500'
    );
    const etfAssets = assets.filter(a => a.category === 'etf');
    const commodityAssets = assets.filter(a => a.category === 'commodity');
    const forexAssets = assets.filter(a => a.category === 'forex');

    // Combinar acciones, ETFs, materias primas y forex para Twelve Data
    const twelveDataAssets = [...stockAssets, ...etfAssets, ...commodityAssets, ...forexAssets];

    // 3. Obtener precios en paralelo
    const cryptoSymbols = cryptoAssets.map(a => a.symbol);
    const twelveDataSymbols = twelveDataAssets.map(a => a.symbol);

    const [cryptoPrices, twelveDataPrices] = await Promise.all([
      getCryptoPrices(cryptoSymbols),
      getTwelveDataPrices(twelveDataSymbols)
    ]);

    // 4. Actualizar precios en Supabase
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const updatedDetails = [];

    for (const asset of assets) {
      let newPrice = null;

      // Buscar el precio según la categoría
      if (asset.category === 'crypto') {
        newPrice = cryptoPrices[asset.symbol.toUpperCase()];
      } else {
        // Intentar Twelve Data primero
        newPrice = twelveDataPrices[asset.symbol];

        // Si no hay precio de Twelve Data, intentar Finnhub como backup
        if (newPrice === null || newPrice === undefined) {
          newPrice = await getFinnhubPrice(asset.symbol);
          if (newPrice) {
            console.log(`🔄 Finnhub backup used for ${asset.symbol}`);
          }
        }

        // Último recurso: Alpha Vantage
        if (newPrice === null || newPrice === undefined) {
          newPrice = await getAlphaVantagePrice(asset.symbol);
          if (newPrice) {
            console.log(`🔄 Alpha Vantage backup used for ${asset.symbol}`);
          }
        }
      }

      // Actualizar si tenemos un precio válido
      if (newPrice !== null && newPrice !== undefined && newPrice > 0) {
        const { error: updateError } = await supabase
          .from('assets')
          .update({
            current_price: newPrice,
            last_api_update: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', asset.id);

        if (updateError) {
          console.error(`❌ Error updating ${asset.symbol}:`, updateError.message);
          errorCount++;
        } else {
          updatedCount++;
          updatedDetails.push({
            symbol: asset.symbol,
            category: asset.category,
            oldPrice: asset.current_price,
            newPrice: newPrice
          });
        }
      } else {
        skippedCount++;
        console.log(`⏭️ No price found for ${asset.symbol} (${asset.category})`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n📋 Update Summary:`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ⏭️ Skipped: ${skippedCount}`);
    console.log(`   ⏱️ Duration: ${duration}s`);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      summary: {
        totalAssets: assets.length,
        updated: updatedCount,
        errors: errorCount,
        skipped: skippedCount
      },
      categories: {
        crypto: cryptoAssets.length,
        stocks: stockAssets.length,
        etf: etfAssets.length,
        commodity: commodityAssets.length,
        forex: forexAssets.length
      },
      updatedAssets: updatedDetails.slice(0, 20) // Mostrar solo los primeros 20 para no sobrecargar
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};