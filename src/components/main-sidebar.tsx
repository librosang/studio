
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useUser } from '@/context/user-context';
import { useTranslation } from '@/context/language-context';
import { OnlineStatusIndicator } from './online-status-indicator';
import { allPlugins, Plugin } from '@/lib/plugins';
import { useState, useEffect } from 'react';

const navItemsMaster = allPlugins.map(plugin => ({
    href: plugin.href,
    labelKey: `nav.${plugin.id}`,
    icon: plugin.icon,
    id: plugin.id,
    roles: plugin.roles
}));

export default function MainSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();
  const [navItems, setNavItems] = useState(navItemsMaster);

  useEffect(() => {
    const updateNavItems = () => {
      if (!user) return;
      const storedPlugins = localStorage.getItem('plugins');
      const plugins: Plugin[] = storedPlugins ? JSON.parse(storedPlugins) : allPlugins;
      
      const activeNavItems = navItemsMaster.filter(item => {
        const plugin = plugins.find(p => p.id === item.id);
        return plugin && plugin.active && item.roles.includes(user.role);
      });
      setNavItems(activeNavItems);
    };

    updateNavItems(); // Initial update

    window.addEventListener('plugins-updated', updateNavItems);
    return () => {
      window.removeEventListener('plugins-updated', updateNavItems);
    };
  }, [user]);

  return (
    <aside className={cn("w-16 md:w-64 bg-card border-r flex-col transition-all duration-300 hidden sm:flex", className)}>
      <div className="flex items-center justify-center md:justify-start h-20 border-b px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <OnlineStatusIndicator />
          <Icons.logo className="h-8 w-8 text-primary hidden md:block" />
          <span className="hidden md:block font-bold font-headline text-2xl text-foreground">StockFlow</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 md:p-4 space-y-2">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const label = t(item.labelKey as any);
            const Icon = item.icon;
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      "w-full flex items-center justify-center md:justify-start gap-3 text-lg py-6",
                       isActive && "text-primary-foreground hover:text-primary-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="h-6 w-6" />
                      <span className="hidden md:block">{label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="md:hidden">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
