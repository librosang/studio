'use client';

import { useState } from 'react';
import { QrReader } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Icons } from '../icons';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleResult = (result: any) => {
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
            <QrReader
              onResult={handleResult}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              videoStyle={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              containerStyle={{
                width: '100%',
                height: '100%',
                paddingTop: 0,
              }}
            />
            <div
              className="absolute inset-0 border-4 border-red-500/50 rounded-md"
              style={{
                clipPath:
                  'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 20%)',
              }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Point the camera at a barcode.
          </p>
        </>
      )}
    </div>
  );
}
