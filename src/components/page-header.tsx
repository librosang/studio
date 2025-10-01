import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm md:text-base">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 self-start md:self-center">{children}</div>}
    </header>
  );
}
