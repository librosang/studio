
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullscreen);
    if(isCurrentlyFullscreen){
        document.body.setAttribute('data-fullscreen', 'true');
    } else {
        document.body.removeAttribute('data-fullscreen');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
}
