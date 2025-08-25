'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { auditApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  trigger: React.ReactNode;
  onExport?: () => void;
}

export function ExportDialog({ trigger, onExport }: ExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exportParams, setExportParams] = useState({
    format: 'csv' as 'csv' | 'json',
    entityType: '',
    action: '',
    userId: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const params = {
        format: exportParams.format,
        entityType: exportParams.entityType || undefined,
        action: exportParams.action || undefined,
        userId: exportParams.userId || undefined,
        startDate: exportParams.startDate ? exportParams.startDate.toISOString() : undefined,
        endDate: exportParams.endDate ? exportParams.endDate.toISOString() : undefined
      };

      const response = await auditApi.exportLogs(params);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportParams.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: `Audit logs exported successfully as ${exportParams.format.toUpperCase()}`,
        });

        setOpen(false);
        onExport?.();
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Audit Logs</DialogTitle>
          <DialogDescription>
            Export audit logs in various formats with optional filters
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select 
              value={exportParams.format} 
              onValueChange={(value) => setExportParams(prev => ({ ...prev, format: value as 'csv' | 'json' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entity Type (Optional)</Label>
            <Input
              placeholder="Filter by entity type"
              value={exportParams.entityType}
              onChange={(e) => setExportParams(prev => ({ ...prev, entityType: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Action (Optional)</Label>
            <Input
              placeholder="Filter by action"
              value={exportParams.action}
              onChange={(e) => setExportParams(prev => ({ ...prev, action: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>User ID (Optional)</Label>
            <Input
              placeholder="Filter by user ID"
              value={exportParams.userId}
              onChange={(e) => setExportParams(prev => ({ ...prev, userId: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exportParams.startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {exportParams.startDate ? format(exportParams.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={exportParams.startDate}
                    onSelect={(date) => setExportParams(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exportParams.endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {exportParams.endDate ? format(exportParams.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={exportParams.endDate}
                    onSelect={(date) => setExportParams(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
