'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface MobileNumpadProps {
  value: string;
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter: () => void;
  placeholder?: string;
}

export function MobileNumpad({
  value = '',
  onNumberClick,
  onBackspace,
  onClear,
  onEnter,
  placeholder = ''
}: MobileNumpadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="space-y-4">
      {/* Display */}
      <div className="w-full p-4 text-center text-2xl font-bold bg-muted rounded-lg">
        {value || placeholder}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-3 gap-2">
        {numbers.map(num => (
          <Button
            key={num}
            variant="outline"
            className="h-14 text-xl font-semibold"
            onClick={() => onNumberClick(num.toString())}
          >
            {num}
          </Button>
        ))}

        {/* Backspace, Clear, Enter */}
        <Button
          variant="outline"
          className="h-14 text-xl bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onBackspace}
        >
          ←
        </Button>
        <Button
          variant="outline"
          className="h-14 text-xl bg-red-500 hover:bg-red-600 text-white"
          onClick={onClear}
        >
          C
        </Button>
        <Button
          variant="outline"
          className="h-14 text-xl bg-green-500 hover:bg-green-600 text-white"
          onClick={onEnter}
        >
          ✓
        </Button>

        {/* Decimal Point */}
        <Button
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => onNumberClick('.')}
        >
          .
        </Button>
        <Button
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => onNumberClick('00')}
        >
          00
        </Button>
      </div>
    </div>
  );
}
