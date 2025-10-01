import MainSidebar from '@/components/main-sidebar';
import MobileHeader from '@/components/mobile-header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <MainSidebar />
      <div className="flex flex-col flex-1">
        <MobileHeader />
        <main className="flex-1 bg-background p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
