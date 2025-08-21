'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface WebSocketEvent {
  type: 'pos_cart_update' | 'pos_order_completed' | 'pos_cart_cleared' | 'pos_payment_started' | 'stock_update' | 'order_status' | 'payment_received' | 'low_stock_alert' | 'new_order';
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

    if (!storeId) {
      setError('Store ID is required to connect');
      return;
    }

    socketRef.current = io(WEBSOCKET_URL, {
      path: '/websocket',
      auth: {
        storeId,
      },
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

    socket.on('error', (err: Error) => {
      setError(err.message);
      onError?.(err);
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
