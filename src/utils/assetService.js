// src/utils/assetService.js
import { supabase } from '../supabaseClient';

// Obtener todos los activos desde Supabase
export const getAllAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('category', { ascending: true })
      .order('symbol', { ascending: true });

    if (error) throw error;

    // Convertir a formato compatible con el código existente
    return data.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      category: asset.category,
      price: parseFloat(asset.current_price)
    }));
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
};

// Obtener precio actual de un activo
export const getAssetPrice = async (symbol) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('current_price')
      .eq('symbol', symbol)
      .single();

    if (error) throw error;
    return parseFloat(data.current_price);
  } catch (error) {
    console.error('Error fetching asset price:', error);
    return null;
  }
};

// Obtener activos por categoría
export const getAssetsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('category', category)
      .order('symbol', { ascending: true });

    if (error) throw error;

    return data.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      category: asset.category,
      price: parseFloat(asset.current_price)
    }));
  } catch (error) {
    console.error('Error fetching assets by category:', error);
    return [];
  }
};

// Actualizar precio de un activo (solo profesores)
export const updateAssetPrice = async (symbol, newPrice) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update({ 
        current_price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('symbol', symbol)
      .select();

    if (error) throw error;

    // Registrar en historial de precios
    await supabase
      .from('price_history')
      .insert({
        asset_id: data[0].id,
        price: newPrice,
        change_reason: 'Manual update'
      });

    return true;
  } catch (error) {
    console.error('Error updating asset price:', error);
    return false;
  }
};