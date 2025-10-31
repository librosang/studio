'use client';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { useTranslation } from '@/context/language-context';
import { OnlineStatusIndicator } from './online-status-indicator';
import { allPlugins, type Plugin } from '@/lib/plugins';


const navItemsMaster = allPlugins.map(plugin => ({
    href: plugin.href,
    labelKey: `nav.${plugin.id}`,
    icon: plugin.icon,
    id: plugin.id,
    roles: plugin.roles
}));

export default function MobileHeader() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();
    const { t } = useTranslation();
    const [navItems, setNavItems] = useState(navItemsMaster);
    
    useEffect(() => {
        const updateNavItems = () => {
          if (!user) return;
          const storedPlugins = localStorage.getItem('plugins');
          const activePlugins: Plugin[] = storedPlugins ? JSON.parse(storedPlugins) : allPlugins;
          
          const activeNavItems = navItemsMaster.filter(item => {
            const plugin = activePlugins.find(p => p.id === item.id);
            return plugin && plugin.active && item.roles.includes(user.role);
          });
          setNavItems(activeNavItems);
        };

        updateNavItems();

        window.addEventListener('plugins-updated', updateNavItems);
        return () => {
            window.removeEventListener('plugins-updated', updateNavItems);
        };
    }, [user]);


  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:hidden">
      <nav className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
            <OnlineStatusIndicator />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="sr-only">StockFlow</span>
            </Link>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
                onClick={() => setIsOpen(false)}
            >
                <Icons.logo className="h-8 w-8 text-primary" />
                <span>StockFlow</span>
            </Link>
              {navItems.map(item => {
                const isActive = pathname === item.href;
                const label = t(item.labelKey as any);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            isActive && "bg-muted text-primary"
                        )}
                    >
                         <Icon className="h-5 w-5" />
                        {label}
                    </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
