'use client';

import { useState, useEffect, useCallback } from 'react';
import { Scanner as ScannerComp, IDetectedBarcode } from '@yudiel/react-qr-scanner';

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
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  // Load Telegram script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadTelegram = () => {
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
        setTimeout(() => initializeTelegram(), 200);
      };
      
      script.onerror = () => {
        setError('Failed to load Telegram Web App. Please try reopening from bot.');
      };
      
      document.head.appendChild(script);
    };

    loadTelegram();
  }, []);

  const initializeTelegram = useCallback(() => {
    try {
      if (!window.Telegram?.WebApp) {
        setError('Please open this page from the Telegram bot.');
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      setIsTelegramReady(true);
      setIsScanning(true); // Start scanning once Telegram is ready
      
    } catch (e) {
      setError(`Telegram initialization failed: ${e}`);
    }
  }, []);

  const handleResult = useCallback((result: IDetectedBarcode[]) => {
    if (!isScanning || !result || result.length === 0) return;
    
    try {
      const barcode = result[0].rawValue;
      
      // Validate barcode format (8-13 digits)
      if (!/^\d{8,13}$/.test(barcode)) {
        setError(`Invalid barcode format: ${barcode}. Must be 8-13 digits.`);
        return;
      }

      // Stop scanning
      setIsScanning(false);
      setScannedCode(barcode);

      // Send to Telegram
      if (!window.Telegram?.WebApp) {
        setError('Telegram connection lost. Please reopen from bot.');
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.sendData(barcode);
      
      // Close after delay
      // setTimeout(() => {
      //   tg.close();
      // }, 500);
      
    } catch (e) {
      setError(`Error processing barcode: ${e}`);
      setIsScanning(true);
      setScannedCode(null);
    }
  }, [isScanning]);

  const handleScanError = useCallback((error: any) => {
    console.error('Scanner error:', error);
    
    let message = 'An unknown camera error occurred.';
    
    if (error?.name === 'NotAllowedError') {
      message = 'Camera access denied. Please enable camera permissions in your browser settings.';
    } else if (error?.name === 'NotFoundError') {
      message = 'No camera found on this device.';
    } else if (error?.name === 'NotReadableError') {
      message = 'Camera is already in use by another application.';
    } else if (error?.name === 'OverconstrainedError') {
      message = 'Camera constraints could not be satisfied. Try a different camera.';
    } else if (error?.message) {
      message = `Camera error: ${error.message}`;
    }
    
    setError(message);
    setIsScanning(false);
  }, []);

  const handleRetry = () => {
    setError(null);
    setScannedCode(null);
    setIsScanning(true);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      {error ? (
        // Error State
        <div className="max-w-md w-full mx-auto bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-3">Error</h2>
          <p className="text-gray-300 text-sm text-center mb-6 leading-relaxed">{error}</p>
          
          <button 
            onClick={handleRetry}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : scannedCode ? (
        // Success State
        <div className="max-w-md w-full mx-auto bg-green-900/20 border-2 border-green-500 rounded-xl p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-3">Success!</h2>
          <p className="text-sm text-gray-300 text-center mb-3">Barcode scanned:</p>
          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <code className="block text-center font-mono text-lg text-white break-all">
              {scannedCode}
            </code>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Sending to Telegram...</span>
          </div>
        </div>
      ) : (
        // Scanner State
        <>
          <div className="w-full max-w-md mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              📷 Barcode Scanner
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
              {isTelegramReady ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-yellow-400">Connecting...</span>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl">
            {isScanning && isTelegramReady ? (
              <ScannerComp
                onScan={handleResult}
                onError={handleScanError}
                formats={[
                  "ean_13",
                  "ean_8", 
                  "upc_a",
                  "upc_e",
                  "code_128",
                  "qr_code"
                ]}
                components={{
                  tracker: true,
                  finder: true,
                  torch: true,
                }}
                constraints={{
                  facingMode: 'environment'
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    objectFit: 'cover',
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-white text-sm">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center max-w-md space-y-2">
            <p className="text-base text-gray-300">
              Point your camera at a barcode
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