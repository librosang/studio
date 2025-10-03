
'use client';

import MainSidebar from '@/components/main-sidebar';
import MobileHeader from '@/components/mobile-header';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPosPage = pathname === '/pos';

  return (
    <div className="flex min-h-screen flex-col bg-background sm:flex-row">
      <MainSidebar className={isPosPage ? 'data-[fullscreen=true]:hidden' : ''} />
      <div className="flex flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
