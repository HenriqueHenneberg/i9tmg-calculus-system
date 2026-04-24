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
      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <div className={cn(
          "flex items-center rounded-lg border bg-muted/30 transition-all duration-200",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30",
          error ? "border-destructive" : "border-border",
          className
        )}>
          <input
            ref={ref}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono"
            {...props}
          />
          {unit && (
            <span className="px-3 text-xs font-medium text-muted-foreground border-l border-border bg-muted/50 py-2.5 rounded-r-lg">
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
