'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  FileText,
  Filter,
  ArrowLeftRight,
  Plus
} from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { inventoryApi, productsApi } from '@/lib/api';
import { Product, StockMovement, StockReservation, StockAdjustmentReason } from '@/lib/types';
import { format } from 'date-fns';
import { StockTransferDialog } from '@/components/inventory/StockTransferDialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const STOCK_ADJUSTMENT_REASONS: StockAdjustmentReason[] = [
  { value: 'SALE', label: 'Sale', description: 'Product sold to customer', color: 'bg-green-100 text-green-800' },
  { value: 'RETURN', label: 'Return', description: 'Product returned by customer', color: 'bg-blue-100 text-blue-800' },
  { value: 'DAMAGE', label: 'Damage', description: 'Product damaged or expired', color: 'bg-red-100 text-red-800' },
  { value: 'THEFT', label: 'Theft', description: 'Product stolen or lost', color: 'bg-red-100 text-red-800' },
  { value: 'CORRECTION', label: 'Correction', description: 'Stock count correction', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'RECEIPT', label: 'Receipt', description: 'New stock received', color: 'bg-green-100 text-green-800' },
  { value: 'TRANSFER', label: 'Transfer', description: 'Stock transferred between locations', color: 'bg-blue-100 text-blue-800' },
];

export default function StockManagementPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [reservations, setReservations] = useState<StockReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('movements');
  
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    variantId: '',
    quantityChange: 0,
    reason: 'CORRECTION',
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResult, movementsResult, reservationsResult] = await Promise.all([
        productsApi.getAll(),
        inventoryApi.getStockMovements(),
        inventoryApi.getStockReservations()
      ]);
      
      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data.filter((p) => p.isActive));
      }
      
      if (movementsResult.success && movementsResult.data) {
        setMovements(movementsResult.data);
      }
      
      if (reservationsResult.success && reservationsResult.data) {
        setReservations(reservationsResult.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter movements by product
  const filteredMovements = movements.filter(movement => {
    if (!selectedProduct) return true;
    return movement.productId === selectedProduct.id || movement.variantId === selectedProduct.variants?.[0]?.id;
  }).filter(movement => {
    return movement.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           movement.variant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    if (!selectedProduct) return true;
    return reservation.productId === selectedProduct.id || reservation.variantId === selectedProduct.variants?.[0]?.id;
  }).filter(reservation => {
    return reservation.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           reservation.variant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           reservation.order?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate stats
  const totalMovements = movements.length;
  const totalReservations = reservations.filter(r => r.status === 'ACTIVE').length;
  const expiredReservations = reservations.filter(r => r.status === 'EXPIRED').length;
  const recentMovements = movements.slice(0, 10);

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await inventoryApi.createStockAdjustment(adjustmentForm);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Stock adjusted successfully",
          variant: "default",
        });
        setShowAdjustmentDialog(false);
        setAdjustmentForm({
          productId: '',
          variantId: '',
          quantityChange: 0,
          reason: 'CORRECTION',
          notes: ''
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to adjust stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const handleCleanupReservations = async () => {
    try {
      const result = await inventoryApi.cleanupExpiredReservations();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Expired reservations cleaned up",
          variant: "default",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cleanup reservations",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cleanup reservations",
        variant: "destructive",
      });
    }
  };

  const movementColumns = [
    {
      key: 'product',
      title: 'Product',
      render: (value: any, movement: StockMovement) => (
        <div>
          <div className="font-medium">
            {movement.product?.name || movement.variant?.name}
          </div>
          {movement.variant && (
            <div className="text-sm text-muted-foreground">
              {movement.variant.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (value: string) => {
        const reason = STOCK_ADJUSTMENT_REASONS.find(r => r.value === value);
        return (
          <Badge className={reason?.color || 'bg-gray-100 text-gray-800'}>
            {reason?.label || value}
          </Badge>
        );
      },
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (value: number) => (
        <span className={value < 0 ? 'text-red-600' : 'text-green-600'}>
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    {
      key: 'user',
      title: 'User',
      render: (value: any, movement: StockMovement) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{movement.user?.name || 'System'}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (value: Date) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(value), 'MMM dd, yyyy HH:mm')}</span>
        </div>
      ),
    },
    {
      key: 'notes',
      title: 'Notes',
      render: (value: string) => (
        <div className="max-w-xs truncate">
          {value || '-'}
        </div>
      ),
    },
  ];

  const reservationColumns = [
    {
      key: 'product',
      title: 'Product',
      render: (value: any, reservation: StockReservation) => (
        <div>
          <div className="font-medium">
            {reservation.product?.name || reservation.variant?.name}
          </div>
          {reservation.variant && (
            <div className="text-sm text-muted-foreground">
              {reservation.variant.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'order',
      title: 'Order',
      render: (value: any, reservation: StockReservation) => (
        <div>
          <div className="font-medium">
            {reservation.order?.orderNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            PKR {reservation.order?.total?.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => {
        const statusConfig = {
          'ACTIVE': { label: 'Active', icon: Clock, color: 'bg-blue-100 text-blue-800' },
          'EXPIRED': { label: 'Expired', icon: XCircle, color: 'bg-red-100 text-red-800' },
          'RELEASED': { label: 'Released', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
          'CONFIRMED': { label: 'Confirmed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || 
                      { label: value, icon: Clock, color: 'bg-gray-100 text-gray-800' };
        const Icon = config.icon;
        
        return (
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'reservedAt',
      title: 'Reserved',
      render: (value: Date) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(value), 'MMM dd, yyyy HH:mm')}</span>
        </div>
      ),
    },
    {
      key: 'expiresAt',
      title: 'Expires',
      render: (value: Date) => {
        const isExpired = new Date(value) < new Date();
        return (
          <div className={`flex items-center gap-2 ${isExpired ? 'text-red-600' : ''}`}>
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(value), 'MMM dd, yyyy HH:mm')}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">


      {/* Stock Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Movements"
          value={totalMovements}
          description="Stock adjustments recorded"
          icon={Package}
        />
        <MetricCard
          title="Active Reservations"
          value={totalReservations}
          description="Pending stock holds"
          icon={Clock}
          badge={totalReservations > 0 ? { text: 'Active', variant: 'default' } : undefined}
        />
        <MetricCard
          title="Expired Reservations"
          value={expiredReservations}
          description="Need cleanup"
          icon={AlertTriangle}
          badge={expiredReservations > 0 ? { text: 'Cleanup Needed', variant: 'destructive' } : undefined}
        />
        <MetricCard
          title="Recent Activity"
          value={recentMovements.length}
          description="Movements in last 24h"
          icon={FileText}
        />
      </div>

      {/* Filters */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Stock Filters</CardTitle>
          <CardDescription>Filter stock data by product and search terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products, reasons, orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'movements' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('movements')}
              >
                <Package className="h-4 w-4 mr-1" />
                Movements ({movements.length})
              </Button>
              <Button
                variant={activeTab === 'reservations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('reservations')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Reservations ({reservations.filter(r => r.status === 'ACTIVE').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="reservations">Stock Reservations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movements">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
              <CardDescription>
                Complete history of all stock adjustments and movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredMovements}
                columns={movementColumns}
                searchPlaceholder="Search movements..."
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reservations">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Stock Reservations</CardTitle>
              <CardDescription>
                Current and historical stock reservations for pending orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredReservations}
                columns={reservationColumns}
                searchPlaceholder="Search reservations..."
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Manually adjust stock levels for products
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productId">Product *</Label>
                <Select 
                  value={adjustmentForm.productId} 
                  onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.stock} {product.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Select 
                  value={adjustmentForm.reason} 
                  onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, reason: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STOCK_ADJUSTMENT_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantityChange">Quantity Change *</Label>
                <Input
                  id="quantityChange"
                  type="number"
                  value={adjustmentForm.quantityChange}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantityChange: parseInt(e.target.value) || 0 })}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use negative numbers to reduce stock
                </p>
              </div>
              <div>
                <Label htmlFor="variantId">Variant (Optional)</Label>
                <Select 
                  value={adjustmentForm.variantId} 
                  onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, variantId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(p => p.id === adjustmentForm.productId)
                      .flatMap(p => p.variants || [])
                      .map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name} ({variant.stock} {variant.sku})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={adjustmentForm.notes}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                placeholder="Additional notes about this adjustment..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Transfer Dialog */}
      <StockTransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        products={products}
        onTransferComplete={fetchData}
      />
    </div>
  );
}
