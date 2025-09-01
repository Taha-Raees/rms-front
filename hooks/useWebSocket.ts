'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface WebSocketEvent {
  type: 'pos_cart_update' | 'pos_cart_cleared' | 'pos_payment_started' | 'pos_order_completed' | 'stock_update' | 'order_status' | 'payment_received' | 'low_stock_alert' | 'new_order';
  data: any;
  timestamp: Date;
}

interface UseWebSocketOptions {
  storeId?: string;
  onMessage?: (event: WebSocketEvent) => void;
  onOpen?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    storeId,
    onMessage,
    onOpen,
    onError,
    onClose,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = () => {
    if (socketRef.current?.connected) return;

    console.log('WebSocket: Attempting to connect...', {
      url: WEBSOCKET_URL,
      storeId
    });

    if (!storeId) {
      setError('Store ID is required to connect');
      console.error('WebSocket: No storeId provided');
      return;
    }

    socketRef.current = io(WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      path: '/socket.io', // Default Socket.IO path, not /websocket
      auth: {
        storeId,
      },
      timeout: 10000, // 10 second timeout
      forceNew: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      onOpen?.();
    });

    socket.on('connection_established', (data: unknown) => {
      console.log('WebSocket connection established:', data);
    });

    socket.on('stock_update', (data: unknown) => {
      onMessage?.({ type: 'stock_update', data, timestamp: new Date() });
    });

    socket.on('order_status', (data: unknown) => {
      onMessage?.({ type: 'order_status', data, timestamp: new Date() });
    });

    socket.on('payment_received', (data: unknown) => {
      onMessage?.({ type: 'payment_received', data, timestamp: new Date() });
    });

    socket.on('low_stock_alert', (data: unknown) => {
      onMessage?.({ type: 'low_stock_alert', data, timestamp: new Date() });
    });

    socket.on('new_order', (data: unknown) => {
      onMessage?.({ type: 'new_order', data, timestamp: new Date() });
    });

    // Handle POS events from other connections
    socket.on('pos_cart_update', (data: unknown) => {
      onMessage?.({ type: 'pos_cart_update', data, timestamp: new Date() });
    });

    socket.on('pos_cart_cleared', (data: unknown) => {
      onMessage?.({ type: 'pos_cart_cleared', data, timestamp: new Date() });
    });

    socket.on('pos_payment_started', (data: unknown) => {
      onMessage?.({ type: 'pos_payment_started', data, timestamp: new Date() });
    });

    socket.on('pos_order_completed', (data: unknown) => {
      onMessage?.({ type: 'pos_order_completed', data, timestamp: new Date() });
    });

    socket.on('error', (err: Error) => {
      console.error('WebSocket error:', err);
      setError(err.message);
      onError?.(err);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('WebSocket connect error:', err);
      setError(`Connection failed: ${err.message}`);
    });

    socket.on('reconnect_attempt', () => {
      console.log('WebSocket: Attempting to reconnect...');
    });

    socket.on('reconnect', () => {
      console.log('WebSocket: Reconnected successfully');
    });

    socket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      onClose?.();
      console.log('WebSocket disconnected:', reason);
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (event: WebSocketEvent) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event.type, event.data);
    } else {
      console.warn('WebSocket not connected. Cannot send message.');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [storeId]); // Reconnect if storeId changes

  return {
    isConnected,
    error,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
