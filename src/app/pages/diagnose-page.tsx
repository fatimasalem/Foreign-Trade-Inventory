import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Bot, LineChart as LineChartIcon, PieChart } from "lucide-react";
import { SectionIcon } from "../components/section-icon";
import { useAIAssistant } from "../contexts/ai-assistant-context";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { stripClassificationCode } from "../../lib/strip-classification-label";

type Classification = "HS1" | "BEC" | "SITC";
type CompetitivenessRegionType = "continent" | "country" | "gcc";
const DIAGNOSE_REGIONS = ["Abu Dhabi Emirate", "Abu Dhabi Region", "Al Ain Region", "Al Dhafra Region"] as const;

function MiniSparkline({
  values,
  strokeClass,
  fillClass,
  formatPoint,
}: {
  values: number[];
  strokeClass: string;
  fillClass: string;
  formatPoint: (value: number, index: number) => string;
}) {
  const w = 168;
  const h = 46;
  const padX = 8;
  const padY = 7;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (w - 2 * padX) / (values.length - 1) : 0;

  const pts = values.map((v, i) => ({
    x: padX + i * step,
    y: padY + (1 - (v - min) / span) * (h - 2 * padY),
    v,
    i,
  }));

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-[220px] text-slate-100"
      height={h}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Trend over recent periods"
    >
      <path d={d} fill="none" className={strokeClass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p) => (
        <g key={p.i}>
          <circle cx={p.x} cy={p.y} r="8" fill="transparent">
            <title>{formatPoint(p.v, p.i)}</title>
          </circle>
          <circle cx={p.x} cy={p.y} r="3" className={fillClass} />
        </g>
      ))}
    </svg>
  );
}

export function DiagnosePage() {
  const { openAIAssistant } = useAIAssistant();
  const [classification, setClassification] = useState<Classification>("HS1");
  const [foreignTradeType, setForeignTradeType] = useState("all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["All Countries"]);
  const [competitivenessRegionType, setCompetitivenessRegionType] = useState<CompetitivenessRegionType>("country");
  const [selectedCompetitivenessFilter, setSelectedCompetitivenessFilter] = useState("All Countries");
  const [competitivenessRegion, setCompetitivenessRegion] = useState<(typeof DIAGNOSE_REGIONS)[number]>("Abu Dhabi Emirate");
  const [tradeType, setTradeType] = useState("all");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const countries = ["All Countries", "China", "India", "USA", "Saudi Arabia"];
  const continentFilters = ["Asia", "Europe", "Africa", "Americas"];
  const gccFilters = ["GCC Aggregate", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "UAE"];

  const handleCountryToggle = (country: string) => {
    if (country === "All Countries") {
      setSelectedCountries(["All Countries"]);
    } else {
      const newSelection = selectedCountries.includes(country)
        ? selectedCountries.filter(c => c !== country)
        : [...selectedCountries.filter(c => c !== "All Countries"), country];
      setSelectedCountries(newSelection.length > 0 ? newSelection : ["All Countries"]);
    }
  };

  const categories = [
    {
      hs1: "HS71 - Precious stones, metals",
      bec: "BEC5 - Capital goods",
      sitc: "SITC67 - Iron & steel",
      risk: "High",
      totalTradeVolume: "AED 22.4B",
      weight: "18.5%",
      mom: "+45.2%",
      yoy: "+128.5%",
      riskLevel: "critical" as const,
      riskCause: "Extreme volatility due to global gold price fluctuations and market speculation",
      partnerMarkets: ["India", "Saudi Arabia", "USA"],
      transportModes: ["air", "sea"] as const,
      tradeFlows: ["export", "re-export", "import"] as const,
    },
    {
      hs1: "HS87 - Vehicles, parts",
      bec: "BEC4 - Transport equipment",
      sitc: "SITC78 - Road vehicles",
      risk: "High",
      totalTradeVolume: "AED 14.9B",
      weight: "12.3%",
      mom: "-18.5%",
      yoy: "-8.2%",
      riskLevel: "critical" as const,
      riskCause: "Declining consumer demand and supply chain disruptions affecting imports",
      partnerMarkets: ["China", "USA", "Saudi Arabia"],
      transportModes: ["sea", "land"] as const,
      tradeFlows: ["import", "export"] as const,
    },
    {
      hs1: "HS30 - Pharmaceutical products",
      bec: "BEC6 - Consumer goods",
      sitc: "SITC54 - Medicinal products",
      risk: "Medium",
      totalTradeVolume: "AED 7.1B",
      weight: "5.8%",
      mom: "-12.3%",
      yoy: "+3.5%",
      riskLevel: "warning" as const,
      riskCause: "Red Sea shipping delays impacting pharmaceutical imports",
      partnerMarkets: ["India", "USA", "China"],
      transportModes: ["sea", "air"] as const,
      tradeFlows: ["import"] as const,
    },
    {
      hs1: "HS76 - Aluminum, articles",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC68 - Non-ferrous metals",
      risk: "Low",
      totalTradeVolume: "AED 9.8B",
      weight: "8.2%",
      mom: "+32.8%",
      yoy: "+45.2%",
      riskLevel: "watch" as const,
      riskCause: "High growth rate requires monitoring for sustainability and market saturation",
      partnerMarkets: ["China", "India", "Saudi Arabia"],
      transportModes: ["sea"] as const,
      tradeFlows: ["export", "import"] as const,
    },
    {
      hs1: "HS85 - Electrical machinery",
      bec: "BEC5 - Capital goods",
      sitc: "SITC77 - Electrical machinery",
      risk: "Medium",
      totalTradeVolume: "AED 11.5B",
      weight: "9.5%",
      mom: "-12.3%",
      yoy: "+5.8%",
      riskLevel: "warning" as const,
      riskCause: "Short-term decline due to seasonal demand fluctuations",
      partnerMarkets: ["China", "USA"],
      transportModes: ["sea", "air"] as const,
      tradeFlows: ["import", "export"] as const,
    },
    {
      hs1: "HS39 - Plastics, articles",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC57 - Plastics",
      risk: "Low",
      totalTradeVolume: "AED 7.9B",
      weight: "6.5%",
      mom: "+2.1%",
      yoy: "+8.5%",
      riskLevel: "stable" as const,
      riskCause: "Steady growth within expected ranges, no immediate concerns",
      partnerMarkets: ["Saudi Arabia", "India", "China"],
      transportModes: ["sea", "land"] as const,
      tradeFlows: ["import", "export", "re-export"] as const,
    },
    {
      hs1: "HS72 - Iron & steel",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC67 - Iron & steel",
      risk: "Low",
      totalTradeVolume: "AED 8.6B",
      weight: "7.2%",
      mom: "+1.5%",
      yoy: "+4.2%",
      riskLevel: "stable" as const,
      riskCause: "Consistent performance supported by construction sector demand",
      partnerMarkets: ["China", "India"],
      transportModes: ["sea"] as const,
      tradeFlows: ["import", "export"] as const,
    },
    {
      hs1: "HS29 - Organic chemicals",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC51 - Organic chemicals",
      risk: "Low",
      totalTradeVolume: "AED 5.9B",
      weight: "4.8%",
      mom: "-0.8%",
      yoy: "+2.1%",
      riskLevel: "stable" as const,
      riskCause: "Minor fluctuations within normal market behavior",
      partnerMarkets: ["USA", "China", "Saudi Arabia"],
      transportModes: ["sea", "air"] as const,
      tradeFlows: ["import", "export"] as const,
    },
    {
      hs1: "HS84 - Nuclear reactors, machinery",
      bec: "BEC5 - Capital goods",
      sitc: "SITC74 - General machinery",
      risk: "Medium",
      totalTradeVolume: "AED 12.4B",
      weight: "10.2%",
      mom: "+8.5%",
      yoy: "+15.3%",
      riskLevel: "watch" as const,
      riskCause: "Strong growth driven by industrial expansion projects",
      partnerMarkets: ["China", "USA", "India"],
      transportModes: ["sea", "air", "land"] as const,
      tradeFlows: ["import", "export"] as const,
    },
    {
      hs1: "HS27 - Mineral fuels, oils",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC33 - Petroleum products",
      risk: "Low",
      totalTradeVolume: "AED 4.3B",
      weight: "3.5%",
      mom: "+1.2%",
      yoy: "+3.8%",
      riskLevel: "stable" as const,
      riskCause: "Stable commodity with predictable market dynamics",
      partnerMarkets: ["Saudi Arabia", "India", "USA"],
      transportModes: ["sea", "land"] as const,
      tradeFlows: ["export", "import", "re-export"] as const,
    },
  ];

  const monthOrderFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const competitivenessFilterOptions = useMemo(() => {
    if (competitivenessRegionType === "continent") {
      return continentFilters;
    }
    if (competitivenessRegionType === "gcc") {
      return gccFilters;
    }
    return countries;
  }, [competitivenessRegionType]);

  const selectedCompetitivenessContext = useMemo(() => {
    if (competitivenessRegionType === "continent") {
      return `${selectedCompetitivenessFilter} continent`;
    }
    if (competitivenessRegionType === "gcc") {
      return selectedCompetitivenessFilter === "GCC Aggregate" ? "the GCC bloc" : selectedCompetitivenessFilter;
    }
    return selectedCompetitivenessFilter;
  }, [competitivenessRegionType, selectedCompetitivenessFilter]);

  const reerChange = useMemo(() => {
    const monthIndex = Math.max(0, monthOrderFull.indexOf(month));
    const yearOffset = parseInt(year, 10) - 2024;
    const scopeOffset =
      competitivenessRegionType === "continent" ? -0.7 : competitivenessRegionType === "gcc" ? 0.5 : 0;
    const targetOffset = (selectedCompetitivenessFilter.length % 5) * 0.22 - 0.4;
    const regionOffset = (competitivenessRegion.length % 6) * 0.08 - 0.2;
    const value = ((monthIndex - 4) * 0.55 - yearOffset * 0.35) + scopeOffset + targetOffset + regionOffset;
    return Number(value.toFixed(1));
  }, [month, year, competitivenessRegionType, selectedCompetitivenessFilter, competitivenessRegion]);

  const competitivenessSectionSubheading = useMemo(() => {
    const movement = reerChange < 0 ? "decreased" : "increased";
    const competitivenessSignal = reerChange < 0
      ? "increased export price competitiveness"
      : "reduced export price competitiveness";
    return `In ${month} ${year}, ${competitivenessRegion}'s real effective exchange rate ${movement} by ${Math.abs(reerChange).toFixed(1)}%, indicating ${competitivenessSignal} against ${selectedCompetitivenessContext}.`;
  }, [month, year, reerChange, selectedCompetitivenessContext, competitivenessRegion]);

  const reerCardSubheading = useMemo(() => {
    if (reerChange < 0) {
      return `REER moved down ${Math.abs(reerChange).toFixed(1)}% as softer currency pressure outweighed domestic inflation, improving price positioning for exporters in ${selectedCompetitivenessContext}.`;
    }
    return `REER moved up ${Math.abs(reerChange).toFixed(1)}% as currency appreciation combined with domestic inflation, lifting relative export prices in ${selectedCompetitivenessContext}.`;
  }, [reerChange, selectedCompetitivenessContext]);

  const exportCompetitivenessSubheading = useMemo(() => {
    if (reerChange < 0) {
      return `Local goods became more price-competitive internationally versus last month, supporting stronger export conversion opportunities across ${selectedCompetitivenessContext}.`;
    }
    return `Local goods became less price-competitive internationally versus last month, increasing margin pressure in key export markets tied to ${selectedCompetitivenessContext}.`;
  }, [reerChange, selectedCompetitivenessContext]);

  const currencyInflationSubheading = useMemo(() => {
    if (reerChange < 0) {
      return `Exchange rate easing offset part of domestic inflation, resulting in a net REER decline and a favorable competitiveness impulse for the current period.`;
    }
    return `Exchange rate firmness and domestic inflation jointly pushed REER higher, signaling rising export price pressure for the current period.`;
  }, [reerChange]);

  const competitivenessFilterLine = `${
    competitivenessRegionType === "continent"
      ? "Continents"
      : competitivenessRegionType === "country"
        ? "Countries"
        : "GCC"
  } · ${selectedCompetitivenessFilter} · ${competitivenessRegion}`;

  const reerTrendSeries = useMemo(() => {
    const base = 100 + reerChange * 0.35;
    return Array.from({ length: 7 }, (_, i) =>
      Number((base + (i - 3) * 0.28 + Math.sin(i * 0.9) * 0.35).toFixed(2)),
    );
  }, [reerChange]);

  const exportCompetitivenessSeries = useMemo(() => {
    const base = reerChange <= 0 ? 61 + Math.abs(reerChange) * 1.8 : 58 - reerChange * 1.2;
    return Array.from({ length: 7 }, (_, i) =>
      Number((base + Math.cos(i * 0.8) * 2.6 + (i - 3) * (reerChange <= 0 ? 0.45 : -0.3)).toFixed(2)),
    );
  }, [reerChange]);

  const fxInflationImpactSeries = useMemo(() => {
    const fxBase = reerChange <= 0 ? -0.4 : 0.45;
    return Array.from({ length: 7 }, (_, i) =>
      Number((fxBase + (i - 3) * 0.07 + Math.sin(i * 1.05) * 0.18).toFixed(2)),
    );
  }, [reerChange]);

  const generateTrendData = (_category: typeof categories[0]) => {
    const y = parseInt(year, 10);
    const mi = monthOrderFull.indexOf(month);
    const periodScale = 1 + (2026 - y) * 0.035 + Math.max(0, mi) * 0.012;
    const rows = [
      { month: "Oct", import: 8.2, export: 5.3, reexport: 3.1 },
      { month: "Nov", import: 8.5, export: 5.8, reexport: 3.4 },
      { month: "Dec", import: 9.1, export: 6.2, reexport: 3.8 },
      { month: "Jan", import: 9.8, export: 6.8, reexport: 4.2 },
      { month: "Feb", import: 10.2, export: 7.4, reexport: 4.5 },
      { month: "Mar", import: 12.3, export: 8.2, reexport: 5.1 },
    ];
    return rows.map((row) => ({
      ...row,
      import: Number((row.import * periodScale).toFixed(2)),
      export: Number((row.export * periodScale).toFixed(2)),
      reexport: Number((row.reexport * periodScale).toFixed(2)),
    }));
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (foreignTradeType !== "all" && !cat.tradeFlows.includes(foreignTradeType as "import" | "export" | "re-export")) {
        return false;
      }
      if (tradeType !== "all" && !cat.transportModes.includes(tradeType as "land" | "sea" | "air")) {
        return false;
      }
      if (!selectedCountries.includes("All Countries")) {
        if (!cat.partnerMarkets.some((p) => selectedCountries.includes(p))) {
          return false;
        }
      }
      return true;
    });
  }, [foreignTradeType, tradeType, selectedCountries]);

  const handleRowClick = (category: typeof categories[0]) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleAskAI = () => {
    if (selectedCategory) {
      const question = `What are the factors contributing to the ${selectedCategory.risk.toLowerCase()} risk level for ${getCategoryName(selectedCategory)}? The category shows ${selectedCategory.mom} MoM and ${selectedCategory.yoy} YoY changes.`;
      openAIAssistant(question);
      setIsDialogOpen(false);
    }
  };

  const getCategoryName = (category: typeof categories[0]) => {
    const raw =
      classification === "HS1" ? category.hs1 : classification === "BEC" ? category.bec : category.sitc;
    return stripClassificationCode(raw);
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "watch":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getChangeColor = (value: string) => {
    if (value.startsWith("+")) return "text-green-600";
    if (value.startsWith("-")) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#2a3d5f] bg-[#0a1d35] px-4 py-5 shadow-[0_14px_38px_rgba(2,8,25,0.45)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <SectionIcon icon={LineChartIcon} tone="slate" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-cyan-300 md:text-3xl">
                Trade Competitiveness Index
              </h2>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                {competitivenessFilterLine}
              </p>
              <p className="mt-3 max-w-4xl text-sm leading-[1.65] text-slate-300 md:text-base">
                {competitivenessSectionSubheading}
              </p>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-end gap-3 lg:w-auto">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Partner view</label>
              <Select
                value={competitivenessRegionType}
                onValueChange={(value) => {
                  const nextType = value as CompetitivenessRegionType;
                  setCompetitivenessRegionType(nextType);
                  if (nextType === "continent") {
                    setSelectedCompetitivenessFilter(continentFilters[0]);
                  } else if (nextType === "gcc") {
                    setSelectedCompetitivenessFilter(gccFilters[0]);
                  } else {
                    setSelectedCompetitivenessFilter(countries[0]);
                  }
                }}
              >
                <SelectTrigger className="w-[130px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continent">Continent</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="gcc">GCC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {competitivenessRegionType === "continent"
                  ? "Continent"
                  : competitivenessRegionType === "country"
                    ? "Country"
                    : "GCC focus"}
              </label>
              <Select value={selectedCompetitivenessFilter} onValueChange={setSelectedCompetitivenessFilter}>
                <SelectTrigger className="min-w-[160px] max-w-[220px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {competitivenessFilterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Region</label>
              <Select value={competitivenessRegion} onValueChange={(value) => setCompetitivenessRegion(value as (typeof DIAGNOSE_REGIONS)[number])}>
                <SelectTrigger className="min-w-[200px] max-w-[260px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAGNOSE_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[120px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOrderFull.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["2026", "2025", "2024", "2023", "2022"].map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          <article className="flex min-h-0 flex-col rounded-xl border border-[#335175] bg-[#112d4c] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Real Effective Exchange Rate</h3>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Core competitiveness signal
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  reerChange <= 0
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : "border-rose-500/50 bg-rose-500/15 text-rose-300"
                }`}
              >
                {reerChange <= 0 ? "Improving" : "Pressured"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{reerCardSubheading}</p>
            <div className="mt-4">
              <p className="text-xs text-slate-400">Current change</p>
              <p className={`text-xl font-semibold ${reerChange <= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {reerChange > 0 ? "+" : ""}
                {reerChange.toFixed(1)}%
              </p>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs text-slate-400">REER trend</p>
              <MiniSparkline
                values={reerTrendSeries}
                strokeClass={reerChange <= 0 ? "stroke-emerald-300/95" : "stroke-rose-300/95"}
                fillClass={reerChange <= 0 ? "fill-emerald-300/90" : "fill-rose-300/90"}
                formatPoint={(value, index) => {
                  const latest = index === reerTrendSeries.length - 1 ? " (latest)" : "";
                  return `Period ${index + 1}: REER ${value.toFixed(2)}${latest}`;
                }}
              />
              <p className="mt-1 text-[10px] text-slate-500">Hover points for values.</p>
            </div>
          </article>

          <article className="flex min-h-0 flex-col rounded-xl border border-[#335175] bg-[#112d4c] p-4">
            <h3 className="text-lg font-semibold text-white">Export Price Competitiveness</h3>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">Market positioning</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{exportCompetitivenessSubheading}</p>
            <div className="mt-4">
              <p className="text-xs text-slate-400">Outlook signal</p>
              <p className={`text-sm font-semibold ${reerChange <= 0 ? "text-emerald-300" : "text-amber-300"}`}>
                {reerChange <= 0 ? "Higher conversion potential in priority markets" : "Margin compression risk in price-sensitive markets"}
              </p>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs text-slate-400">Competitiveness momentum</p>
              <MiniSparkline
                values={exportCompetitivenessSeries}
                strokeClass={reerChange <= 0 ? "stroke-cyan-300/95" : "stroke-orange-300/95"}
                fillClass={reerChange <= 0 ? "fill-cyan-300/90" : "fill-orange-300/90"}
                formatPoint={(value, index) => {
                  const latest = index === exportCompetitivenessSeries.length - 1 ? " (latest)" : "";
                  return `Period ${index + 1}: Index ${value.toFixed(2)}${latest}`;
                }}
              />
              <p className="mt-1 text-[10px] text-slate-500">Hover points for values.</p>
            </div>
          </article>

          <article className="flex min-h-0 flex-col rounded-xl border border-[#335175] bg-[#112d4c] p-4">
            <h3 className="text-lg font-semibold text-white">Currency &amp; Inflation Impact</h3>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">Macro transmission</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{currencyInflationSubheading}</p>
            <div className="mt-4">
              <p className="text-xs text-slate-400">Policy watch</p>
              <p className="text-sm font-semibold text-cyan-200">
                Monitor FX pass-through and domestic cost trends through next reporting cycle.
              </p>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs text-slate-400">FX-inflation pressure trend</p>
              <MiniSparkline
                values={fxInflationImpactSeries}
                strokeClass={reerChange <= 0 ? "stroke-violet-300/95" : "stroke-amber-300/95"}
                fillClass={reerChange <= 0 ? "fill-violet-300/90" : "fill-amber-300/90"}
                formatPoint={(value, index) => {
                  const latest = index === fxInflationImpactSeries.length - 1 ? " (latest)" : "";
                  return `Period ${index + 1}: Net pressure ${value.toFixed(2)}%${latest}`;
                }}
              />
              <p className="mt-1 text-[10px] text-slate-500">Hover points for values.</p>
            </div>
          </article>
        </div>
      </section>

      {/* Category Analysis Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <SectionIcon icon={PieChart} tone="slate" />
              <div>
                <h3 className="m-0 text-lg font-semibold leading-snug text-gray-900">Category Analysis</h3>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Risk and performance diagnostics
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed breakdown of trade categories by risk level and performance
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Classification</label>
              <Select value={classification} onValueChange={(value) => setClassification(value as Classification)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HS1">HS</SelectItem>
                  <SelectItem value="BEC">BEC</SelectItem>
                  <SelectItem value="SITC">SITC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Foreign Trade Type</label>
              <Select value={foreignTradeType} onValueChange={setForeignTradeType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="re-export">Re-Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-sm">
                    {selectedCountries.length === 1
                      ? selectedCountries[0]
                      : `${selectedCountries.length} countries selected`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3">
                  <div className="space-y-2">
                    {countries.map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={`diagnose-${country}`}
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => handleCountryToggle(country)}
                        />
                        <label
                          htmlFor={`diagnose-${country}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {country}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Trade Type</label>
              <Select value={tradeType} onValueChange={setTradeType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="sea">Sea</SelectItem>
                  <SelectItem value="air">Air</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[32%]">Category</TableHead>
              <TableHead className="w-[13%] text-right">Total Trade Volume</TableHead>
              <TableHead className="w-[12%] text-right">Weight</TableHead>
              <TableHead className="w-[12%] text-right">MoM</TableHead>
              <TableHead className="w-[16%] text-right">YoY</TableHead>
              <TableHead className="w-[10%] text-right">
                <span className="sr-only">Open trend</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-10">
                    No categories match the selected filters. Try widening country, trade mode, or foreign trade type.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow
                    key={category.hs1}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(category)}
                  >
                    <TableCell className="font-medium">{getCategoryName(category)}</TableCell>
                    <TableCell className="text-right">{category.totalTradeVolume}</TableCell>
                    <TableCell className="text-right">{category.weight}</TableCell>
                    <TableCell className={`text-right font-medium ${getChangeColor(category.mom)}`}>
                      {category.mom}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getChangeColor(category.yoy)}`}>
                      {category.yoy}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        aria-label="Open category trend"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(category);
                        }}
                      >
                        <LineChartIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </div>

      {/* Trend Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[min(94vw,56rem)] max-w-5xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedCategory && getCategoryName(selectedCategory)}
            </DialogTitle>
            <DialogDescription>
              Trade trend analysis and risk assessment for this category
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              {/* Risk Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(
                          selectedCategory.riskLevel
                        )}`}
                      >
                        {selectedCategory.risk}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cause:</span> {selectedCategory.riskCause}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAskAI}
                    className="gap-2 shrink-0 text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    <Bot className="h-4 w-4" />
                    Ask AI
                  </Button>
                </div>
              </div>

              {/* Trend Chart */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Trade Trend (Last 6 Months)</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={generateTrendData(selectedCategory)}
                    id="category-trend-chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" key="grid" />
                    <XAxis dataKey="month" key="xaxis" />
                    <YAxis
                      key="yaxis"
                      label={{ value: 'AED Billions', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      key="tooltip"
                      formatter={(value: number) => `${value.toFixed(1)}B AED`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                    />
                    <Legend key="legend" />
                    <Line
                      key="line-import"
                      type="monotone"
                      dataKey="import"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Import"
                      dot={{ r: 4 }}
                    />
                    <Line
                      key="line-export"
                      type="monotone"
                      dataKey="export"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Export"
                      dot={{ r: 4 }}
                    />
                    <Line
                      key="line-reexport"
                      type="monotone"
                      dataKey="reexport"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Re-Export"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-600 mb-1">Month-over-Month</div>
                  <div className={`text-xl font-semibold ${getChangeColor(selectedCategory.mom)}`}>
                    {selectedCategory.mom}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-purple-600 mb-1">Year-over-Year</div>
                  <div className={`text-xl font-semibold ${getChangeColor(selectedCategory.yoy)}`}>
                    {selectedCategory.yoy}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}