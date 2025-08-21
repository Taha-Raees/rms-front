'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

interface WebSocketClientProps {
  storeId: string;
  onEvent?: (event: { type: string; data: any; timestamp: Date }) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function WebSocketClient({
  storeId,
  onEvent,
  onError,
  onConnected,
  onDisconnected
}: WebSocketClientProps) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!storeId) return;

    // Connect to WebSocket server
    socketRef.current = io(WEBSOCKET_URL, {
      path: '/websocket',
      auth: {
        storeId
      }
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      setIsConnected(true);
      onConnected?.();
    });

    socket.on('connection_established', (data) => {
      console.log('Connection established:', data);
    });

    // Event handlers
    socket.on('stock_update', (data: any) => {
      console.log('Stock update:', data);
      onEvent?.({ type: 'stock_update', data, timestamp: new Date() });
    });

    socket.on('order_status', (data: any) => {
      console.log('Order status update:', data);
      onEvent?.({ type: 'order_status', data, timestamp: new Date() });
    });

    socket.on('payment_received', (data: any) => {
      console.log('Payment received:', data);
      onEvent?.({ type: 'payment_received', data, timestamp: new Date() });
    });

    socket.on('low_stock_alert', (data: any) => {
      console.log('Low stock alert:', data);
      onEvent?.({ type: 'low_stock_alert', data, timestamp: new Date() });
    });

    socket.on('new_order', (data: any) => {
      console.log('New order:', data);
      onEvent?.({ type: 'new_order', data, timestamp: new Date() });
    });

    // Error handling
    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      onError?.(new Error(error.message || 'WebSocket error'));
    });

    // Disconnection
    socket.on('disconnect', (reason: any) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      onDisconnected?.();
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [storeId, onEvent, onError, onConnected, onDisconnected]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}
