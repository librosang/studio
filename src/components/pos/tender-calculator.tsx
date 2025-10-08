
'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useState, useMemo } from 'react';
import { Numpad } from './numpad';
import { useCurrency } from '@/context/language-context';

type TenderCalculatorProps = {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onConfirm: (tenderedAmount: number) => void;
}

export function TenderCalculator({
    isOpen,
    onClose,
    totalAmount,
    onConfirm
}: TenderCalculatorProps) {
    const [tenderedString, setTenderedString] = useState('0');
    const { formatCurrency } = useCurrency();

    const tenderedValue = parseFloat(tenderedString) || 0;

    const changeDue = useMemo(() => {
        if (tenderedValue < totalAmount) {
            return 0;
        }
        return tenderedValue - totalAmount;
    }, [tenderedValue, totalAmount]);
    
    const canConfirm = tenderedValue >= totalAmount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-0 gap-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Side: Numpad and Calculation */}
                    <div className="p-6 flex flex-col justify-between">
                        <DialogHeader>
                            <DialogTitle className="text-3xl">Tender</DialogTitle>
                            <DialogDescription>
                                Enter the amount of cash received from the customer.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 text-center my-8">
                             <div className="space-y-1">
                                <p className="text-muted-foreground">Total Due</p>
                                <p className="text-4xl font-bold font-mono tracking-tighter h-12">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Amount Tendered</p>
                                <p className="text-5xl font-bold font-mono tracking-tighter h-14">
                                    {formatCurrency(tenderedValue)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Change Due</p>
                                <p className="text-6xl font-bold font-mono tracking-tighter text-green-400 h-16">
                                    {formatCurrency(changeDue)}
                                </p>
                            </div>
                        </div>

                        <Numpad value={tenderedString} onChange={setTenderedString} />
                    </div>
                    
                    {/* Right Side: Actions */}
                    <div className="bg-muted/30 p-6 flex flex-col justify-end md:rounded-r-lg">
                        <DialogFooter className="gap-2 flex-col sm:justify-end">
                            <Button 
                                onClick={() => onConfirm(tenderedValue)}
                                disabled={!canConfirm}
                                className="bg-green-600 hover:bg-green-700 h-16 text-lg"
                            >
                                Confirm Transaction
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="h-12">Cancel</Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

    