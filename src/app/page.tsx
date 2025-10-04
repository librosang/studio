
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useTranslation } from '@/context/language-context';

export default function Home() {
    const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <header className="mb-12 text-center md:mb-16">
        <div className="mb-4 flex items-center justify-center gap-2 md:gap-4">
          <Icons.logo className="h-12 w-12 text-primary md:h-16 md:w-16" />
          <h1 className="text-5xl font-bold font-headline md:text-7xl">
            {t('home.title')}
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t('home.subtitle')}
        </p>
      </header>

       <main className="w-full max-w-lg grid gap-4">
         <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-headline">{t('home.get_started')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Jump right into managing your inventory.
            </p>
             <Button asChild size="lg" className="mt-2 w-full max-w-xs">
                <Link href="/login">{t('home.go_to_login')}</Link>
             </Button>
          </CardContent>
         </Card>
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground md:mt-16">
        <p>{t('home.powered_by')}</p>
      </footer>
    </div>
  );
}
