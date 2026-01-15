// api/update-prices.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  // Variables de entorno
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const TWELVE_DATA_KEY = process.env.REACT_APP_TWELVE_DATA_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🚀 Starting price update...');
  
  try {
    // Test simple primero
    const { data: assets, error } = await supabase
      .from('assets')
      .select('symbol, category, price_mode')
      .eq('price_mode', 'auto')
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Error fetching assets', 
        details: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'API is working!',
      assetsFound: assets.length,
      assets: assets
    });

  } catch (error) {
    console.error('Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};