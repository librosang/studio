import Link from 'next/link';
import { Archive, ShoppingCart, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <header className="mb-16 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Icons.logo className="h-16 w-16 text-primary" />
          <h1 className="text-7xl font-bold font-headline">
            StockFlow
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          An intelligent, streamlined solution for modern inventory management. Get started in seconds.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <FeatureCard
          href="/stock"
          icon={<Archive className="h-10 w-10 text-primary" />}
          title="Stockage"
          description="Manage your product inventory with powerful CRUD operations and AI-powered category suggestions."
        />
        <FeatureCard
          href="/shop"
          icon={<ShoppingCart className="h-10 w-10 text-primary" />}
          title="Shop"
          description="Create sales and process returns with a simple, interactive interface designed for speed."
        />
        <FeatureCard
          href="/log"
          icon={<History className="h-10 w-10 text-primary" />}
          title="Activity Log"
          description="Track all inventory changes and transactions in a comprehensive, real-time log."
        />
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>Powered by Firebase & Google AI</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="hover:shadow-2xl transition-all duration-300 hover:border-primary/50 bg-card/50 backdrop-blur-sm group">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="p-5 bg-primary/10 rounded-full mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="font-headline text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center flex flex-col items-center gap-6">
        <p className="text-muted-foreground min-h-[60px]">{description}</p>
        <Button asChild size="lg" className="mt-auto w-full max-w-[220px] group-hover:bg-primary/90 transition-colors">
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
