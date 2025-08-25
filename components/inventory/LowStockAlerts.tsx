'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Package, 
  ShoppingCart,
  Bell,
  BellOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/types';
import { format } from 'date-fns';

interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
  variantName?: string;
  variantSku?: string;
  lastAlerted?: Date;
}

export function LowStockAlerts({ storeId }: { storeId: string }) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await productsApi.getAll();
      
      if (result.success && result.data) {
        const activeProducts = result.data.filter(p => p.isActive);
        setProducts(activeProducts);
        
        // Generate low stock alerts
        const lowStockAlerts: LowStockAlert[] = [];
        
        activeProducts.forEach(product => {
          // Check main product stock
          if (product.stock <= product.lowStockThreshold) {
            lowStockAlerts.push({
              id: product.id,
              productId: product.id,
              productName: product.name,
              currentStock: product.stock,
              lowStockThreshold: product.lowStockThreshold,
              lastAlerted: new Date()
            });
          }
          
          // Check variant stocks
          product.variants?.forEach(variant => {
            if (variant.stock <= product.lowStockThreshold) {
              lowStockAlerts.push({
                id: `${product.id}-${variant.id}`,
                productId: product.id,
                productName: product.name,
                currentStock: variant.stock,
                lowStockThreshold: product.lowStockThreshold,
                variantName: variant.name,
                variantSku: variant.sku,
                lastAlerted: new Date()
              });
            }
          });
        });
        
        setAlerts(lowStockAlerts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch low stock alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      // In a real implementation, you might want to mark this alert as dismissed
      // For now, we'll just remove it from the local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Success",
        description: "Alert dismissed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      });
    }
  };

  const handleCreatePurchaseOrder = async (productId: string) => {
    try {
      // This would typically open a purchase order creation dialog
      toast({
        title: "Info",
        description: "Purchase order creation would be implemented here",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    }
  };

  const filteredAlerts = showAll ? alerts : alerts.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Products running low on inventory
            </CardDescription>
          </div>
          {alerts.length > 5 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${alerts.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No low stock alerts</p>
            <p className="text-sm">All products are well-stocked</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {alert.productName}
                      {alert.variantName && (
                        <span className="text-muted-foreground"> - {alert.variantName}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.variantSku && `${alert.variantSku} • `}
                      Current: {alert.currentStock} • Threshold: {alert.lowStockThreshold}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    LOW STOCK
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreatePurchaseOrder(alert.productId)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Order
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissAlert(alert.id)}
                  >
                    <BellOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
