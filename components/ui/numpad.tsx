'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SkipBackIcon as Backspace, Delete } from 'lucide-react';

interface NumpadProps {
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter?: () => void;
  showDecimal?: boolean;
  showEnter?: boolean;
  className?: string;
}

export function Numpad({
  onNumberClick,
  onBackspace,
  onClear,
  onEnter,
  showDecimal = true,
  showEnter = false,
  className = '',
}: NumpadProps) {
  const numbers = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', showDecimal ? '.' : '', ''],
  ];

  return (
    <Card className={`w-full max-w-xs ${className}`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {numbers.flat().map((num, index) => {
            if (num === '') {
              if (index === 11 && showEnter) {
                return (
                  <Button
                    key="enter"
                    variant="default"
                    size="lg"
                    onClick={onEnter}
                    className="h-12 text-lg font-semibold"
                  >
                    Enter
                  </Button>
                );
              }
              return <div key={index} />;
            }
            
            return (
              <Button
                key={num}
                variant="outline"
                size="lg"
                onClick={() => onNumberClick(num)}
                className="h-12 text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
              >
                {num}
              </Button>
            );
          })}
          
          {/* Backspace button */}
          <Button
            variant="outline"
            size="lg"
            onClick={onBackspace}
            className="h-12 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Backspace className="h-5 w-5" />
          </Button>
          
          {/* Clear button */}
          <Button
            variant="outline"
            size="lg"
            onClick={onClear}
            className="h-12 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
