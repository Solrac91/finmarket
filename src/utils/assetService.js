import { getAssetPrice } from './marketData';
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

    // Actualizar precios en tiempo real para activos en modo AUTO
    const assetsWithRealPrices = await Promise.all(
      data.map(async (asset) => {
        let currentPrice = parseFloat(asset.current_price);

        // Si está en modo AUTO, obtener precio real de la API
        if (asset.price_mode === 'auto') {
          const realPrice = await getAssetPrice(asset.symbol, asset.category);
          
          if (realPrice !== null) {
            currentPrice = realPrice;
            
            // Actualizar el precio en la base de datos
            await supabase
              .from('assets')
              .update({ 
                current_price: realPrice,
                last_api_update: new Date().toISOString()
              })
              .eq('id', asset.id);
          }
        }

        return {
          symbol: asset.symbol,
          name: asset.name,
          category: asset.category,
          price: currentPrice,
          price_mode: asset.price_mode
        };
      })
    );

    return assetsWithRealPrices;
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
      .select('current_price, price_mode, category')
      .eq('symbol', symbol)
      .single();

    if (error) throw error;

    let price = parseFloat(data.current_price);

    // Si está en modo AUTO, obtener precio real
    if (data.price_mode === 'auto') {
      const realPrice = await getAssetPrice(symbol, data.category);
      if (realPrice !== null) {
        price = realPrice;
      }
    }

    return price;
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

    // Actualizar precios en tiempo real para activos en modo AUTO
    const assetsWithRealPrices = await Promise.all(
      data.map(async (asset) => {
        let currentPrice = parseFloat(asset.current_price);

        if (asset.price_mode === 'auto') {
          const realPrice = await getAssetPrice(asset.symbol, asset.category);
          
          if (realPrice !== null) {
            currentPrice = realPrice;
            
            await supabase
              .from('assets')
              .update({ 
                current_price: realPrice,
                last_api_update: new Date().toISOString()
              })
              .eq('id', asset.id);
          }
        }

        return {
          symbol: asset.symbol,
          name: asset.name,
          category: asset.category,
          price: currentPrice,
          price_mode: asset.price_mode
        };
      })
    );

    return assetsWithRealPrices;
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
        price_mode: 'manual', // Cambiar a modo manual cuando el profesor modifica
        updated_at: new Date().toISOString()
      })
      .eq('symbol', symbol)
      .select();

    if (error) throw error;

    // Registrar en historial de precios
    if (data && data[0]) {
      await supabase
        .from('price_history')
        .insert({
          asset_id: data[0].id,
          price: newPrice,
          change_reason: 'Manual update by teacher'
        });
    }

    return true;
  } catch (error) {
    console.error('Error updating asset price:', error);
    return false;
  }
};

// NUEVO: Cambiar modo de precio (manual <-> auto)
export const setPriceMode = async (symbol, mode) => {
  try {
    const { error } = await supabase
      .from('assets')
      .update({ 
        price_mode: mode,
        updated_at: new Date().toISOString()
      })
      .eq('symbol', symbol);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error setting price mode:', error);
    return false;
  }
};

// NUEVO: Cambiar TODOS los activos a modo AUTO
export const setAllPricesAutoMode = async () => {
  try {
    const { error } = await supabase
      .from('assets')
      .update({ 
        price_mode: 'auto',
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Actualizar todos

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error setting all prices to auto mode:', error);
    return false;
  }
};
