
import {
  type LucideIcon,
  Archive,
  ShoppingCart,
  History,
  LayoutDashboard,
  PlusCircle,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Undo2,
  FileUp,
  FileDown,
  PackagePlus,
  PackageMinus,
  PackageX,
  Store,
  BookText,
  Package,
  Wand2,
  ArrowRightLeft,
  MonitorSmartphone,
  ScanBarcode,
  Fullscreen,
  Users,
  Settings,
  Wifi,
  WifiOff,
  Receipt,
  Puzzle,
  FilePieChart,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2"/>
        <path d="m7 19 5-3 5 3"/>
        <path d="M22 19H2"/>
        <path d="M3.28 10.22A6.995 6.995 0 0 1 12 7a6.995 6.995 0 0 1 8.72 3.22"/>
    </svg>
  ),
  magic: Wand2,
  dashboard: LayoutDashboard,
  stock: Package,
  shop: Store,
  pos: MonitorSmartphone,
  log: BookText,
  accounts: Users,
  settings: Settings,
  shoppingCart: ShoppingCart,
  add: PlusCircle,
  more: MoreHorizontal,
  arrowUpDown: ArrowUpDown,
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  trash: Trash2,
  edit: Edit,
  minus: Minus,
  plus: Plus,
  arrowRight: ArrowRight,
  spinner: Loader2,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  return: Undo2,
  sale: FileUp,
  restock: FileDown,
  create: PackagePlus,
  update: Edit,
  delete: PackageX,
  transaction: ArrowRightLeft,
  scanBarcode: ScanBarcode,
  fullscreen: Fullscreen,
  online: Wifi,
  offline: WifiOff,
  receipt: Receipt,
  plugin: Puzzle,
  reports: FilePieChart,
};
