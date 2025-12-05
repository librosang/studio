'use client';

import { useState, useEffect } from 'react';
import { Scanner as ScannerComp, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

// Declare Telegram types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        initData: string;
      };
    };
  }
}

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  // Load Telegram script dynamically
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('telegram-web-app-script')) {
      initializeTelegram();
      return;
    }

    const script = document.createElement('script');
    script.id = 'telegram-web-app-script';
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Telegram script loaded successfully');
      // Wait a bit for Telegram object to be available
      setTimeout(() => {
        initializeTelegram();
      }, 100);
    };
    
    script.onerror = () => {
      console.error('Failed to load Telegram script');
      setError('Failed to load Telegram Web App script. Please try again.');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById('telegram-web-app-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const initializeTelegram = () => {
    console.log('Attempting to initialize Telegram...');
    console.log('window.Telegram:', window.Telegram);
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      try {
        console.log('Telegram WebApp found, initializing...');
        console.log('Init data:', tg.initData);
        
        tg.ready();
        tg.expand();
        
        setIsTelegramReady(true);
        console.log('✓ Telegram WebApp initialized successfully');
        
      } catch (e) {
        console.error('Telegram initialization error:', e);
        setError(`Telegram initialization failed: ${e}`);
      }
    } else {
      console.error('window.Telegram.WebApp not found');
      console.log('Available on window:', Object.keys(window));
      setError('This page must be opened from a Telegram bot mini app.');
    }
  };

  const handleResult = (result: IDetectedBarcode[]) => {
    if (!isScanning) return;
    
    if (result && result.length > 0) {
      const barcode = result[0].rawValue;
      setScannedCode(barcode);
      setIsScanning(false);
      
      console.log('📦 Barcode detected:', barcode);

      if (window.Telegram?.WebApp) {
        try {
          const tg = window.Telegram.WebApp;
          console.log('📤 Sending data to Telegram:', barcode);
          
          // Validate barcode format
          //if (!/^\d{8,13}$/.test(barcode)) {
         //   setError(`Invalid barcode format: ${barcode}`);
          //  setIsScanning(true);
         //   setScannedCode(null);
          //  return;
         // }
          
          // Send the barcode
          tg.sendData(barcode);
          console.log('✓ Data sent successfully');
          
          // Close after a short delay
          setTimeout(() => {
            console.log('Closing WebApp...');
            tg.close();
          }, 500);
          
        } catch (e) {
          console.error('❌ Telegram send error:', e);
          setError(`Failed to send data: ${e}`);
          setIsScanning(true);
          setScannedCode(null);
        }
      } else {
        setError('Telegram WebApp lost connection. Please reopen from bot.');
        setIsScanning(true);
        setScannedCode(null);
      }
    }
  };

  const handleError = (error: any) => {
    console.error('📷 Scanner Error:', error);
    let message = 'Camera error occurred.';
    
    if (error?.name === 'NotAllowedError') {
      message = '❌ Camera permission denied. Please enable camera access in your browser settings.';
    } else if (error?.name === 'NotFoundError') {
      message = '❌ No camera found on this device.';
    } else if (error?.name === 'NotReadableError') {
      message = '❌ Camera is in use by another app.';
    } else if (error?.message) {
      message = `Camera error: ${error.message}`;
    }
    
    setError(message);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      {error ? (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <Icons.xCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {error}
          </AlertDescription>
          <button 
            onClick={() => {
              setError(null);
              setIsScanning(true);
              setScannedCode(null);
              initializeTelegram();
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Try Again
          </button>
        </Alert>
      ) : scannedCode ? (
        <Alert className="max-w-md mx-auto bg-green-900 text-white border-green-700">
          <Icons.check className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Success!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-2">Barcode scanned:</p>
            <code className="block p-2 bg-black/30 rounded font-mono text-base">
              {scannedCode}
            </code>
            <p className="text-xs mt-3 text-green-200">
              Sending to Telegram bot...
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="w-full max-w-md mb-6">
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Barcode Scanner
            </h1>
            <p className="text-sm text-gray-400 text-center">
              {isTelegramReady ? (
                <span className="text-green-400">✓ Connected to Telegram</span>
              ) : (
                <span className="text-yellow-400">⏳ Connecting to Telegram...</span>
              )}
            </p>
          </div>

          <div className="relative w-full max-w-md aspect-square bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700">
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
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-white text-center">
                  <Icons.loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
                  <p className="text-sm">Processing...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center max-w-md">
            <p className="text-base text-gray-300 mb-2">
              📷 Point your camera at a barcode
            </p>
            <p className="text-xs text-gray-500">
              Supported: EAN-13, EAN-8, UPC, Code-128, QR Code
            </p>
          </div>
        </>
      )}
    </main>
  );
}