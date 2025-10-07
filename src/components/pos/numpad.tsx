
'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type NumpadProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export function Numpad({ value, onChange }: NumpadProps) {
  
  const handleNumberClick = (num: string) => {
    if (value.replace('.', '').length >= 8) return; // Limit number of digits
    
    if (value === '0.00' && num !== '.') {
      onChange(parseFloat(num).toFixed(2).slice(0,-2) + "." + num);
      return;
    }
    
    // Treat as string concatenation
    const currentStringValue = value.replace('.', '');
    const newStringValue = currentStringValue + num;
    const newFloat = parseFloat(newStringValue) / 100;
    onChange(newFloat.toFixed(2));
  };

  const handleBackspace = () => {
    const currentStringValue = value.replace('.', '');
    if (currentStringValue.length === 1) {
      onChange('0.00');
      return;
    }
    const newStringValue = currentStringValue.slice(0, -1);
    const newFloat = parseFloat(newStringValue) / 100;
    onChange(newFloat.toFixed(2));
  };

  const handleClear = () => {
    onChange('0.00');
  };

  const handleQuickTender = (amount: number) => {
      const currentAmount = parseFloat(value);
      const newAmount = currentAmount + amount;
      onChange(newAmount.toFixed(2));
  }

  const buttons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '00', '0', 
  ];
  
  const quickTenderValues = [5, 10, 20, 50, 100];

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="grid grid-cols-3 gap-2 col-span-3">
        {buttons.map((btn) => (
          <Button
            key={btn}
            variant="outline"
            className="h-16 text-2xl font-bold"
            onClick={() => handleNumberClick(btn)}
          >
            {btn}
          </Button>
        ))}
         <Button
            variant="outline"
            className="h-16 text-2xl font-bold"
            onClick={() => handleNumberClick('.')}
            disabled={value.includes('.')}
          >
            .
        </Button>
         <Button
            variant="outline"
            className="h-16"
            onClick={handleBackspace}
        >
            <ArrowLeft className="h-8 w-8" />
        </Button>
         <Button
          variant="destructive"
          className="h-16 text-lg font-bold"
          onClick={handleClear}
        >
          C
        </Button>
      </div>
      <div className="col-span-1 grid grid-rows-5 gap-2">
         {quickTenderValues.map(val => (
             <Button
                key={val}
                variant="secondary"
                className="h-full text-lg"
                onClick={() => handleQuickTender(val)}
             >
                 +{val}
             </Button>
         ))}
      </div>
    </div>
  );
}
