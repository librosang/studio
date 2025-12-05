'use client';

import { useState, useEffect } from 'react';
import { Scanner as ScannerComp, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import Script from 'next/script';

// Declare Telegram types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
      };
    };
  }
}

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  const handleResult = (result: IDetectedBarcode[]) => {
    if (!isScanning) return; // Prevent multiple scans
    
    if (result && result.length > 0) {
      const barcode = result[0].rawValue;
      setScannedCode(barcode);
      setIsScanning(false);
      
      console.log("Barcode detected:", barcode);

      // Send to Telegram
      if (window.Telegram?.WebApp) {
        try {
          const tg = window.Telegram.WebApp;
          console.log("Sending data to Telegram:", barcode);
          
          // Send the barcode
          tg.sendData(barcode);
          
          // Close after a short delay to ensure data is sent
          setTimeout(() => {
            tg.close();
          }, 300);
          
        } catch (e) {
          console.error("Telegram WebApp SDK error:", e);
          setError("Failed to send data to Telegram. Error: " + String(e));
          setIsScanning(true);
        }
      } else {
        setError("Telegram WebApp is not available. Please open this page from Telegram bot.");
        setIsScanning(true);
      }
    }
  };

  const handleError = (error: any) => {
    console.error("Scanner Error:", error);
    let message = 'An unknown error occurred while accessing the camera.';
    
    if (error?.name === 'NotAllowedError') {
      message = 'Camera access was denied. Please grant permission in your browser settings.';
    } else if (error?.name === 'NotFoundError') {
      message = 'No camera found. Please ensure a camera is connected.';
    } else if (error?.name === 'NotReadableError') {
      message = 'Camera is already in use by another application.';
    } else if (error?.message) {
      message = `Camera error: ${error.message}`;
    }
    
    setError(message);
  };

  const handleTelegramLoad = () => {
    console.log("Telegram script loaded");
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      try {
        // Initialize Telegram WebApp
        tg.ready();
        tg.expand();
        
        setIsTelegramReady(true);
        console.log("Telegram WebApp initialized successfully");
        
      } catch (e) {
        console.error("Telegram WebApp initialization error:", e);
        setError("Failed to initialize Telegram WebApp.");
      }
    } else {
      console.error("Telegram WebApp not found");
      setError("This page must be opened from a Telegram bot.");
    }
  };

  useEffect(() => {
    // Check if Telegram is already loaded (in case script loads before component mounts)
    if (window.Telegram?.WebApp && !isTelegramReady) {
      handleTelegramLoad();
    }
  }, [isTelegramReady]);

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js" 
        strategy="beforeInteractive" 
        onLoad={handleTelegramLoad}
        onError={(e) => {
          console.error("Failed to load Telegram script:", e);
          setError("Failed to load Telegram integration script.");
        }}
      />
      
      <main className="h-screen w-screen bg-black flex flex-col items-center justify-center p-4">
        {error ? (
          <Alert variant="destructive" className="max-w-md">
            <Icons.xCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : scannedCode ? (
          <Alert className="max-w-md bg-green-900 text-white border-green-700">
            <Icons.check className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Barcode scanned: <code className="font-mono">{scannedCode}</code>
              <br />
              Sending to Telegram...
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="relative w-full max-w-md aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              {isScanning ? (
                <ScannerComp
                  onScan={handleResult}
                  onError={handleError}
                  formats={[
                    "ean_13", 
                    "ean_8", 
                    "upc_a", 
                    "upc_e", 
                    "code_128", 
                    "code_39",
                    "qr_code"
                  ]}
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
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <Icons.loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Processing...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                📷 Point the camera at a barcode
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {isTelegramReady ? "✓ Connected to Telegram" : "⏳ Connecting to Telegram..."}
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}