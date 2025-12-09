import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // No autenticado, redirigir al login
    return <Navigate to="/login" />;
  }

  if (requireRole && currentUser.role !== requireRole) {
    // No tiene el rol requerido
    return <Navigate to="/dashboard" />;
  }

  return children;
}