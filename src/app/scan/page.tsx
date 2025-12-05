'use client';

import { useState, useEffect } from 'react';
import { Scanner as ScannerComp, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import Script from 'next/script';

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);

  const handleResult = (result: IDetectedBarcode[]) => {
    if (result && result.length > 0 && window.Telegram?.WebApp) {
      const barcode = result[0].rawValue;
      try {
        const tg = window.Telegram.WebApp;
        // Send the scanned data to the Telegram bot
        tg.sendData(barcode);
        // Close the web app
        tg.close();
      } catch (e) {
        console.error("Telegram WebApp SDK error:", e);
        setError("Failed to communicate with Telegram. Make sure you are running inside a Telegram Web App.");
      }
    }
  };

  const handleError = (error: any) => {
    console.error("Scanner Error:", error);
    let message = 'An unknown error occurred while accessing the camera.';
    if (error?.name === 'NotAllowedError') {
      message = 'Camera access was denied. Please grant permission in your browser settings to continue.';
    } else if (error?.name === 'NotFoundError') {
      message = 'No camera found. Please ensure a camera is connected and enabled.';
    } else if (error?.name) {
      message = `An error occurred: ${error.name}`;
    }
    setError(message);
  };
  
  useEffect(() => {
    // Expand the Telegram Web App to take up the full screen
    try {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.expand();
        }
    } catch(e) {
        console.error("Telegram WebApp SDK error on expand:", e);
        setError("Failed to initialize Telegram integration.");
    }
  }, []);

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js" 
        strategy="beforeInteractive" 
        onLoad={() => {
            if (window.Telegram?.WebApp) {
                 const tg = window.Telegram.WebApp;
                 tg.ready();
            } else {
                setError("This application is intended to be used within the Telegram app.");
            }
        }}
      />
      <main className="h-screen w-screen bg-black flex flex-col items-center justify-center p-4">
        {error ? (
          <Alert variant="destructive" className="max-w-md">
            <Icons.xCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="relative w-full max-w-md aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <ScannerComp
                onScan={handleResult}
                onError={handleError}
                formats={["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"]}
                components={{
                  tracker: true,
                  finder: true,
                }}
                styles={{
                  container: {
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                  },
                   video: {
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover'
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-300 mt-4">
              Point the camera at a barcode to send it to Telegram.
            </p>
          </>
        )}
      </main>
    </>
  );
}
