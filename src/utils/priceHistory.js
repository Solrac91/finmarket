// src/utils/priceHistory.js
import { supabase } from '../supabaseClient';

/**
 * Genera historial de precios simulado para gráficos
 * Útil cuando no hay historial real disponible
 */
export const generatePriceHistory = (symbol, currentPrice, days = 365) => {
  const history = [];
  const now = new Date();
  
  // Generar puntos de datos históricos con variación realista
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Variación aleatoria del ±2% por día
    const variance = (Math.random() - 0.5) * 0.04;
    const historicalPrice = currentPrice * (1 + variance * (i / days));
    
    history.push({
      date: date.toISOString(),
      price: parseFloat(historicalPrice.toFixed(2)),
      timestamp: date.getTime()
    });
  }
  
  return history;
};

/**
 * Obtiene historial real de precios desde Supabase
 */
export const getRealPriceHistory = async (symbol) => {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('symbol', symbol)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Si no hay historial real, obtener precio actual y generar
      const { data: assetData } = await supabase
        .from('asset_prices')
        .select('current_price')
        .eq('symbol', symbol)
        .single();
      
      if (assetData) {
        return generatePriceHistory(symbol, assetData.current_price, 30);
      }
      return [];
    }
    
    return data.map(entry => ({
      date: entry.timestamp,
      price: entry.price,
      timestamp: new Date(entry.timestamp).getTime()
    }));
  } catch (error) {
    console.error(`Error fetching real price history for ${symbol}:`, error);
    return [];
  }
};

/**
 * Filtra historial por período
 */
export const getHistoryByPeriod = (history, period) => {
  if (!history || history.length === 0) return [];
  
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '1D':
      startDate.setDate(now.getDate() - 1);
      break;
    case '1W':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'ALL':
      return history;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }
  
  return history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate;
  });
};

/**
 * Calcula estadísticas del historial
 */
export const calculateStats = (history) => {
  if (!history || history.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      change: 0,
      changePercent: 0
    };
  }
  
  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = firstPrice > 0 ? ((change / firstPrice) * 100) : 0;
  
  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    avg: parseFloat(avg.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2))
  };
};

/**
 * Guarda un punto de precio en el historial (solo para profesores)
 */
export const savePriceToHistory = async (symbol, price) => {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .insert([{
        symbol,
        price: parseFloat(price),
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error saving price to history for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Limpia historial de un activo específico
 */
export const clearAssetHistory = async (symbol) => {
  try {
    const { error } = await supabase
      .from('price_history')
      .delete()
      .eq('symbol', symbol);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error clearing history for ${symbol}:`, error);
    throw error;
  }
};