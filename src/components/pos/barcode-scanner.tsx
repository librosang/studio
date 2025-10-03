'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Icons } from '../icons';
import { type IResult } from '@yudiel/react-qr-scanner';


interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleResult = (result: IResult) => {
    if (result) {
      onScan(result.text);
    }
  };

  const handleError = (error: any) => {
    console.error(error);
    let message = 'An unknown error occurred.';
    if (error?.name === 'NotAllowedError') {
      message = 'Camera access was denied. Please grant permission in your browser settings.';
    } else if (error?.name === 'NotFoundError') {
      message = 'No camera found. Please ensure a camera is connected and enabled.';
    } else if (error?.name) {
      message = `An error occurred: ${error.name}`;
    }
    setError(message);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error ? (
        <Alert variant="destructive">
          <Icons.xCircle className="h-4 w-4" />
          <AlertTitle>Scanning Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="relative w-full max-w-sm aspect-video bg-muted rounded-md overflow-hidden">
            <Scanner
              onScan={handleResult}
              onError={handleError}
              options={{
                delayBetweenScanAttempts: 100,
                delayBetweenScanSuccess: 100,
              }}
              components={{
                tracker: true,
                torch: true,
                finder: true,
              }}
              styles={{
                container: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Point the camera at a barcode.
          </p>
        </>
      )}
    </div>
  );
}
