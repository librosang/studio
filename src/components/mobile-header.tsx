
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
import { useState } from 'react';
import { useUser } from '@/context/user-context';
import { UserRole } from '@/lib/types';
import { useI18n } from '@/locales/client';


const allNavItems = [
  { href: '/dashboard', label: 'nav.dashboard', icon: Icons.dashboard, roles: ['manager'] as UserRole[] },
  { href: '/stock', label: 'nav.stock', icon: Icons.stock, roles: ['manager'] as UserRole[] },
  { href: '/shop', label: 'nav.shop', icon: Icons.shop, roles: ['manager', 'cashier'] as UserRole[] },
  { href: '/pos', label: 'nav.pos', icon: Icons.pos, roles: ['manager', 'cashier'] as UserRole[] },
  { href: '/log', label: 'nav.log', icon: Icons.log, roles: ['manager', 'cashier'] as UserRole[] },
  { href: '/accounts', label: 'nav.accounts', icon: Icons.accounts, roles: ['manager'] as UserRole[] },
  { href: '/settings', label: 'nav.settings', icon: Icons.settings, roles: ['manager', 'cashier'] as UserRole[] },
];

export default function MobileHeader() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();
    const t = useI18n();
    
    const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:hidden">
      <nav className="flex w-full items-center justify-between">
      <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="sr-only">StockFlow</span>
        </Link>
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
                const label = t(item.label as any);
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
                         <item.icon className="h-5 w-5" />
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
