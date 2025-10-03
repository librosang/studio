
'use client';

import MainSidebar from '@/components/main-sidebar';
import MobileHeader from '@/components/mobile-header';
import { FullscreenProvider, useFullscreen } from '@/hooks/use-fullscreen';
import { usePathname } from 'next/navigation';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isFullscreen } = useFullscreen();
  const pathname = usePathname();
  const isPosPage = pathname === '/pos';

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
