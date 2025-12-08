'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasScanned = useRef(false);
  const telegramRef = useRef<any>(null);

  // Load Telegram script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadTelegram = () => {
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
        setError('Failed to load Telegram Web App.');
      };
      
      document.head.appendChild(script);
    };

    loadTelegram();
  }, []);

  const initializeTelegram = () => {
    try {
      if (!window.Telegram?.WebApp) {
        setError('Please open this page from the Telegram bot.');
        return;
      }

      const tg = window.Telegram.WebApp;
      telegramRef.current = tg;

      if (!tg.initData || tg.initData === '') {
        setError('⚠️ Please open this scanner using the button in the Telegram bot.');
        return;
      }

      tg.ready();
      tg.expand();
      
      setIsTelegramReady(true);
      setIsScanning(true);
      
    } catch (e) {
      setError(`Initialization failed: ${e}`);
    }
  };

  const sendToTelegram = useCallback((barcode: string) => {
    if (!telegramRef.current) {
      console.error('Telegram not available');
      return;
    }

    try {
      console.log('Sending barcode:', barcode);
      telegramRef.current.sendData(barcode);
      
      // Close after sending
      setTimeout(() => {
        if (telegramRef.current) {
          telegramRef.current.close();
        }
      }, 300);
      
    } catch (e) {
      console.error('Send error:', e);
      setError(`Failed to send: ${e}`);
    }
  }, []);

  const handleResult = useCallback((result: IDetectedBarcode[]) => {
    // Prevent multiple scans
    if (hasScanned.current || !isScanning) {
      return;
    }
    
    if (!result || result.length === 0) {
      return;
    }
    
    try {
      const barcode = result[0].rawValue;
      
      // Validate format
      if (!/^\d{8,13}$/.test(barcode)) {
        setError(`Invalid barcode: ${barcode}`);
        return;
      }

      // Mark as scanned
      hasScanned.current = true;
      setIsScanning(false);
      setScannedCode(barcode);

      // Send to Telegram after state updates
      // setTimeout(() => {
      //   sendToTelegram(barcode);
      // }, 100);
      
    } catch (e) {
      console.error('Handle result error:', e);
      setError(`Error: ${e}`);
      hasScanned.current = false;
    }
  }, [isScanning, sendToTelegram]);

  const handleScanError = useCallback((error: any) => {
    console.error('Scanner error:', error);
    
    let message = 'Camera error occurred.';
    
    if (error?.name === 'NotAllowedError') {
      message = 'Camera permission denied. Please enable camera access.';
    } else if (error?.name === 'NotFoundError') {
      message = 'No camera found.';
    } else if (error?.name === 'NotReadableError') {
      message = 'Camera in use by another app.';
    }
    
    setError(message);
    setIsScanning(false);
  }, []);

  const handleRetry = () => {
    setError(null);
    setScannedCode(null);
    hasScanned.current = false;
    setIsScanning(true);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      {error ? (
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
                }}
                constraints={{
                  facingMode: 'environment'
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-white text-sm">Initializing...</p>
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