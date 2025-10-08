
'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type NumpadProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export function Numpad({ value, onChange }: NumpadProps) {
  
  const handleNumberClick = (num: string) => {
    // Treat as string concatenation, limited to 2 decimal places
    const [integer, fraction] = value.split('.');
    
    if (num === '.' && value.includes('.')) {
        return;
    }
    
    if (num === '.') {
        onChange(value + '.');
        return;
    }

    if (fraction && fraction.length >= 2) {
        return; // Don't allow more than 2 decimal places
    }

    if (value === '0' && num !== '00' && num !== '.') {
        onChange(num);
    } else if (value === '0' && (num === '00' || num === '0')) {
        return;
    }
    else {
      onChange(value + num);
    }
  };

  const handleBackspace = () => {
    if (value.length > 1) {
      onChange(value.slice(0, -1));
    } else {
      onChange('0');
    }
  };

  const handleClear = () => {
    onChange('0');
  };

  const handleQuickTender = (amount: number) => {
      onChange(amount.toFixed(2));
  }

  const buttons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '00', '0', '.'
  ];
  
  const quickTenderValues = [5, 10, 20, 50, 100];

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="grid grid-cols-3 gap-2 col-span-3">
        {buttons.map((btn) => (
          <Button
            key={btn}
            type="button"
            variant="outline"
            className="h-16 text-2xl font-bold"
            onClick={() => handleNumberClick(btn)}
          >
            {btn}
          </Button>
        ))}
         <Button
            type="button"
            variant="outline"
            className="h-16"
            onClick={handleBackspace}
        >
            <ArrowLeft className="h-8 w-8" />
        </Button>
         <Button
          type="button"
          variant="destructive"
          className="h-16 text-lg font-bold col-span-2"
          onClick={handleClear}
        >
          C
        </Button>
      </div>
      <div className="col-span-1 grid grid-rows-5 gap-2">
         {quickTenderValues.map(val => (
             <Button
                key={val}
                type="button"
                variant="secondary"
                className="h-full text-lg"
                onClick={() => handleQuickTender(val)}
             >
                 {val}
             </Button>
         ))}
      </div>
    </div>
  );
}
