
'use client';

import MainSidebar from '@/components/main-sidebar';
import MobileHeader from '@/components/mobile-header';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';


// --- Fullscreen Context Logic ---
type FullscreenContextType = {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

function FullscreenProvider({ children }: { children: ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullscreen);
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

  return (
    <FullscreenContext.Provider value={{ isFullscreen, toggleFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
}

export function useFullscreen() {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
}
// --- End Fullscreen Context Logic ---


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isFullscreen } = useFullscreen();
  const pathname = usePathname();
  const isPosPage = pathname === '/pos';
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can render a loading spinner here
    return <div className="h-screen w-screen flex items-center justify-center"><Icons.spinner className="h-8 w-8 animate-spin"/></div>;
  }


  return (
    <div className="flex min-h-screen flex-col bg-background sm:flex-row">
      {!(isPosPage && isFullscreen) && <MainSidebar />}
      <div className="flex flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FullscreenProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </FullscreenProvider>
  );
}
