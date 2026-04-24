import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}

export function BrandLogo({ className, markClassName, showWordmark = true }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 228 219"
        role="img"
        aria-label="i9TMG"
        className={cn("h-10 w-10 shrink-0", markClassName)}
      >
        <path
          fill="#064B63"
          d="M53 219 0 141h48l53 78H53Zm87-44c-50 0-88-38-88-87C52 38 90 0 140 0s88 38 88 88c0 22-7 42-20 60l-48 71h-54l32-45 2 1Zm0-40c27 0 48-20 48-47s-21-48-48-48-48 21-48 48 21 47 48 47Z"
        />
        <circle cx="20" cy="110" r="20" fill="#ff6a00" />
      </svg>
      {showWordmark && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">i9TMG</p>
          <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">Calculos Industriais</p>
        </div>
      )}
    </div>
  );
}
