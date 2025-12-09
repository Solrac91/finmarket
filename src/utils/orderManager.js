// src/utils/orderManager.js - Sistema de órdenes avanzadas

import { getAssetPrice } from './marketData';

// Crear nueva orden
export const createOrder = (userId, symbol, type, triggerPrice, shares) => {
  const orders = getOrders(userId);
  
  const newOrder = {
    id: Date.now(),
    userId,
    symbol,
    type, // 'stop-loss' o 'take-profit'
    triggerPrice: parseFloat(triggerPrice),
    shares: parseFloat(shares),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  localStorage.setItem(`finmarket_orders_${userId}`, JSON.stringify(orders));
  
  return newOrder;
};

// Obtener órdenes de un usuario
export const getOrders = (userId, status = null) => {
  const orders = JSON.parse(localStorage.getItem(`finmarket_orders_${userId}`) || '[]');
  
  if (status) {
    return orders.filter(order => order.status === status);
  }
  
  return orders;
};

// Verificar y ejecutar órdenes pendientes
export const checkAndExecuteOrders = (userId, userData, setUserData) => {
  const pendingOrders = getOrders(userId, 'pending');
  let ordersExecuted = false;
  
  pendingOrders.forEach(order => {
    const currentPrice = getAssetPrice(order.symbol);
    let shouldExecute = false;
    
    if (order.type === 'stop-loss' && currentPrice <= order.triggerPrice) {
      shouldExecute = true;
    } else if (order.type === 'take-profit' && currentPrice >= order.triggerPrice) {
      shouldExecute = true;
    }
    
    if (shouldExecute) {
      // Ejecutar venta automática
      executeOrder(order, currentPrice, userData, setUserData);
      ordersExecuted = true;
    }
  });
  
  return ordersExecuted;
};

// Ejecutar una orden específica
const executeOrder = (order, executionPrice, userData, setUserData) => {
  // Verificar que el usuario tiene el activo
  const portfolioAsset = userData.portfolio.find(p => p.symbol === order.symbol);
  
  if (!portfolioAsset || portfolioAsset.shares < order.shares) {
    // Cancelar orden si no hay suficientes acciones
    cancelOrder(order.userId, order.id);
    return;
  }
  
  // Realizar venta
  const total = order.shares * executionPrice;
  const newBalance = userData.balance + total;
  
  let newPortfolio;
  if (order.shares === portfolioAsset.shares) {
    // Vender todo
    newPortfolio = userData.portfolio.filter(p => p.symbol !== order.symbol);
  } else {
    // Vender parcial
    newPortfolio = userData.portfolio.map(p =>
      p.symbol === order.symbol
        ? {
            ...p,
            shares: p.shares - order.shares,
            value: (p.shares - order.shares) * executionPrice
          }
        : p
    );
  }
  
  // Registrar transacción
  const newTransaction = {
    type: 'sell',
    symbol: order.symbol,
    shares: order.shares,
    price: executionPrice,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    orderType: order.type, // Para identificar que fue automática
    triggeredBy: order.type === 'stop-loss' ? 'Stop-Loss' : 'Take-Profit'
  };
  
  // Actualizar estado del usuario
  const updatedData = {
    balance: newBalance,
    portfolio: newPortfolio,
    transactions: [newTransaction, ...userData.transactions]
  };
  
  setUserData(updatedData);
  
  // Marcar orden como ejecutada
  markOrderAsExecuted(order.userId, order.id, executionPrice);
  
  // Notificación
  showOrderExecutedNotification(order, executionPrice);
};

// Marcar orden como ejecutada
const markOrderAsExecuted = (userId, orderId, executionPrice) => {
  const orders = getOrders(userId);
  const updated = orders.map(order => 
    order.id === orderId 
      ? {
          ...order,
          status: 'executed',
          executedAt: new Date().toISOString(),
          executionPrice
        }
      : order
  );
  
  localStorage.setItem(`finmarket_orders_${userId}`, JSON.stringify(updated));
};

// Cancelar orden
export const cancelOrder = (userId, orderId) => {
  const orders = getOrders(userId);
  const updated = orders.map(order =>
    order.id === orderId
      ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() }
      : order
  );
  
  localStorage.setItem(`finmarket_orders_${userId}`, JSON.stringify(updated));
};

// Eliminar orden
export const deleteOrder = (userId, orderId) => {
  const orders = getOrders(userId);
  const filtered = orders.filter(order => order.id !== orderId);
  localStorage.setItem(`finmarket_orders_${userId}`, JSON.stringify(filtered));
};

// Notificación visual
const showOrderExecutedNotification = (order, price) => {
  const orderType = order.type === 'stop-loss' ? 'Stop-Loss' : 'Take-Profit';
  const message = `✓ ${orderType} ejecutado: ${order.symbol} vendido a €${price.toFixed(2)}`;
  
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