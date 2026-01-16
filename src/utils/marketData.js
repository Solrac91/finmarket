// src/utils/marketData.js - Con Supabase

import { supabase } from '../supabaseClient';

// Precios base de los activos (valores por defecto de fallback)
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

// Obtener precio actual de un activo desde Supabase
export const getAssetPrice = async (symbol) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('current_price')
      .eq('symbol', symbol)
      .single();
    
    if (error) throw error;
    
    return data?.current_price || BASE_PRICES[symbol] || 0;
  } catch (error) {
    console.error('Error getting asset price:', error);
    return BASE_PRICES[symbol] || 0;
  }
};

// Actualizar precio de un activo (solo profesores)
export const updateAssetPrice = async (symbol, newPrice, changeType = 'manual', teacherId = null) => {
  try {
    // 1. Obtener asset_id y precio actual
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .select('id, current_price')
      .eq('symbol', symbol)
      .single();
    
    if (assetError) throw assetError;
    
    const oldPrice = assetData.current_price;
    const changePercent = ((parseFloat(newPrice) - oldPrice) / oldPrice * 100).toFixed(2);
    
    // 2. Actualizar precio en tabla assets
    const { error: updateError } = await supabase
      .from('assets')
      .update({ 
        current_price: parseFloat(newPrice),
        updated_at: new Date().toISOString()
      })
      .eq('id', assetData.id);
    
    if (updateError) throw updateError;
    
    // 3. Guardar en historial
    const { error: historyError } = await supabase
      .from('price_history')
      .insert([{
        asset_id: assetData.id,
        price: parseFloat(newPrice),
        changed_by: teacherId,
        change_reason: changeType
      }]);
    
    if (historyError) throw historyError;
    
    return true;
  } catch (error) {
    console.error('Error updating asset price:', error);
    return false;
  }
};

// Resetear todos los precios a valores base
export const resetAllPrices = async () => {
  try {
    // Obtener todos los activos
    const { data: assets, error: fetchError } = await supabase
      .from('assets')
      .select('id, symbol, base_price');
    
    if (fetchError) throw fetchError;
    
    // Actualizar cada activo a su precio base
    for (const asset of assets) {
      await supabase
        .from('assets')
        .update({ 
          current_price: asset.base_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting prices:', error);
    return false;
  }
};

// Obtener todas las noticias desde Supabase
export const getNews = async () => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting news:', error);
    return [];
  }
};

// Publicar noticia (solo profesores)
export const publishNews = async (title, content, impact = 'neutral', teacherId = null, category = 'general') => {
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([{
        title,
        content,
        impact,
        category,
        created_by: teacherId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error publishing news:', error);
    return null;
  }
};

// Eliminar noticia
export const deleteNews = async (newsId) => {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting news:', error);
    return false;
  }
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
export const getPriceHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .select(`
        *,
        assets (symbol, name)
      `)
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting price history:', error);
    return [];
  }
};

// Limpiar historial
export const clearPriceHistory = async () => {
  try {
    const { error } = await supabase
      .from('price_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error clearing price history:', error);
    return false;
  }
};

// Obtener historial filtrado por símbolo
export const getPriceHistoryBySymbol = async (symbol) => {
  try {
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id')
      .eq('symbol', symbol)
      .single();
    
    if (assetError) throw assetError;
    
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('asset_id', asset.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting price history by symbol:', error);
    return [];
  }
};

// Trigger de eventos de mercado
export const triggerMarketEvent = async (eventType, teacherId = null) => {
  const eventDetails = {
    'crisis': {
      title: '🔴 ALERTA: Crisis Económica Global Declarada',
      content: 'Los mercados mundiales experimentan una fuerte caída debido a incertidumbre económica. Todos los activos han sido impactados negativamente entre -15% y -30%.',
      impact: 'negative',
      priceChange: -0.20 // -20%
    },
    'crash': {
      title: '💥 CRASH DEL MERCADO: Caída Histórica',
      content: 'Se ha registrado una de las mayores caídas históricas del mercado. Los activos han perdido entre -40% y -60% de su valor.',
      impact: 'negative',
      priceChange: -0.50 // -50%
    },
    'bull': {
      title: '🚀 Bull Market: Mercado Alcista Confirmado',
      content: 'Los mercados globales experimentan un rally alcista. El optimismo impulsa todos los activos al alza con ganancias entre +15% y +25%.',
      impact: 'positive',
      priceChange: 0.20 // +20%
    },
    'crypto-crash': {
      title: '₿ Crisis en Criptomonedas: Colapso del 50%',
      content: 'El mercado de criptomonedas sufre un desplome masivo. Bitcoin, Ethereum y todas las altcoins pierden la mitad de su valor.',
      impact: 'negative',
      category: 'Crypto',
      priceChange: -0.50 // -50%
    },
    'commodities-boom': {
      title: '⛏️ Boom de Materias Primas',
      content: 'Las materias primas experimentan una subida explosiva del +20% debido a escasez global y alta demanda.',
      impact: 'positive',
      category: 'Materias Primas',
      priceChange: 0.20 // +20%
    }
  };

  const event = eventDetails[eventType];
  if (!event) return false;

  try {
    // 1. Publicar noticia
    await publishNews(event.title, event.content, event.impact, teacherId);
    
    // 2. Crear evento de mercado
    const { error: eventError } = await supabase
      .from('market_events')
      .insert([{
        name: event.title,
        description: event.content,
        impact_percentage: event.priceChange * 100,
        affected_category: event.category || null,
        created_by: teacherId
      }]);
    
    if (eventError) throw eventError;
    
    // 3. Aplicar cambios de precios
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, symbol, current_price, category');
    
    if (assetsError) throw assetsError;
    
    for (const asset of assets) {
      // Si el evento es específico de una categoría, solo afectar esa categoría
      if (event.category && asset.category !== event.category) continue;
      
      // Calcular nuevo precio con variación aleatoria
      const variation = 1 + event.priceChange + (Math.random() * 0.1 - 0.05); // ±5% adicional
      const newPrice = asset.current_price * variation;
      
      await updateAssetPrice(asset.symbol, newPrice, eventType, teacherId);
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering market event:', error);
    return false;
  }
};