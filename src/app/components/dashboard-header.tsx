import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import bayaanIcon from "../../imports/bayaan-icon-1.svg";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

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

type HeaderNavItem = {
  label: string;
  path: string;
  isActive: (pathname: string) => boolean;
};

const headerNavItems: HeaderNavItem[] = [
  {
    label: "Overview",
    path: "/overview",
    isActive: (pathname) => pathname === "/" || pathname === "/overview",
  },
  {
    label: "Trade AI",
    path: "/trade-ai",
    isActive: (pathname) => pathname === "/trade-ai",
  },
  {
    label: "Diagnose",
    path: "/diagnose",
    isActive: (pathname) => pathname.startsWith("/diagnose"),
  },
  {
    label: "Benchmark",
    path: "/official-statistics",
    isActive: (pathname) =>
      pathname.startsWith("/official-statistics") ||
      pathname.startsWith("/indicator/") ||
      pathname === "/compare-indicators",
  },
  {
    label: "Observe",
    path: "/observe",
    isActive: (pathname) => pathname.startsWith("/observe"),
  },
];

export function DashboardHeader() {
  const { pathname } = useLocation();
  const [periodLabel, setPeriodLabel] = useState("Quarterly");
  const pageTitle = pageTitleForPath(pathname);
  const activeLabel = useMemo(
    () => headerNavItems.find((item) => item.isActive(pathname))?.label,
    [pathname],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a3f61] bg-[#091a31]/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[#091a31]/90">
      <div className="mx-auto max-w-[1600px] px-4 pb-3 pt-4 sm:px-6 md:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={bayaanIcon} alt="" className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
                Abu Dhabi Foreign Trade Inventory
              </p>
              <p className="truncate text-xs text-slate-400 sm:text-sm">{pageTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#365985] bg-[#0d2747] text-slate-100 hover:bg-[#143359] hover:text-white"
              onClick={() =>
                setPeriodLabel((prev) => (prev === "Quarterly" ? "Monthly" : "Quarterly"))
              }
            >
              {periodLabel}
            </Button>
            <Button
              size="sm"
              className="h-8 bg-[#1f4f84] text-white hover:bg-[#29639f]"
              onClick={() => window.print()}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2f476f] bg-[#0d2747] p-2">
          {headerNavItems.map((item) => {
            const active = item.isActive(pathname);
            const isTradeAI = item.path === "/trade-ai";
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm transition",
                  isTradeAI
                    ? active
                      ? "bg-[#5a3b84] text-violet-100 shadow"
                      : "bg-[#3f2c5e]/70 text-violet-100 hover:bg-[#4a356c]"
                    : active
                      ? "bg-[#132f56] text-slate-50 shadow"
                      : "text-slate-300 hover:bg-[#132a4a]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-auto hidden rounded-lg border border-[#345279] bg-[#102744] px-3 py-1.5 text-xs text-slate-200 md:block">
            {activeLabel ? `${activeLabel} view` : "Live dashboard"}
          </div>
        </div>
      </div>
    </header>
  );
}
