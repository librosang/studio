
'use client';
import { Button } from '@/components/ui/button';
import { Backspace } from 'lucide-react';

type NumpadProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export function Numpad({ value, onChange }: NumpadProps) {
  const handleNumberClick = (num: string) => {
    // Treat value as cents
    const currentCentsString = value.replace('.', '');
    const newCentsString = currentCentsString + num;
    const newFloat = parseFloat(newCentsString) / 100;
    onChange(newFloat.toFixed(2));
  };

  const handleBackspace = () => {
    const currentCentsString = value.replace('.', '');
    if (currentCentsString.length <= 1) {
        onChange('0.00');
        return;
    }
    const newCentsString = currentCentsString.slice(0, -1);
    const newFloat = parseFloat(newCentsString) / 100;
    onChange(newFloat.toFixed(2));
  };

  const handleClear = () => {
    onChange('0.00');
  };

  const buttons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '00', '0', '.'
  ];

  const quickTenderValues = [1, 2, 5, 10, 20, 50, 100];

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="grid grid-cols-3 gap-2 col-span-3">
        {buttons.map((btn) => (
          <Button
            key={btn}
            variant="outline"
            className="h-16 text-2xl font-bold"
            onClick={() => handleNumberClick(btn.replace('.', ''))}
            disabled={btn === '.'} // The logic handles decimals automatically
          >
            {btn}
          </Button>
        ))}
         <Button
          variant="destructive"
          className="h-16 text-lg font-bold"
          onClick={handleClear}
        >
          C
        </Button>
         <Button
            variant="outline"
            className="h-16 col-span-2"
            onClick={handleBackspace}
        >
            <Backspace className="h-8 w-8" />
        </Button>
      </div>
      <div className="col-span-1 grid grid-rows-7 gap-2">
         {quickTenderValues.map(val => (
             <Button
                key={val}
                variant="secondary"
                className="h-full text-lg"
                onClick={() => onChange(val.toFixed(2))}
             >
                 {val}
             </Button>
         ))}
      </div>
    </div>
  );
}
