import { useLocation } from "react-router";
import bayaanIcon from "../../imports/bayaan-icon-1.svg";

function pageTitleForPath(pathname: string): string {
  if (pathname === "/" || pathname === "/overview") return "Overview";
  if (pathname === "/diagnose") return "Diagnose";
  if (pathname === "/observe" || pathname.startsWith("/observe/")) return "Observe";
  if (pathname === "/trade-ai") return "Trade AI";
  if (pathname === "/official-statistics") return "Official statistics";
  if (pathname === "/publications") return "Publications";
  if (pathname.startsWith("/publication/")) return "Publication";
  if (pathname.startsWith("/indicator/")) return "Indicator detail";
  if (pathname === "/compare-indicators") return "Compare indicators";
  if (pathname === "/forecast") return "Forecast";
  return "Dashboard";
}

export function DashboardHeader() {
  const { pathname } = useLocation();
  const pageTitle = pageTitleForPath(pathname);

  return (
    <header className="sticky top-0 z-50 min-h-[73px] border-b border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-full min-h-[73px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img src={bayaanIcon} alt="" className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Foreign Trade Inventory
            </p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{pageTitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
