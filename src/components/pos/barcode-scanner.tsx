
'use client';

import { useState } from 'react';
import { Scanner as ScannerComp, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Icons } from '../icons';
import { useTranslation } from '@/context/language-context';


interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleResult = (result: IDetectedBarcode[]) => {
    if (result && result.length > 0) {
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
          <AlertTitle>{t('general.error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="relative w-full max-w-sm aspect-video bg-muted rounded-md overflow-hidden">
            <ScannerComp
              onScan={handleResult}
              onError={handleError}
              formats={[
                "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"
              ]}
              components={{
                tracker: true,
                onOff: true,
                torch: true,
                zoom: true,
                finder: true,
              }}
              styles={{
                container: {
                  width: '100%',
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
