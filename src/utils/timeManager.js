// src/utils/timeManager.js - Sistema de gestión temporal del mercado con Supabase

import { supabase } from '../supabaseClient';

// Obtener el día de mercado actual desde Supabase
export const getMarketDay = async () => {
  try {
    const { data, error } = await supabase
      .from('market_settings')
      .select('value')
      .eq('key', 'current_day')
      .single();
    
    if (error) throw error;
    
    return data ? parseInt(data.value) : 1;
  } catch (error) {
    console.error('Error getting market day:', error);
    return 1;
  }
};

// Versión síncrona para uso en estados iniciales (fallback a 1)
export const getMarketDaySync = () => {
  // Esta función se usa solo para inicialización de estados
  // El valor real se carga async después
  return 1;
};

// Avanzar el tiempo del mercado
export const advanceMarketTime = async (days) => {
  try {
    const currentDay = await getMarketDay();
    const newDay = currentDay + days;
    
    // Actualizar día en Supabase
    const { error } = await supabase
      .from('market_settings')
      .upsert([
        { key: 'current_day', value: newDay.toString() }
      ], { onConflict: 'key' });
    
    if (error) throw error;
    
    return newDay;
  } catch (error) {
    console.error('Error advancing market time:', error);
    return null;
  }
};

// Resetear tiempo de mercado
export const resetMarketTime = async () => {
  try {
    const { error } = await supabase
      .from('market_settings')
      .upsert([
        { key: 'current_day', value: '1' }
      ], { onConflict: 'key' });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error resetting market time:', error);
    return false;
  }
};

// Calcular métricas basadas en tiempo
export const getMarketPeriodInfo = (day) => {
  const week = Math.ceil(day / 7);
  const month = Math.ceil(day / 30);
  const quarter = Math.ceil(day / 90);
  const year = Math.ceil(day / 365);
  
  const dayInWeek = ((day - 1) % 7) + 1;
  const dayInMonth = ((day - 1) % 30) + 1;
  const dayInQuarter = ((day - 1) % 90) + 1;
  
  return {
    day,
    week,
    month,
    quarter,
    year,
    dayInWeek,
    dayInMonth,
    dayInQuarter,
    weekInMonth: Math.ceil(dayInMonth / 7),
    monthInQuarter: ((month - 1) % 3) + 1,
    quarterInYear: ((quarter - 1) % 4) + 1
  };
};

// Verificar si es día de pago de dividendos (cada trimestre, día múltiplo de 90)
export const isDividendDay = (day) => {
  return day % 90 === 0;
};

// Calcular rendimiento anualizado
export const calculateAnnualizedReturn = (initialValue, currentValue, days) => {
  if (days === 0 || initialValue === 0) return 0;
  const totalReturn = (currentValue - initialValue) / initialValue;
  const annualizedReturn = Math.pow(1 + totalReturn, 365 / days) - 1;
  return (annualizedReturn * 100).toFixed(2);
};

// Generar eventos programados según el día
export const getScheduledEvents = (day) => {
  const events = [];
  
  // Eventos trimestrales
  if (day % 90 === 0) {
    events.push({
      type: 'dividend',
      title: 'Pago de Dividendos Trimestral',
      description: 'Las empresas del IBEX 35 pagan dividendos'
    });
  }
  
  // Eventos anuales
  if (day % 365 === 0) {
    events.push({
      type: 'annual',
      title: 'Cierre Anual',
      description: 'Fin del año fiscal'
    });
  }
  
  // Eventos mensuales
  if (day % 30 === 0) {
    events.push({
      type: 'monthly',
      title: 'Reporte Mensual',
      description: 'Publicación de datos económicos'
    });
  }
  
  return events;
};

// Aplicar dividendos a las carteras de todos los usuarios
export const applyDividends = async () => {
  try {
    const dividendRate = 0.02; // 2% del valor por trimestre
    const updatedUsers = [];
    
    // 1. Obtener todos los estudiantes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, balance')
      .eq('role', 'student');
    
    if (usersError) throw usersError;
    
    // 2. Para cada estudiante, calcular dividendos
    for (const user of users) {
      // Obtener portfolio con activos IBEX 35
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select(`
          *,
          assets (id, symbol, name, current_price, category)
        `)
        .eq('user_id', user.id)
        .eq('assets.category', 'IBEX 35');
      
      if (portfolioError) throw portfolioError;
      
      if (!portfolio || portfolio.length === 0) continue;
      
      let totalDividends = 0;
      
      // Calcular dividendos por cada posición
      for (const position of portfolio) {
        const assetValue = position.quantity * position.assets.current_price;
        const dividend = assetValue * dividendRate;
        totalDividends += dividend;
        
        // Registrar transacción de dividendo
        await supabase
          .from('transactions')
          .insert([{
            user_id: user.id,
            asset_id: position.assets.id,
            type: 'dividend',
            quantity: 0,
            price: 0,
            total: dividend,
            balance_after: user.balance + totalDividends
          }]);
      }
      
      // 3. Actualizar balance del usuario
      if (totalDividends > 0) {
        await supabase
          .from('users')
          .update({ balance: user.balance + totalDividends })
          .eq('id', user.id);
        
        updatedUsers.push(user.email);
      }
    }
    
    return updatedUsers;
  } catch (error) {
    console.error('Error applying dividends:', error);
    return [];
  }
};

// Aplicar volatilidad diaria automática a todos los precios
export const applyDailyVolatility = async () => {
  try {
    // Obtener todos los activos
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, symbol, current_price');
    
    if (assetsError) throw assetsError;
    
    let changesCount = 0;
    
    // Aplicar volatilidad a cada activo
    for (const asset of assets) {
      // Volatilidad diaria: ±0.5% a ±2%
      const volatility = (Math.random() * 0.025) - 0.0125; // Entre -1.25% y +1.25%
      const newPrice = asset.current_price * (1 + volatility);
      
      // Actualizar precio
      await supabase
        .from('assets')
        .update({ 
          current_price: parseFloat(newPrice.toFixed(2)),
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);
      
      changesCount++;
    }
    
    return changesCount;
  } catch (error) {
    console.error('Error applying daily volatility:', error);
    return 0;
  }
};