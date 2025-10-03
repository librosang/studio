'use client';

import { useState } from 'react';
import { Scanner as ScannerComp, IDetectedBarcode, outline, boundingBox, centerText, useDevices } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Icons } from '../icons';


interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleResult = (result: IDetectedBarcode[]) => {
    if (result) {
      onScan(result[0].rawValue);
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
            <ScannerComp
              onScan={handleResult}
              onError={handleError}
              formats={[
                'maxi_code',
                'pdf417',
                'aztec',
                'data_matrix',
                'matrix_codes',
                'dx_film_edge',
                'databar',
                'databar_expanded',
                'codabar',
                'code_39',
                'code_93',
                'code_128',
                'ean_8',
                'ean_13',
                'itf',
                'linear_codes',
                'upc_a',
                'upc_e'
            ]}
            
              components={{
                tracker: outline,
                onOff: true,
                torch: true,
                zoom: true,
                finder: true,
              }}
              styles={{
                container: {
                  width: '80%',
                  maxWidth: 500,
                  margin: 'auto'
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
