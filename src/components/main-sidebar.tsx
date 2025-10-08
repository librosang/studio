
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useUser } from '@/context/user-context';
import { UserRole } from '@/lib/types';
import { useTranslation } from '@/context/language-context';
import { OnlineStatusIndicator } from './online-status-indicator';

const allNavItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: Icons.dashboard, roles: ['manager'] as UserRole[] },
  { href: '/stock', labelKey: 'nav.stock', icon: Icons.stock, roles: ['manager'] as UserRole[] },
  { href: '/shop', labelKey: 'nav.shop', icon: Icons.shop, roles: ['manager', 'cashier'] as UserRole[] },
  { href: '/pos', labelKey: 'nav.pos', icon: Icons.pos, roles: ['manager', 'cashier'] as UserRole[] },
  { href: '/expenses', labelKey: 'nav.accounting', icon: Icons.receipt, roles: ['manager'] as UserRole[] },
  { href: '/log', labelKey: 'nav.log', icon: Icons.log, roles: ['manager', 'cashier'] as UserRole[] },
  { href: '/accounts', labelKey: 'nav.accounts', icon: Icons.accounts, roles: ['manager'] as UserRole[] },
  { href: '/settings', labelKey: 'nav.settings', icon: Icons.settings, roles: ['manager', 'cashier'] as UserRole[] },
];

export default function MainSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

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
                      <item.icon className="h-6 w-6" />
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
