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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useNavigate } from "react-router";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({ isCollapsed, onToggleCollapse }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const publications = [
    { id: 1, title: "Q1 2026 Foreign Trade Report", date: "April 5, 2026" },
    { id: 2, title: "Non-Oil Export Trends Analysis", date: "March 28, 2026" },
    { id: 3, title: "Trade Balance Summary - March 2026", date: "March 22, 2026" },
    { id: 4, title: "Annual Trade Statistics 2025", date: "February 15, 2026" },
  ];

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

  return (
    <aside
      className={`fixed left-0 top-[73px] z-40 flex h-[calc(100vh-73px)] flex-col border-r border-border bg-card shadow-sm transition-[width] duration-300 ease-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      aria-label="Primary navigation"
    >
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {!isCollapsed && (
          <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                active
                  ? item.color === "purple"
                    ? "bg-purple-50 font-medium text-purple-800 shadow-sm"
                    : "bg-primary/8 font-medium text-primary shadow-sm"
                  : item.color === "purple"
                    ? "text-purple-800 hover:bg-purple-50/80"
                    : "text-foreground/90 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              title={isCollapsed ? "Publications" : undefined}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <FileText className="h-5 w-5 shrink-0" aria-hidden />
              {!isCollapsed && <span className="font-medium">Publications</span>}
            </button>
          </SheetTrigger>
          <SheetContent className="w-[500px] sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle className="text-xl">Latest publications</SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-3">
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/publication/${pub.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/publication/${pub.id}`);
                    }
                  }}
                  className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/8 p-3 transition-colors group-hover:bg-primary/15">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                        {pub.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">{pub.date}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Foreign trade
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="outline"
          size="icon"
          className="ml-auto h-9 w-9 border-border bg-background shadow-sm"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
