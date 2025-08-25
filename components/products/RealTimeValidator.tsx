'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Database,
  BarChart3
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/types';

interface ValidationRule {
  field: string;
  condition: string;
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface RealTimeValidatorProps {
  product: Partial<Product>;
  onChange?: (isValid: boolean, errors: ValidationResult[]) => void;
}

export function RealTimeValidator({ product, onChange }: RealTimeValidatorProps) {
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const validationRules: ValidationRule[] = [
    {
      field: 'name',
      condition: 'required',
      value: '',
      message: 'Product name is required',
      severity: 'error'
    },
    {
      field: 'name',
      condition: 'minLength',
      value: 3,
      message: 'Product name must be at least 3 characters',
      severity: 'error'
    },
    {
      field: 'name',
      condition: 'maxLength',
      value: 100,
      message: 'Product name must be less than 100 characters',
      severity: 'error'
    },
    {
      field: 'category',
      condition: 'required',
      value: '',
      message: 'Category is required',
      severity: 'error'
    },
    {
      field: 'basePrice',
      condition: 'required',
      value: 0,
      message: 'Base price is required',
      severity: 'error'
    },
    {
      field: 'basePrice',
      condition: 'min',
      value: 0,
      message: 'Base price must be greater than 0',
      severity: 'error'
    },
    {
      field: 'basePrice',
      condition: 'max',
      value: 1000000,
      message: 'Base price seems unusually high',
      severity: 'warning'
    },
    {
      field: 'stock',
      condition: 'min',
      value: 0,
      message: 'Stock cannot be negative',
      severity: 'error'
    },
    {
      field: 'stock',
      condition: 'max',
      value: 100000,
      message: 'Stock level seems unusually high',
      severity: 'warning'
    },
    {
      field: 'lowStockThreshold',
      condition: 'min',
      value: 0,
      message: 'Low stock threshold cannot be negative',
      severity: 'error'
    },
    {
      field: 'unit',
      condition: 'required',
      value: '',
      message: 'Unit is required',
      severity: 'error'
    }
  ];

  const checkUniqueName = async (name: string, currentId?: string) => {
    if (!name || name.length < 3) return null;
    
    try {
      setLoading(true);
      const result = await productsApi.getAll();
      
      if (result.success && result.data) {
        const existingProduct = result.data.find((p: Product) => 
          p.name.toLowerCase() === name.toLowerCase() && p.id !== currentId
        );
        
        if (existingProduct) {
          return {
            field: 'name',
            isValid: false,
            message: 'A product with this name already exists',
            severity: 'error'
          } as ValidationResult;
        }
      }
      return null;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: any, rules: ValidationRule[]): ValidationResult[] => {
    const fieldRules = rules.filter(rule => rule.field === field);
    const results: ValidationResult[] = [];

    for (const rule of fieldRules) {
      let isValid = true;
      let message = rule.message;

      switch (rule.condition) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          break;
        case 'minLength':
          isValid = typeof value === 'string' && value.length >= rule.value;
          break;
        case 'maxLength':
          isValid = typeof value === 'string' && value.length <= rule.value;
          break;
        case 'min':
          isValid = typeof value === 'number' && value >= rule.value;
          break;
        case 'max':
          isValid = typeof value === 'number' && value <= rule.value;
          break;
      }

      if (!isValid) {
        results.push({
          field,
          isValid: false,
          message,
          severity: rule.severity
        });
      }
    }

    // If all validations pass, add a success result
    if (results.length === 0) {
      results.push({
        field,
        isValid: true,
        message: `${field} is valid`,
        severity: 'info'
      });
    }

    return results;
  };

  const runValidations = async () => {
    const allResults: ValidationResult[] = [];
    
    // Run basic validations
    for (const rule of validationRules) {
      const value = (product as any)[rule.field];
      const fieldResults = validateField(rule.field, value, [rule]);
      allResults.push(...fieldResults.filter(r => !r.isValid));
    }
    
    // Check unique name
    if (product.name) {
      const uniqueCheck = await checkUniqueName(product.name, product.id);
      if (uniqueCheck) {
        allResults.push(uniqueCheck);
      }
    }
    
    setValidations(allResults);
    if (onChange) {
      const hasErrors = allResults.some(r => r.severity === 'error' && !r.isValid);
      onChange(!hasErrors, allResults);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      runValidations();
    }, 500); // Debounce validation by 500ms

    return () => clearTimeout(timeoutId);
  }, [product]);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const hasErrors = validations.some(v => v.severity === 'error' && !v.isValid);
  const hasWarnings = validations.some(v => v.severity === 'warning' && !v.isValid);

  if (validations.length === 0 && !loading) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Ready to validate product data
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Real-time Validation</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <Badge variant="secondary" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Checking...
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            {validations.filter(v => !v.isValid).length} issues
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {validations
          .filter(v => !v.isValid)
          .map((validation, index) => (
            <Alert 
              key={index} 
              variant={getAlertVariant(validation.severity) as any}
              className="py-2"
            >
              <div className="flex items-start gap-2">
                <div className={validation.severity === 'error' ? 'text-red-500' : 
                               validation.severity === 'warning' ? 'text-yellow-500' : 'text-green-500'}>
                  {getIcon(validation.severity)}
                </div>
                <AlertDescription className="text-sm">
                  <span className="font-medium capitalize">{validation.field}:</span> {validation.message}
                </AlertDescription>
              </div>
            </Alert>
          ))
        }

        {validations.filter(v => !v.isValid).length === 0 && !loading && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All validations passed! Product data looks good.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {(hasErrors || hasWarnings) && (
        <div className="text-xs text-muted-foreground mt-2">
          {hasErrors && (
            <span className="text-red-500">
              {validations.filter(v => v.severity === 'error' && !v.isValid).length} errors need to be fixed
            </span>
          )}
          {hasWarnings && hasErrors && ', '}
          {hasWarnings && (
            <span className="text-yellow-500">
              {validations.filter(v => v.severity === 'warning' && !v.isValid).length} warnings to review
            </span>
          )}
        </div>
      )}
    </div>
  );
}
