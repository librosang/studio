
import { Icons, Icon } from '@/components/icons';

export type Plugin = {
  id: 'dashboard' | 'stock' | 'shop' | 'pos' | 'accounting' | 'log' | 'accounts' | 'settings';
  name: string;
  description: string;
  icon: Icon;
  href: string;
  active: boolean;
  roles: ('manager' | 'cashier')[];
};

export const allPlugins: Plugin[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Get a real-time overview of sales, returns, and top products.',
    icon: Icons.dashboard,
    href: '/dashboard',
    active: true,
    roles: ['manager'],
  },
  {
    id: 'stock',
    name: 'Stock Management',
    description: 'Manage your entire product inventory in the stockroom.',
    icon: Icons.stock,
    href: '/stock',
    active: true,
    roles: ['manager'],
  },
  {
    id: 'shop',
    name: 'Shop Floor',
    description: 'View products available on the shop floor and manage transactions.',
    icon: Icons.shop,
    href: '/shop',
    active: true,
    roles: ['manager', 'cashier'],
  },
  {
    id: 'pos',
    name: 'Point of Sale (POS)',
    description: 'A cashier-friendly, fullscreen interface for quick sales.',
    icon: Icons.pos,
    href: '/pos',
    active: true,
    roles: ['manager', 'cashier'],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Track expenses and view financial summaries and reports.',
    icon: Icons.receipt,
    href: '/expenses',
    active: true,
    roles: ['manager'],
  },
  {
    id: 'log',
    name: 'Activity Log',
    description: 'A detailed, filterable log of all inventory changes and transactions.',
    icon: Icons.log,
    href: '/log',
    active: true,
    roles: ['manager', 'cashier'],
  },
  {
    id: 'accounts',
    name: 'Account Management',
    description: 'Manage user accounts and their roles (Manager, Cashier).',
    icon: Icons.accounts,
    href: '/accounts',
    active: true,
    roles: ['manager'],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Manage application settings like language, currency, and plugins.',
    icon: Icons.settings,
    href: '/settings',
    active: true,
    roles: ['manager', 'cashier'],
  },
];
