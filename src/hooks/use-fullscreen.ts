
'use client';

import { createContext, useContext, ReactNode } from 'react';

type FullscreenContextType = {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};

export const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export function useFullscreen() {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
}
