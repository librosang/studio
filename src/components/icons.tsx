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
  Trash2,
  Edit,
  Minus,
  Plus,
  ArrowRight,
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
  BookText
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
      <path d="M2 8.5V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
      <path d="M6 19v-6" />
      <path d="M10 19v-6" />
      <path d="M14 19v-6" />
      <path d="M18 19v-6" />
      <path d="M2 8.5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2" />
      <path d="M12 3v5.5" />
    </svg>
  ),
  dashboard: LayoutDashboard,
  stock: Archive,
  shop: Store,
  log: BookText,
  add: PlusCircle,
  more: MoreHorizontal,
  arrowUpDown: ArrowUpDown,
  chevronDown: ChevronDown,
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
};
