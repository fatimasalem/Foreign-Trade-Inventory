import { useState } from "react";
import { MapPinned } from "lucide-react";
import { DriverSection } from "../components/driver-section";
import { EventsSection } from "../components/events-section";
import { GlobalTradeMap } from "../components/global-trade-map";
import { UAETradeMap } from "../components/uae-trade-map";
import { FlippableIndicatorCard } from "../components/flippable-indicator-card";
import { SectionIcon } from "../components/section-icon";
import {
  GlobeTradePerformanceSection,
  TRADE_SCOPE_DEFAULTS,
  type TradeScopeKind,
} from "../components/globe-trade-performance-section";

const alerts = [
  { title: "Vehicle & Parts Imports Decline", value: "-28.5%", subtitle: "Month over month", badge: "Critical", tone: "text-rose-400" },
  { title: "Furniture Imports Down", value: "-12.5%", subtitle: "Month over month", badge: "Warning", tone: "text-red-300" },
  { title: "Precious Metals Exports Surge", value: "+45.2%", subtitle: "Month over month", badge: "Watch", tone: "text-amber-300" },
  { title: "Net Trade Balance Improves", value: "+18.5%", subtitle: "Month over month", badge: "Good", tone: "text-emerald-300" },
];

export function InterpretPage() {
  const [globalMonth, setGlobalMonth] = useState("May");
  const [globalYear, setGlobalYear] = useState("2026");
  const [globalRegion, setGlobalRegion] = useState("Abu Dhabi Emirate");
  const [globalTradeScopeKind, setGlobalTradeScopeKind] = useState<TradeScopeKind>("continent");
  const [globalTradeScopeTarget, setGlobalTradeScopeTarget] = useState(TRADE_SCOPE_DEFAULTS.continent);

  const handleTradeScopeKindChange = (kind: TradeScopeKind) => {
    setGlobalTradeScopeKind(kind);
    setGlobalTradeScopeTarget(TRADE_SCOPE_DEFAULTS[kind]);
  };

  const [distributionTab, setDistributionTab] = useState<"global" | "uae">("global");
  const overviewIndicators = [
    {
      name: "Non-Oil Imports",
      value: "45.2B AED",
      change: "-5.8%",
      changeType: "MoM" as const,
      insight: "Non-oil imports decreased by 5.8% month-over-month, primarily driven by a reduction in vehicle imports (-18.5%) and pharmaceutical products (-12.3%). This decline reflects seasonal adjustments and a shift in consumer demand patterns.",
      topItems: [
        { name: "Vehicles & parts (HS87)", value: "12.3B" },
        { name: "Electrical machinery (HS85)", value: "9.5B" }
      ]
    },
    {
      name: "Non-Oil Exports",
      value: "28.7B AED",
      change: "+12.3%",
      changeType: "MoM" as const,
      insight: "Non-oil exports surged by 12.3% month-over-month, led by strong growth in aluminum products (+32.8%) and precious metals (+45.2%). This growth is supported by increased global demand and competitive pricing strategies.",
      topItems: [
        { name: "Aluminum & articles (HS76)", value: "8.2B" },
        { name: "Precious stones/metals (HS71)", value: "7.5B" }
      ]
    },
    {
      name: "Non-Oil Re-Exports",
      value: "31.5B AED",
      change: "+3.2%",
      changeType: "MoM" as const,
      insight: "Re-exports grew modestly by 3.2% month-over-month, driven by Abu Dhabi's strategic position as a regional trade hub. Growth was primarily seen in electronics and machinery re-exports to neighboring markets.",
      topItems: [
        { name: "Electronics (HS85)", value: "5.8B" },
        { name: "Machinery (HS84)", value: "4.2B" }
      ]
    },
    {
      name: "Net Trade",
      value: "15.0B AED",
      change: "+18.5%",
      changeType: "MoM" as const,
      insight: "The net trade balance improved significantly by 18.5% month-over-month, reaching AED 15.0B. This positive trend is attributed to strong export performance and controlled import levels, indicating healthy trade dynamics.",
      comparisonText: "Increased from AED 12.7B to AED 15.0B, an improvement of <span class='text-green-600 font-semibold'>+AED 2.3B</span> compared to previous month."
    },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <GlobeTradePerformanceSection
        month={globalMonth}
        year={globalYear}
        region={globalRegion}
        tradeScopeKind={globalTradeScopeKind}
        tradeScopeTarget={globalTradeScopeTarget}
        onMonthChange={setGlobalMonth}
        onYearChange={setGlobalYear}
        onRegionChange={setGlobalRegion}
        onTradeScopeKindChange={handleTradeScopeKindChange}
        onTradeScopeTargetChange={setGlobalTradeScopeTarget}
      />

      <div className="rounded-2xl border border-[#2a3d5f] bg-[#0a1d35] px-4 py-4 shadow-[0_14px_38px_rgba(2,8,25,0.45)]">
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">AI System Insights & Alerts</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {alerts.map((item) => (
            <div key={item.title} className="rounded-xl border border-[#2e4567] bg-[#102742] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">{item.badge}</span>
                <span className="rounded-full border border-[#3d5b80] px-2 py-0.5 text-[10px] text-slate-200">Live</span>
              </div>
              <p className="text-sm text-slate-300">{item.title}</p>
              <p className={`mt-1 text-4xl font-bold ${item.tone}`}>{item.value}</p>
              <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-5 text-3xl font-semibold text-cyan-300">Highlights</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {overviewIndicators.map((indicator, index) => (
            <FlippableIndicatorCard key={index} {...indicator} />
          ))}
        </div>
      </div>

      {/* Drivers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DriverSection
          title="Global Drivers"
          drivers={[
            {
              name: "Global Oil Prices",
              impact: "positive",
              description: "Brent crude prices stabilized at $85/barrel, supporting petrochemical exports",
            },
            {
              name: "China Manufacturing PMI",
              impact: "neutral",
              description: "China's PMI at 50.2 shows modest expansion in manufacturing activity",
            },
            {
              name: "USD/AED Exchange Rate",
              impact: "positive",
              description: "Stable exchange rate supporting predictable trade flows",
            },
            {
              name: "Global Shipping Costs",
              impact: "negative",
              description: "Container rates increased 8% due to Red Sea disruptions",
            },
          ]}
        />
        <DriverSection
          title="Internal Drivers"
          drivers={[
            {
              name: "Industrial Production",
              impact: "positive",
              description: "Aluminum and petrochemical output up 15% supporting export growth",
            },
            {
              name: "Free Zone Activity",
              impact: "positive",
              description: "KIZAD and KEZAD reporting 20% increase in cargo handling",
            },
            {
              name: "Consumer Confidence",
              impact: "negative",
              description: "Retail sector slowdown affecting consumer goods imports",
            },
            {
              name: "Infrastructure Projects",
              impact: "positive",
              description: "Major construction projects driving demand for building materials",
            },
          ]}
        />
      </div>

      <section className="rounded-2xl border border-[#2a3d5f] bg-[#0a1d35] px-4 py-5 shadow-[0_14px_38px_rgba(2,8,25,0.45)]">
        <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <SectionIcon icon={MapPinned} tone="sky" />
            <div className="min-w-0">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-cyan-300 md:text-3xl">Trade distribution</h2>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                Global partner flows and Abu Dhabi port corridors
              </p>
            </div>
          </div>
          <div
            className="flex shrink-0 self-end rounded-lg border border-[#3b5b82] bg-[#112d4c] p-1 sm:self-auto"
            role="tablist"
            aria-label="Trade distribution view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={distributionTab === "global"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                distributionTab === "global"
                  ? "bg-[#1f446c] text-cyan-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setDistributionTab("global")}
            >
              Global
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={distributionTab === "uae"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                distributionTab === "uae"
                  ? "bg-[#1f446c] text-cyan-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setDistributionTab("uae")}
            >
              UAE ports
            </button>
          </div>
        </div>
        {distributionTab === "global" ? <GlobalTradeMap embedded /> : <UAETradeMap embedded />}
      </section>

      {/* Events Section */}
      <EventsSection />
    </div>
  );
}