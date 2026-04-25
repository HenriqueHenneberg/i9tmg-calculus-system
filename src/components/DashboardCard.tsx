import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  accent?: "orange" | "blue" | "green" | "yellow";
}

const accentClasses = {
  orange: "bg-primary/15 text-primary border-primary/25",
  blue: "bg-info/15 text-info border-info/25",
  green: "bg-success/15 text-success border-success/25",
  yellow: "bg-warning/15 text-warning border-warning/25",
};

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "orange",
}: DashboardCardProps) {
  const TrendIcon = trend?.positive === false ? ArrowDownRight : ArrowUpRight;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="gradient-industrial glow-card border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
              <p className="break-words font-mono text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{value}</p>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className={cn("rounded-lg border p-2.5", accentClasses[accent])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {trend && (
            <div
              className={cn(
                "mt-4 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
                trend.positive === false
                  ? "border-destructive/25 bg-destructive/10 text-destructive"
                  : "border-success/25 bg-success/10 text-success",
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{trend.value}</span>
              <span className="text-muted-foreground">vs. mes anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
