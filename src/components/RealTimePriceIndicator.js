// src/components/RealTimePriceIndicator.js
import React from 'react';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

/**
 * Componente que muestra el estado de conexion en tiempo real
 * y la ultima actualizacion de precios
 */
const RealTimePriceIndicator = ({
  connectionStatus,
  lastUpdate,
  isUpdating,
  onRefresh,
  compact = false
}) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'SUBSCRIBED':
        return { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' };
      case 'connecting':
      case 'CONNECTING':
        return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      default:
        return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'SUBSCRIBED':
        return 'En vivo';
      case 'connecting':
      case 'CONNECTING':
        return 'Conectando...';
      default:
        return 'Desconectado';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'SUBSCRIBED':
        return <Wifi size={compact ? 14 : 16} />;
      case 'connecting':
      case 'CONNECTING':
        return <RefreshCw size={compact ? 14 : 16} style={{ animation: 'spin 1s linear infinite' }} />;
      default:
        return <WifiOff size={compact ? 14 : 16} />;
    }
  };

  const colors = getStatusColor();

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.75rem',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: colors.text,
          fontWeight: 600
        }}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {isUpdating && (
          <RefreshCw
            size={12}
            style={{ marginLeft: '0.25rem', animation: 'spin 1s linear infinite' }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '0.8rem'
      }}
    >
      <div style={{ color: colors.text }}>
        {getStatusIcon()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span
          style={{
            fontWeight: 600,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {getStatusText()}
          {(connectionStatus === 'connected' || connectionStatus === 'SUBSCRIBED') && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: colors.text,
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          )}
        </span>
        {lastUpdate && (
          <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Clock size={10} />
            {formatTime(lastUpdate)}
          </span>
        )}
      </div>

      {isUpdating && (
        <RefreshCw
          size={14}
          style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }}
        />
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isUpdating}
          style={{
            padding: '0.25rem',
            background: 'transparent',
            border: 'none',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            opacity: isUpdating ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background 0.2s'
          }}
          title="Actualizar precios manualmente"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <RefreshCw size={14} style={{ color: '#6b7280' }} />
        </button>
      )}
    </div>
  );
};

export default RealTimePriceIndicator;
