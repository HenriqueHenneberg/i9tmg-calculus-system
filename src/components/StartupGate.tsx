import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";

export function StartupGate({ children }: { children: ReactNode }) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0A2540,#0d2f46_52%,#071827)]" />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md rounded-lg border border-border/70 bg-card/75 p-8 text-center shadow-2xl backdrop-blur"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg border border-primary/25 bg-background/40">
            <BrandLogo showWordmark={false} markClassName="h-16 w-16 animate-pulse" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Inicializando plataforma</p>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Software industrial i9TMG</h1>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: "12%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Carregando formulas, setores e historico tecnico
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
