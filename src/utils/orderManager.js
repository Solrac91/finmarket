// src/utils/orderManager.js - Sistema de órdenes avanzadas con Supabase

import { supabase } from '../supabaseClient';
import { getAssetPrice } from './marketData';

// Crear nueva orden
export const createOrder = async (userId, symbol, type, triggerPrice, shares) => {
  try {
    const newOrder = {
      user_id: userId,
      asset_symbol: symbol,
      order_type: type, // 'stop-loss' o 'take-profit'
      trigger_price: parseFloat(triggerPrice),
      quantity: parseFloat(shares),
      status: 'pending'
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Obtener órdenes de un usuario
export const getOrders = async (userId, status = null) => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Verificar y ejecutar órdenes pendientes
export const checkAndExecuteOrders = async (userId, currentUser, setCurrentUser) => {
  try {
    const pendingOrders = await getOrders(userId, 'pending');
    let ordersExecuted = false;
    
    for (const order of pendingOrders) {
      const currentPrice = await getAssetPrice(order.asset_symbol);
      let shouldExecute = false;
      
      if (order.order_type === 'stop-loss' && currentPrice <= order.trigger_price) {
        shouldExecute = true;
      } else if (order.order_type === 'take-profit' && currentPrice >= order.trigger_price) {
        shouldExecute = true;
      }
      
      if (shouldExecute) {
        await executeOrder(order, currentPrice, currentUser, setCurrentUser);
        ordersExecuted = true;
      }
    }
    
    return ordersExecuted;
  } catch (error) {
    console.error('Error checking orders:', error);
    return false;
  }
};

// Ejecutar una orden específica
const executeOrder = async (order, executionPrice, currentUser, setCurrentUser) => {
  try {
    // 1. Obtener asset_id del símbolo
    const { data: assetData } = await supabase
      .from('assets')
      .select('id, name')
      .eq('symbol', order.asset_symbol)
      .single();
    
    if (!assetData) {
      console.error('Asset not found:', order.asset_symbol);
      await cancelOrder(order.user_id, order.id);
      return;
    }
    
    // 2. Verificar que el usuario tiene el activo en portfolio
    const { data: portfolioItem } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', order.user_id)
      .eq('asset_id', assetData.id)
      .single();
    
    if (!portfolioItem || portfolioItem.quantity < order.quantity) {
      // No tiene suficientes acciones, cancelar orden
      await cancelOrder(order.user_id, order.id);
      return;
    }
    
    // 3. Calcular valores
    const total = order.quantity * executionPrice;
    const commission = total * 0.001; // 0.1% comisión
    const netTotal = total - commission;
    const newBalance = currentUser.balance + netTotal;
    
    // 4. Actualizar balance del usuario
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', order.user_id);
    
    if (balanceError) throw balanceError;
    
    // 5. Crear transacción de venta
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: order.user_id,
        asset_id: assetData.id,
        type: 'sell',
        quantity: order.quantity,
        price: executionPrice,
        total: netTotal,
        balance_after: newBalance
      }]);
    
    if (transactionError) throw transactionError;
    
    // 6. Actualizar o eliminar del portfolio
    if (order.quantity === portfolioItem.quantity) {
      // Vender todo - eliminar del portfolio
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioItem.id);
      
      if (deleteError) throw deleteError;
    } else {
      // Venta parcial - actualizar cantidad
      const newQuantity = portfolioItem.quantity - order.quantity;
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({ quantity: newQuantity })
        .eq('id', portfolioItem.id);
      
      if (updateError) throw updateError;
    }
    
    // 7. Marcar orden como ejecutada
    await markOrderAsExecuted(order.user_id, order.id, executionPrice);
    
    // 8. Actualizar estado local del usuario
    setCurrentUser({
      ...currentUser,
      balance: newBalance
    });
    
    // 9. Notificación
    showOrderExecutedNotification(order, executionPrice);
    
  } catch (error) {
    console.error('Error executing order:', error);
  }
};

// Marcar orden como ejecutada
const markOrderAsExecuted = async (userId, orderId, executionPrice) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
        execution_price: executionPrice
      })
      .eq('id', orderId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error marking order as executed:', error);
  }
};

// Cancelar orden
export const cancelOrder = async (userId, orderId) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
};

// Eliminar orden
export const deleteOrder = async (userId, orderId) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};

// Notificación visual
const showOrderExecutedNotification = (order, price) => {
  const orderType = order.order_type === 'stop-loss' ? 'Stop-Loss' : 'Take-Profit';
  const message = `✓ ${orderType} ejecutado: ${order.asset_symbol} vendido a €${price.toFixed(2)}`;
  
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 600;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
};

// Validar orden antes de crear
export const validateOrder = (type, triggerPrice, currentPrice) => {
  if (type === 'stop-loss' && triggerPrice >= currentPrice) {
    return { valid: false, error: 'El stop-loss debe estar por debajo del precio actual' };
  }
  
  if (type === 'take-profit' && triggerPrice <= currentPrice) {
    return { valid: false, error: 'El take-profit debe estar por encima del precio actual' };
  }
  
  if (triggerPrice <= 0) {
    return { valid: false, error: 'El precio debe ser mayor a 0' };
  }
  
  return { valid: true };
};