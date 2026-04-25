import { Bell, LogOut, Search, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function Topbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card/65 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-foreground">Sistema de Calculos Tecnicos</h2>
          <p className="hidden text-[11px] text-muted-foreground sm:block">Painel industrial i9TMG</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`hidden items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200 sm:flex ${
            searchFocused ? "w-64 border-primary bg-muted/50" : "w-48 border-border bg-muted/30"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar calculo..."
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && globalSearch.trim()) {
                navigate(`/calculos?q=${encodeURIComponent(globalSearch.trim())}`);
              }
            }}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <button type="button" className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="hidden max-w-36 truncate text-xs font-medium text-muted-foreground lg:inline">
            {user?.name || "Engenharia"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
