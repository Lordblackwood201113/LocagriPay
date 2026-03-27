import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  valueClassName?: string;
}

export function StatCard({ title, value, description, className, valueClassName }: StatCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{title}</p>
      <p className={cn("mt-1 text-xl font-bold", valueClassName)}>{value}</p>
      {description && (
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      )}
    </Card>
  );
}
