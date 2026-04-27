import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TechInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  error?: string;
}

export const TechInput = forwardRef<HTMLInputElement, TechInputProps>(
  ({ label, unit, error, className, ...props }, ref) => {
    return (
      <div className="min-w-0 space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <div className={cn(
          "flex min-w-0 items-center rounded-lg border bg-muted/30 transition-all duration-200 hover:border-primary/25",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30",
          error ? "border-destructive" : "border-border",
          className
        )}>
          <input
            ref={ref}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
            {...props}
          />
          {unit && (
            <span className="max-w-[6rem] shrink-0 truncate rounded-r-lg border-l border-border bg-muted/50 px-3 py-2.5 text-xs font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
TechInput.displayName = "TechInput";
