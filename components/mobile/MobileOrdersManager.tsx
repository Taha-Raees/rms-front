'use client';

import React, { useState } from 'react';
import { MobileOrdersList } from './MobileOrdersList';
import { MobileOrderDetail } from './MobileOrderDetail';

type OrdersView = 'list' | 'detail';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  change?: number;
  createdAt: Date;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product: { name: string };
  variant?: { name: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface MobileOrdersManagerProps {
  initialView?: OrdersView;
  orders?: Order[];
  onRefreshOrders?: () => void;
  loading?: boolean;
}

export function MobileOrdersManager({
  initialView = 'list',
  orders = [],
  onRefreshOrders,
  loading = false
}: MobileOrdersManagerProps) {
  const [currentView, setCurrentView] = useState<OrdersView>(initialView);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedOrder(null);
  };

  if (currentView === 'detail' && selectedOrder) {
    return (
      <MobileOrderDetail
        order={selectedOrder}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <MobileOrdersList
      orders={orders}
      loading={loading}
      onViewOrder={handleViewOrder}
      onRefresh={onRefreshOrders}
    />
  );
}
