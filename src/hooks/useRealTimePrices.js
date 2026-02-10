// hooks/useRealTimePrices.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useRealTimePrices() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cargar precios iniciales desde Supabase
  const loadPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('asset_prices')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Convertir array a objeto con symbol como key
      const pricesMap = {};
      data.forEach(asset => {
        pricesMap[asset.symbol] = {
          price: asset.current_price,
          change24h: asset.change_24h,
          lastUpdate: asset.updated_at,
          name: asset.name,
          type: asset.asset_type
        };
      });

      setPrices(pricesMap);
      setLastUpdate(new Date().toISOString());
    } catch (err) {
      console.error('Error loading prices from Supabase:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscripción en tiempo real a cambios en asset_prices
  useEffect(() => {
    // Cargar precios iniciales
    loadPrices();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('asset_prices_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'asset_prices'
        },
        (payload) => {
          console.log('Price update received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newAsset = payload.new;
            setPrices(prev => ({
              ...prev,
              [newAsset.symbol]: {
                price: newAsset.current_price,
                change24h: newAsset.change_24h,
                lastUpdate: newAsset.updated_at,
                name: newAsset.name,
                type: newAsset.asset_type
              }
            }));
            setLastUpdate(new Date().toISOString());
          } else if (payload.eventType === 'DELETE') {
            setPrices(prev => {
              const newPrices = { ...prev };
              delete newPrices[payload.old.symbol];
              return newPrices;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup: desuscribirse al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [loadPrices]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    loadPrices();
  }, [loadPrices]);

  // Función para obtener precio de un símbolo específico
  const getPrice = useCallback((symbol) => {
    return prices[symbol] || null;
  }, [prices]);

  // Función para obtener múltiples precios
  const getPrices = useCallback((symbols) => {
    return symbols.map(symbol => ({
      symbol,
      ...prices[symbol]
    })).filter(item => item.price !== undefined);
  }, [prices]);

  return {
    prices,
    loading,
    error,
    lastUpdate,
    refresh,
    getPrice,
    getPrices
  };
}
