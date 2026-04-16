import { Link, useLocation } from "react-router";
import {
  Bot,
  FileSearch,
  Stethoscope,
  BarChart3,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import { SectionIcon } from "./section-icon";
import { cn } from "./ui/utils";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({ isCollapsed, onToggleCollapse }: DashboardSidebarProps) {
  const location = useLocation();

  const navItems = [
    { path: "/trade-ai", label: "Trade AI", icon: Bot, color: "purple" as const },
    { path: "/overview", label: "Overview", icon: FileSearch, color: "blue" as const },
    { path: "/diagnose", label: "Diagnose", icon: Stethoscope, color: "blue" as const },
    { path: "/benchmark", label: "Benchmark", icon: BarChart3, color: "blue" as const },
    { path: "/observe", label: "Observe", icon: Eye, color: "blue" as const },
    { path: "/official-statistics", label: "Official Statistics", icon: FileBarChart, color: "blue" as const },
  ];

  const isActive = (path: string) => {
    if (path === "/overview" && (location.pathname === "/" || location.pathname === "/overview")) {
      return true;
    }
    return location.pathname === path;
  };

  const publicationsActive =
    location.pathname === "/publications" || location.pathname.startsWith("/publication/");

  const linkBase =
    "touch-manipulation transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

  return (
    <aside
      className={cn(
        "fixed z-40 flex border-border bg-card transition-[width] duration-300 ease-out",
        "bottom-0 left-0 right-0 top-auto h-auto w-full flex-row border-t pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)]",
        "md:bottom-auto md:left-0 md:right-auto md:top-[73px] md:h-[calc(100vh-73px)] md:flex-col md:border-r md:border-t-0 md:pb-0 md:shadow-sm",
        isCollapsed ? "md:w-16" : "md:w-64",
      )}
      aria-label="Primary navigation"
    >
      <nav
        className={cn(
          "flex flex-1 items-stretch gap-0 overflow-x-auto overflow-y-hidden p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:flex-col md:gap-0 md:space-y-1 md:overflow-x-hidden md:overflow-y-auto md:p-2",
        )}
      >
        {!isCollapsed && (
          <p className="hidden px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:block">
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                linkBase,
                "flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium leading-tight",
                "md:min-w-0 md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm md:leading-normal md:font-normal",
                active
                  ? item.color === "purple"
                    ? "bg-purple-50 text-purple-800 shadow-sm md:font-medium"
                    : "bg-primary/8 text-primary shadow-sm md:font-medium"
                  : item.color === "purple"
                    ? "text-purple-800 hover:bg-purple-50/80"
                    : "text-foreground/90 hover:bg-muted hover:text-foreground",
              )}
            >
              <SectionIcon
                icon={Icon}
                size="sm"
                className="md:shrink-0"
                tone={
                  active
                    ? item.color === "purple"
                      ? "violet"
                      : "primary"
                    : "muted"
                }
              />
              <span
                className={cn(
                  "line-clamp-2 max-w-[4.5rem] text-center md:max-w-none md:line-clamp-none",
                  isCollapsed && "md:hidden",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <Link
          to="/publications"
          aria-current={publicationsActive ? "page" : undefined}
          title={isCollapsed ? "Publications" : undefined}
          className={cn(
            linkBase,
            "flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium leading-tight",
            "md:min-w-0 md:w-full md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm md:leading-normal",
            publicationsActive
              ? "bg-primary/8 font-medium text-primary shadow-sm"
              : "text-foreground/90 hover:bg-muted hover:text-foreground",
          )}
        >
          <SectionIcon
            icon={FileText}
            size="sm"
            className="md:shrink-0"
            tone={publicationsActive ? "primary" : "muted"}
          />
          <span
            className={cn(
              "line-clamp-2 max-w-[4.5rem] text-center md:max-w-none md:line-clamp-none md:font-medium",
              isCollapsed && "md:hidden",
            )}
          >
            Publications
          </span>
        </Link>
      </nav>

      <div className="hidden border-t border-border p-2 md:block">
        <Button
          variant="outline"
          size="icon"
          className="ml-auto h-9 w-9 border-border bg-background shadow-sm"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>
    </aside>
  );
}
