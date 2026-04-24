import {
  Calculator,
  ChevronLeft,
  FlaskConical,
  History,
  LayoutDashboard,
  Layers,
  Settings,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Calculos", url: "/calculos", icon: Calculator },
  { title: "Formulas", url: "/formulas", icon: FlaskConical },
  { title: "Historico", url: "/historico", icon: History },
  { title: "Setores", url: "/setores", icon: Layers },
  { title: "Configuracoes", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/80 p-4">
        <BrandLogo showWordmark={!collapsed} markClassName="h-9 w-9" />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                          isActive
                            ? "border-glow bg-primary/10 text-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        }`}
                        activeClassName=""
                      >
                        <item.icon
                          className={`h-4 w-4 flex-shrink-0 transition-colors ${
                            isActive ? "text-primary" : "group-hover:text-primary"
                          }`}
                        />
                        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                        {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        {!collapsed && (
          <div className="mb-2 rounded-lg border border-sidebar-border bg-sidebar-accent/45 p-3">
            <p className="text-xs font-medium text-foreground">Operacao industrial</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Biblioteca tecnica local ativa</p>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
