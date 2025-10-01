import Link from 'next/link';
import { Archive, ShoppingCart, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <header className="mb-12 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Icons.logo className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold font-headline text-foreground">
            StockFlow
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Your simple and intelligent inventory management solution.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <FeatureCard
          href="/stock"
          icon={<Archive className="h-10 w-10 text-primary" />}
          title="Stockage"
          description="Manage your product inventory with powerful CRUD operations."
        />
        <FeatureCard
          href="/shop"
          icon={<ShoppingCart className="h-10 w-10 text-primary" />}
          title="Shop"
          description="Create sales and process returns with a simple, interactive interface."
        />
        <FeatureCard
          href="/log"
          icon={<History className="h-10 w-10 text-primary" />}
          title="Log"
          description="Track all inventory changes and transactions in a comprehensive log."
        />
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Powered by Firebase & GenAI</p>
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
    <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="p-4 bg-primary/10 rounded-full mb-4">{icon}</div>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center flex flex-col items-center gap-4">
        <p className="text-muted-foreground min-h-[40px]">{description}</p>
        <Button asChild className="mt-auto w-full max-w-[200px]">
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
