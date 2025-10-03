'use client';

import { useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useZxing } from 'react-zxing';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Icons } from '../icons';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError(err) {
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
        let message = 'An unknown error occurred.';
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            message = 'Camera access was denied. Please grant permission in your browser settings.';
          } else if (err.name === 'NotFoundError') {
            message = 'No camera found. Please ensure a camera is connected and enabled.';
          }
        }
        setError(message);
      }
    },
    constraints: {
        video: {
            facingMode: 'environment'
        }
    }
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {error ? (
        <Alert variant="destructive">
            <Icons.xCircle className="h-4 w-4"/>
            <AlertTitle>Scanning Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
            <div className="relative w-full max-w-sm aspect-video bg-muted rounded-md overflow-hidden">
                <video ref={ref} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-4 border-red-500/50 rounded-md" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 20%)' }}></div>
            </div>
            <p className="text-sm text-muted-foreground">Point the camera at a barcode.</p>
        </>
      )}
    </div>
  );
}
