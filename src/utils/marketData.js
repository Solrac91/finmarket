// src/utils/marketData.js
import { supabase } from '../supabaseClient';

// Obtener noticias desde Supabase
export const getNews = async () => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Publicar noticia (solo para profesores)
export const publishNews = async (newsData) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([newsData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error publishing news:', error);
    throw error;
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
    throw error;
  }
};

// Obtener precio de un activo desde Supabase
export const getAssetPrice = async (symbol) => {
  try {
    const { data, error } = await supabase
      .from('asset_prices')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error) throw error;
    return data?.current_price || 0;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
};

// Actualizar precio de un activo (solo para profesores)
export const updateAssetPrice = async (symbol, newPrice, change24h = 0) => {
  try {
    const { data, error } = await supabase
      .from('asset_prices')
      .update({
        current_price: newPrice,
        change_24h: change24h,
        updated_at: new Date().toISOString()
      })
      .eq('symbol', symbol)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating price for ${symbol}:`, error);
    throw error;
  }
};

// Obtener historial de precios
export const getPriceHistory = async (symbol, days = 30) => {
  try {
    // Calcular fecha de inicio
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('symbol', symbol)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching price history for ${symbol}:`, error);
    return [];
  }
};

// Limpiar historial de precios (solo para profesores)
export const clearPriceHistory = async (symbol) => {
  try {
    const { error } = await supabase
      .from('price_history')
      .delete()
      .eq('symbol', symbol);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error clearing price history for ${symbol}:`, error);
    throw error;
  }
};

// Disparar evento de mercado (solo para profesores)
export const triggerMarketEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('market_events')
      .insert([{
        ...eventData,
        triggered_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error triggering market event:', error);
    throw error;
  }
};

// Función helper para formato de tiempo relativo
export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'hace un momento';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
};

// Formatear precio
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '$0.00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Obtener todos los precios
export const getAllPrices = async () => {
  try {
    const { data, error } = await supabase
      .from('asset_prices')
      .select('*')
      .order('symbol', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all prices:', error);
    return [];
  }
};