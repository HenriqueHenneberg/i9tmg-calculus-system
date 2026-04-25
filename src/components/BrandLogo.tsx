import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}

export function BrandLogo({ className, markClassName, showWordmark = true }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/logo-i9tmg.png"
        alt="i9TMG"
        className={cn("shrink-0 rounded-md object-contain", markClassName || "h-10 w-10")}
      />
      {showWordmark && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">i9TMG</p>
          <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">Calculos Industriais</p>
        </div>
      )}
    </div>
  );
}
