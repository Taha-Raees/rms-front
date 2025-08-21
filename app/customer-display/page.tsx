'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WebSocketEvent } from '@/hooks/useWebSocket';
import { format } from 'date-fns';
import { ShoppingCart, Wifi, WifiOff, CheckCircle, XCircle, Clock, Package, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext'; // Import useApp

interface DisplayItem {
  id: string;
  productName: string;
  brand?: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
  isLoose: boolean;
  displayText: string;
}

interface CustomerDisplayData {
  id: string;
  items: DisplayItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'building' | 'payment' | 'completed' | 'cleared';
  timestamp: Date;
}

export default function CustomerDisplayPage() {
  const { state } = useApp(); // Use the AppContext
  const { store } = state; // Get store from state

  const [displayData, setDisplayData] = useState<CustomerDisplayData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [currentTime, setCurrentTime] = useState(new Date());

  const onMessage = useCallback((event: WebSocketEvent) => {
    try {
      console.log('Customer Display: Received message:', event);

      switch (event.type) {
        case 'pos_cart_update':
          setDisplayData(prev => ({
            ...event.data,
            status: 'building',
            timestamp: new Date(event.timestamp),
          }));
          break;
        case 'pos_payment_started':
          setDisplayData(prev => prev ? { ...prev, status: 'payment', timestamp: new Date(event.timestamp) } : null);
          break;
        case 'pos_order_completed':
          setDisplayData(prev => prev ? { ...prev, status: 'completed', timestamp: new Date(event.timestamp) } : null);
          // Clear display after a short delay for completed orders
          setTimeout(() => {
            setDisplayData(null);
          }, 5000); // Clear after 5 seconds
          break;
        case 'pos_cart_cleared':
          setDisplayData(null);
          break;
        default:
          console.warn('Unknown message type:', event.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);

  const { isConnected } = useWebSocket({ onMessage });

  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: CustomerDisplayData['status'] | null) => {
    if (!status) return null;
    switch (status) {
      case 'building':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Building Order</Badge>;
      case 'payment':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Order Completed</Badge>;
      case 'cleared':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cart Cleared</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 p-6">
      {/* Header */}
      <Card className="mb-6 rounded-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-blue-800">{store?.name || 'Store'}</CardTitle> {/* Dynamic store name */}
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 text-sm font-medium ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus === 'connected' ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-lg font-semibold">
              {format(currentTime, 'hh:mm:ss a')}
            </div>
          </div>
        </CardHeader>
      </Card>

      {displayData ? (
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Left Column: Item List */}
          <Card className="rounded-sm shadow-md flex flex-col">
            <CardHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Current Order</CardTitle>
                {getStatusBadge(displayData.status)}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
              {displayData.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p className="text-lg">No items in cart yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {displayData.items.map((item, index) => (
                    <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-blue-600">{index + 1}.</span>
                        {item.isLoose ? <Scale className="h-5 w-5 text-gray-500" /> : <Package className="h-5 w-5 text-gray-500" />}
                        <div>
                          <p className="text-lg font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            {item.displayText} @ {item.unitPrice.toFixed(2)} {item.isLoose ? `/${item.unit}` : 'each'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xl font-semibold text-right">
                        PKR {item.totalPrice.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Totals and Status */}
          <Card className="rounded-sm shadow-md flex flex-col justify-between">
            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-3">
                <div className="flex justify-between text-2xl font-medium">
                  <span>Subtotal:</span>
                  <span>PKR {displayData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-medium">
                  <span>Tax ({displayData.taxRate * 100}%):</span>
                  <span>PKR {displayData.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-4 bg-blue-200" />
                <div className="flex justify-between text-5xl font-bold text-blue-700">
                  <span>Total:</span>
                  <span>PKR {displayData.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-8">
                {displayData.status === 'building' && (
                  <p className="text-3xl font-semibold text-blue-600 animate-pulse">Adding Items...</p>
                )}
                {displayData.status === 'payment' && (
                  <p className="text-3xl font-semibold text-yellow-600 animate-pulse">Payment in Progress...</p>
                )}
                {displayData.status === 'completed' && (
                  <div className="flex flex-col items-center text-green-600">
                    <CheckCircle className="h-20 w-20 mb-4 animate-bounce" />
                    <p className="text-4xl font-bold">Thank You!</p>
                    <p className="text-2xl">Order Completed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Clock className="h-24 w-24 mb-6 animate-pulse" />
          <p className="text-3xl font-semibold mb-2">Welcome to {store?.name || 'Store'}!</p> {/* Dynamic store name */}
          <p className="text-xl">Your order details will appear here shortly.</p>
        </div>
      )}
    </div>
  );
}
