import type { ReactNode } from "react";
import { Accessibility, BookOpenCheck } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <Topbar />
          <AccessibilityBanner />
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AccessibilityBanner() {
  const { preferences } = useIndustrialWorkspace();
  const active = preferences.comprehensionMode || preferences.readableText || preferences.fontScale !== 100 || preferences.highContrast;

  if (!active) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground sm:px-4 md:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Accessibility className="h-4 w-4 shrink-0 text-primary" />
        <span className="font-semibold text-primary">Acessibilidade ativa</span>
        <span className="text-muted-foreground">
          Fonte {preferences.fontScale}%{preferences.highContrast ? " · alto contraste" : ""}
          {preferences.readableText ? " · leitura ampliada" : ""}
          {preferences.comprehensionMode ? " · modo didatico" : ""}
        </span>
        {preferences.comprehensionMode ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-background/30 px-2 py-1 text-xs text-muted-foreground">
            <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
            Textos tecnicos aparecem com mais respiro e menos cortes.
          </span>
        ) : null}
      </div>
    </div>
  );
}
