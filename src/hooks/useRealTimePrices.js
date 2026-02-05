// src/hooks/useRealTimePrices.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getRealTimePrice } from '../utils/priceAPI';

/**
 * Hook para mantener los precios actualizados en tiempo real
 * - Actualiza precios desde APIs externas cada X segundos
 * - Escucha cambios en Supabase Realtime (cambios del profesor)
 * - Proporciona estado de conexion y ultima actualizacion
 */
export const useRealTimePrices = (options = {}) => {
  const {
    refreshInterval = 30000, // 30 segundos por defecto
    enableApiUpdates = true, // Actualizar desde APIs externas
    enableRealtimeSync = true, // Escuchar cambios de Supabase
    onPriceUpdate = null, // Callback cuando hay actualizacion
  } = options;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const intervalRef = useRef(null);
  const channelRef = useRef(null);

  // Cargar activos desde Supabase
  const loadAssets = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .order('category', { ascending: true })
        .order('symbol', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedAssets = data.map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        price: parseFloat(asset.current_price),
        basePrice: parseFloat(asset.base_price),
        priceMode: asset.price_mode,
        lastApiUpdate: asset.last_api_update,
        change: calculateChange(asset.current_price, asset.base_price)
      }));

      setAssets(formattedAssets);
      setLastUpdate(new Date());
      setError(null);

      return formattedAssets;
    } catch (err) {
      console.error('Error loading assets:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Calcular cambio porcentual
  const calculateChange = (currentPrice, basePrice) => {
    if (!basePrice || basePrice === 0) return 0;
    return ((currentPrice - basePrice) / basePrice * 100).toFixed(2);
  };

  // Actualizar precios desde APIs externas (solo para activos en modo AUTO)
  const updatePricesFromAPI = useCallback(async () => {
    if (!enableApiUpdates) return;

    setIsUpdating(true);

    try {
      const { data: autoAssets, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .eq('price_mode', 'auto');

      if (fetchError) throw fetchError;

      // Actualizar en lotes para no saturar las APIs
      const batchSize = 5;
      const batches = [];

      for (let i = 0; i < autoAssets.length; i += batchSize) {
        batches.push(autoAssets.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(
          batch.map(async (asset) => {
            try {
              const newPrice = await getRealTimePrice(asset.symbol, asset.category);

              if (newPrice !== null && newPrice > 0) {
                await supabase
                  .from('assets')
                  .update({
                    current_price: newPrice,
                    last_api_update: new Date().toISOString()
                  })
                  .eq('id', asset.id);
              }
            } catch (err) {
              console.error(`Error updating ${asset.symbol}:`, err);
            }
          })
        );

        // Pausa entre lotes para respetar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Recargar activos despues de actualizar
      await loadAssets();

      if (onPriceUpdate) {
        onPriceUpdate(assets);
      }

    } catch (err) {
      console.error('Error updating prices from API:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  }, [enableApiUpdates, loadAssets, onPriceUpdate, assets]);

  // Configurar Supabase Realtime para escuchar cambios
  const setupRealtimeSubscription = useCallback(() => {
    if (!enableRealtimeSync) return;

    // Suscribirse a cambios en la tabla assets
    const channel = supabase
      .channel('assets-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'assets'
        },
        (payload) => {
          console.log('Asset change detected:', payload);

          if (payload.eventType === 'UPDATE') {
            // Actualizar el activo especifico en el estado
            setAssets(prev => prev.map(asset => {
              if (asset.id === payload.new.id) {
                return {
                  ...asset,
                  price: parseFloat(payload.new.current_price),
                  priceMode: payload.new.price_mode,
                  lastApiUpdate: payload.new.last_api_update,
                  change: calculateChange(payload.new.current_price, payload.new.base_price)
                };
              }
              return asset;
            }));

            setLastUpdate(new Date());

            if (onPriceUpdate) {
              onPriceUpdate(assets);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : status);
      });

    channelRef.current = channel;
  }, [enableRealtimeSync, onPriceUpdate, assets]);

  // Forzar actualizacion manual
  const forceRefresh = useCallback(async () => {
    await updatePricesFromAPI();
  }, [updatePricesFromAPI]);

  // Efecto inicial: cargar activos y configurar suscripciones
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadAssets();
      setupRealtimeSubscription();
      setLoading(false);
    };

    init();

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadAssets, setupRealtimeSubscription]);

  // Efecto: configurar intervalo de actualizacion
  useEffect(() => {
    if (refreshInterval > 0 && enableApiUpdates) {
      // Primera actualizacion despues de cargar
      const initialTimeout = setTimeout(() => {
        updatePricesFromAPI();
      }, 5000); // Esperar 5 segundos antes de la primera actualizacion

      // Configurar intervalo
      intervalRef.current = setInterval(() => {
        updatePricesFromAPI();
      }, refreshInterval);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, enableApiUpdates, updatePricesFromAPI]);

  // Obtener precio de un activo especifico
  const getPrice = useCallback((symbol) => {
    const asset = assets.find(a => a.symbol === symbol);
    return asset ? asset.price : null;
  }, [assets]);

  // Obtener activos por categoria
  const getByCategory = useCallback((category) => {
    if (category === 'all') return assets;
    return assets.filter(a => a.category === category);
  }, [assets]);

  return {
    assets,
    loading,
    error,
    lastUpdate,
    isUpdating,
    connectionStatus,
    forceRefresh,
    getPrice,
    getByCategory
  };
};

export default useRealTimePrices;
