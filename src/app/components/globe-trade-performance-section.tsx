import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAIAssistant } from "../contexts/ai-assistant-context";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const REGIONS = ["Abu Dhabi Emirate", "Abu Dhabi Region", "Al Ain Region", "Al Dhafra Region"] as const;

export type TradeScopeKind = "continent" | "country" | "gcc";

const TRADE_SCOPE_KIND_OPTIONS: { value: TradeScopeKind; label: string }[] = [
  { value: "continent", label: "Continents" },
  { value: "country", label: "Countries" },
  { value: "gcc", label: "GCC" },
];

const CONTINENT_TARGETS = ["All", "Asia", "Europe", "Africa", "Americas", "Oceania", "Middle East"] as const;

const COUNTRY_TARGETS = [
  "India",
  "China",
  "USA",
  "Germany",
  "Japan",
  "United Kingdom",
  "France",
  "Italy",
  "South Korea",
  "Netherlands",
] as const;

const GCC_TARGETS = ["All", "Saudi Arabia", "Kuwait", "Bahrain", "Qatar", "Oman"] as const;

export const TRADE_SCOPE_DEFAULTS: Record<TradeScopeKind, string> = {
  continent: CONTINENT_TARGETS[0],
  country: COUNTRY_TARGETS[0],
  gcc: GCC_TARGETS[0],
};

function targetsForTradeScopeKind(kind: TradeScopeKind): readonly string[] {
  if (kind === "continent") return CONTINENT_TARGETS;
  if (kind === "country") return COUNTRY_TARGETS;
  return GCC_TARGETS;
}

/** Deterministic pseudo-random 0–1 from a string key (stable per selection). */
function hash01(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function formatSignedAedBillions(value: number): string {
  const abs = Math.abs(value).toFixed(2);
  return value >= 0 ? `AED ${abs}B` : `AED −${abs}B`;
}

/** Balance (can be negative): wavy path around the headline balance, not a straight ramp. */
function buildBalanceSparkSeries(balance: number, key: string, n = 7): number[] {
  const mag = Math.max(0.35, Math.abs(balance));
  const series: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const seasonal = Math.sin(t * Math.PI * 2.1 + hash01(`${key}|bph`) * 1.4) * mag * 0.22;
    const secondary = Math.sin(t * Math.PI * 4.3 + hash01(`${key}|bph2`) * 2) * mag * 0.12;
    const noise = (hash01(`${key}|bal${i}`) - 0.5) * mag * 0.42;
    const wobble = (hash01(`${key}|balw${i}`) - 0.5) * mag * 0.15 * Math.sin(t * Math.PI);
    const anchor = balance * (0.72 + t * 0.36 + (hash01(`${key}|bdrift`) - 0.5) * 0.08);
    series.push(anchor + seasonal + secondary + noise + wobble);
  }
  series[n - 1] = balance + (hash01(`${key}|blast`) - 0.5) * mag * 0.14;
  return series;
}

/** Import values (positive): irregular month-to-month fluctuation. */
function buildImportSparkSeries(importBillions: number, key: string, n = 6): number[] {
  const series: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const base = importBillions * (0.9 + t * 0.14 + (hash01(`${key}|imbase`) - 0.5) * 0.06);
    const wave = importBillions * Math.sin(t * Math.PI * 2.4 + hash01(`${key}|imw`) * 2.2) * 0.09;
    const spike = importBillions * (hash01(`${key}|imt${i}`) - 0.5) * 0.16;
    const micro = importBillions * (hash01(`${key}|imx${i}`) - 0.5) * 0.08 * Math.sin((i + 1) * 1.7);
    series.push(Math.max(importBillions * 0.72, base + wave + spike + micro));
  }
  return series;
}

function SparklineWithTooltips({
  values,
  formatPoint,
  variant,
  tradeDeficit,
}: {
  values: number[];
  formatPoint: (value: number, index: number) => string;
  variant: "balance" | "import";
  tradeDeficit: boolean;
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

  const strokeClass =
    variant === "balance"
      ? tradeDeficit
        ? "stroke-rose-400/95"
        : "stroke-cyan-400/90"
      : tradeDeficit
        ? "stroke-orange-400/95"
        : "stroke-amber-300/90";

  const fillClass =
    variant === "balance"
      ? tradeDeficit
        ? "fill-rose-300/90"
        : "fill-cyan-300/90"
      : tradeDeficit
        ? "fill-orange-300/90"
        : "fill-amber-200/90";

  const zeroCrosses = min < 0 && max > 0;
  const zeroY = zeroCrosses ? padY + (1 - (0 - min) / span) * (h - 2 * padY) : null;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-[220px] text-slate-100"
      height={h}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Trend over recent periods"
    >
      {zeroY !== null && (
        <line
          x1={padX}
          x2={w - padX}
          y1={zeroY}
          y2={zeroY}
          className="stroke-slate-500/35"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
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

export type GlobeTradePerformanceSectionProps = {
  month: string;
  year: string;
  region: string;
  tradeScopeKind: TradeScopeKind;
  tradeScopeTarget: string;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onTradeScopeKindChange: (kind: TradeScopeKind) => void;
  onTradeScopeTargetChange: (target: string) => void;
};

export function GlobeTradePerformanceSection({
  month,
  year,
  region,
  tradeScopeKind,
  tradeScopeTarget,
  onMonthChange,
  onYearChange,
  onRegionChange,
  onTradeScopeKindChange,
  onTradeScopeTargetChange,
}: GlobeTradePerformanceSectionProps) {
  const { openAIAssistant } = useAIAssistant();

  const scopeKey = `${tradeScopeKind}|${tradeScopeTarget}`;
  const key = `${month}|${year}|${region}|${scopeKey}`;

  const scopeHeadingSuffix =
    tradeScopeKind === "continent" && tradeScopeTarget === "All"
      ? "All continents"
      : tradeScopeKind === "gcc" && tradeScopeTarget === "All"
        ? "All GCC"
        : tradeScopeTarget;

  const tradeWithPhrase = useMemo(() => {
    if (tradeScopeKind === "continent" && tradeScopeTarget === "All") {
      return {
        hero: "global trade across all continents",
        card: "all continental partner corridors",
        labelDest: "Top destinations",
        labelSources: "Source countries",
      };
    }
    if (tradeScopeKind === "continent") {
      return {
        hero: `trade with ${tradeScopeTarget}`,
        card: `partner flows in ${tradeScopeTarget}`,
        labelDest: "Top destinations (in region)",
        labelSources: "Source markets (in region)",
      };
    }
    if (tradeScopeKind === "country") {
      return {
        hero: `bilateral trade with ${tradeScopeTarget}`,
        card: `bilateral flows with ${tradeScopeTarget}`,
        labelDest: "Top destinations",
        labelSources: "Source countries",
      };
    }
    if (tradeScopeKind === "gcc" && tradeScopeTarget === "All") {
      return {
        hero: "trade across all GCC partners",
        card: "GCC-wide partner flows",
        labelDest: "Top GCC destinations",
        labelSources: "GCC source markets",
      };
    }
    return {
      hero: `trade with ${tradeScopeTarget} (GCC)`,
      card: `GCC partner flows with ${tradeScopeTarget}`,
      labelDest: "Top destinations",
      labelSources: "Partner sources (GCC)",
    };
  }, [tradeScopeKind, tradeScopeTarget]);

  const data = useMemo(() => {
    const showcase = month === "May" && year === "2026" && region === "Abu Dhabi Emirate";

    let exportBillions: number;
    let importBillions: number;
    let momPerformance: number;
    let exportMom: number;
    let importMom: number;

    if (showcase) {
      exportBillions = 11.8;
      importBillions = 14.2;
      momPerformance = -6.4;
      exportMom = 8.1;
      importMom = 2.3;
    } else {
      const h1 = hash01(`${key}|exports`);
      const h2 = hash01(`${key}|imports`);
      exportBillions = 8 + h1 * 8;
      importBillions = 9 + h2 * 9;
      momPerformance = -4 + hash01(`${key}|mom`) * 12;
      exportMom = 3 + hash01(`${key}|exmom`) * 10;
      importMom = 0.5 + hash01(`${key}|immom`) * 5;
    }

    const balance = exportBillions - importBillions;
    const isSurplus = balance >= 0;

    const balanceSeries = buildBalanceSparkSeries(balance, `${key}|balspark`);
    const importTrend = buildImportSparkSeries(importBillions, `${key}|imspark`);

    const topSectors = showcase
      ? [
          { name: "Energy & petrochemicals", share: 38 },
          { name: "Industrial & metals", share: 27 },
          { name: "Precious goods & jewelry", share: 16 },
        ]
      : [
          { name: "Energy & petrochemicals", share: 32 + Math.floor(hash01(`${key}|s1`) * 8) },
          { name: "Industrial & metals", share: 22 + Math.floor(hash01(`${key}|s2`) * 10) },
          { name: "Precious goods & jewelry", share: 14 + Math.floor(hash01(`${key}|s3`) * 6) },
        ];

    const topDestinations = showcase
      ? ["India", "China", "Saudi Arabia"]
      : ["India", "China", "Japan", "Saudi Arabia", "USA"]
          .sort(() => hash01(`${key}|destsort`) - 0.5)
          .slice(0, 3);

    const importCategories = showcase
      ? ["Machinery & electrical", "Vehicles & transport", "Consumer goods"]
      : ["Machinery & electrical", "Vehicles & transport", "Consumer goods"]
          .sort(() => hash01(`${key}|catsort`) - 0.5)
          .slice(0, 3);

    const sourceCountries = showcase
      ? ["China", "USA", "Germany"]
      : ["China", "USA", "Germany", "Japan", "UK"].sort(() => hash01(`${key}|srcsort`) - 0.5).slice(0, 3);

    const performancePhrase =
      momPerformance <= 0
        ? `weakened overall trade performance by ${Math.abs(momPerformance).toFixed(1)}% compared to the previous month`
        : `strengthened overall trade performance by ${momPerformance.toFixed(1)}% compared to the previous month`;

    const balanceNarrative = isSurplus
      ? `A surplus of AED ${Math.abs(balance).toFixed(1)}B was recorded this month on ${tradeWithPhrase.card} as export activity continued to outpace imports.`
      : `A deficit of AED ${Math.abs(balance).toFixed(1)}B was recorded this month on ${tradeWithPhrase.card} as imports outpaced export receipts.`;

    const exportNarrative = `For ${tradeWithPhrase.card}, exports ${exportMom >= 0 ? "increased" : "decreased"} by ${Math.abs(exportMom).toFixed(1)}% this month, driven primarily by energy and industrial sectors.`;

    const importNarrative = showcase
      ? `For ${tradeWithPhrase.card}, imports rose moderately by 2.3%, reflecting stable domestic demand and increased machinery purchases.`
      : `For ${tradeWithPhrase.card}, imports ${importMom >= 2.5 ? "rose moderately" : importMom >= 0 ? "edged higher" : "softened"} by ${Math.abs(importMom).toFixed(1)}%, reflecting stable domestic demand and ${importMom >= 2 ? "increased machinery purchases" : "mixed category flows"}.`;

    const hero = isSurplus
      ? `In ${month} ${year}, for ${region}'s ${tradeWithPhrase.hero}, exports reached AED ${exportBillions.toFixed(1)}B while imports totaled AED ${importBillions.toFixed(1)}B, resulting in a trade surplus that ${performancePhrase}.`
      : `In ${month} ${year}, for ${region}'s ${tradeWithPhrase.hero}, exports reached AED ${exportBillions.toFixed(1)}B while imports totaled AED ${importBillions.toFixed(1)}B, resulting in a trade deficit that ${performancePhrase}.`;

    return {
      exportBillions,
      importBillions,
      balance,
      isSurplus,
      momPerformance,
      exportMom,
      importMom,
      balanceSeries,
      importTrend,
      topSectors,
      topDestinations: topDestinations.slice(0, 3),
      importCategories: importCategories.slice(0, 3),
      sourceCountries: sourceCountries.slice(0, 3),
      balanceNarrative,
      exportNarrative,
      importNarrative,
      hero,
    };
  }, [key, month, year, region, tradeScopeKind, tradeScopeTarget, tradeWithPhrase]);

  const scopeFilterLine = `${TRADE_SCOPE_KIND_OPTIONS.find((o) => o.value === tradeScopeKind)?.label ?? ""} · ${tradeScopeTarget}`;

  const balanceMom =
    month === "May" && year === "2026" && region === "Abu Dhabi Emirate"
      ? "-2.1%"
      : data.balance >= 0
        ? `+${(hash01(`${key}|bmom`) * 4).toFixed(1)}%`
        : `${(-hash01(`${key}|bmom2`) * 3).toFixed(1)}%`;

  const balanceDisplay = `${data.isSurplus ? "+" : "−"}AED ${Math.abs(data.balance).toFixed(1)}B`;

  const scopeContextForAi = `${tradeScopeKind} view: ${tradeScopeTarget}`;

  return (
    <section className="rounded-2xl border border-[#2a3d5f] bg-[#0a1d35] px-4 py-5 shadow-[0_14px_38px_rgba(2,8,25,0.45)]">
      <div className="mb-5 flex flex-col gap-4">
        <div className="min-w-0 w-full max-w-none">
          <h2 className="text-2xl font-semibold tracking-tight text-cyan-300 md:text-3xl">
            Globe Trade Performance — {scopeHeadingSuffix}
          </h2>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">{scopeFilterLine}</p>
          <p className="mt-3 w-full max-w-none text-pretty text-sm leading-[1.65] text-slate-300 md:text-base">
            {data.hero}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Partner view</label>
            <Select
              value={tradeScopeKind}
              onValueChange={(v) => onTradeScopeKindChange(v as TradeScopeKind)}
            >
              <SelectTrigger className="w-[130px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADE_SCOPE_KIND_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              {tradeScopeKind === "continent" ? "Continent" : tradeScopeKind === "country" ? "Country" : "GCC focus"}
            </label>
            <Select value={tradeScopeTarget} onValueChange={onTradeScopeTargetChange}>
              <SelectTrigger className="min-w-[160px] max-w-[220px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {targetsForTradeScopeKind(tradeScopeKind).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Region</label>
            <Select value={region} onValueChange={onRegionChange}>
              <SelectTrigger className="min-w-[200px] max-w-[260px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Month</label>
            <Select value={month} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[120px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Year</label>
            <Select value={year} onValueChange={onYearChange}>
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
            <div className="min-w-0 flex-1 pr-1">
              <h3 className="text-lg font-semibold text-white">Trade Balance</h3>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{scopeFilterLine}</p>
              <p className="mt-1.5 max-w-full text-pretty text-xs leading-relaxed text-slate-400">{data.balanceNarrative}</p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                data.isSurplus
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-rose-500/50 bg-rose-500/15 text-rose-300"
              }`}
            >
              {data.isSurplus ? "Surplus" : "Deficit"}
            </span>
          </div>
          <div className="mt-4 flex-1 space-y-3">
            <div>
              <p className="text-xs text-slate-400">Current balance</p>
              <p className="text-2xl font-semibold text-white">{balanceDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">MoM change</p>
              <p className={`text-sm font-semibold ${balanceMom.startsWith("-") ? "text-rose-300" : "text-emerald-300"}`}>
                {balanceMom}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Balance trend</p>
              <SparklineWithTooltips
                values={data.balanceSeries}
                variant="balance"
                tradeDeficit={!data.isSurplus}
                formatPoint={(v, i) => {
                  const n = data.balanceSeries.length;
                  const latest = i === n - 1 ? " (latest)" : "";
                  return `Period ${i + 1} of ${n}: ${formatSignedAedBillions(v)}${latest}`;
                }}
              />
              <p className="mt-1 text-[10px] text-slate-500">Hover points for values.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-auto border-[#3d5b80] bg-[#0f2745] text-cyan-200 hover:bg-[#143252] hover:text-cyan-100"
            onClick={() =>
              openAIAssistant(
                `Explain the trade balance for ${region} in ${month} ${year} (${scopeContextForAi}): current surplus/deficit, month-over-month change, and what drives it.`,
              )
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask Trade AI
          </Button>
        </article>

        <article className="flex min-h-0 flex-col rounded-xl border border-[#335175] bg-[#112d4c] p-4">
          <h3 className="text-lg font-semibold text-white">Export Activity</h3>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{scopeFilterLine}</p>
          <p className="mt-1.5 max-w-full text-pretty text-xs leading-relaxed text-slate-400">{data.exportNarrative}</p>
          <div className="mt-4 flex-1 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Export value</p>
              <p className="text-xl font-semibold text-white">AED {data.exportBillions.toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Growth (MoM)</p>
              <p className={`font-semibold ${data.exportMom >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {data.exportMom >= 0 ? "+" : ""}
                {data.exportMom.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Top sectors</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {data.topSectors.map((s) => (
                  <li key={s.name} className="flex justify-between gap-2 border-b border-[#2f4b70]/60 pb-1 last:border-0">
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0 text-slate-200">{s.share}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">{tradeWithPhrase.labelDest}</p>
              <p className="text-xs text-slate-200">{data.topDestinations.join(" · ")}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-auto border-[#3d5b80] bg-[#0f2745] text-cyan-200 hover:bg-[#143252] hover:text-cyan-100"
            onClick={() =>
              openAIAssistant(
                `What drove export performance for ${region} in ${month} ${year} (${scopeContextForAi})? Focus on sectors and destination markets.`,
              )
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask Trade AI
          </Button>
        </article>

        <article className="flex min-h-0 flex-col rounded-xl border border-[#335175] bg-[#112d4c] p-4">
          <h3 className="text-lg font-semibold text-white">Import Activity</h3>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{scopeFilterLine}</p>
          <p className="mt-1.5 max-w-full text-pretty text-xs leading-relaxed text-slate-400">{data.importNarrative}</p>
          <div className="mt-4 flex-1 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Import value</p>
              <p className="text-xl font-semibold text-white">AED {data.importBillions.toFixed(1)}B</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Largest import categories</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {data.importCategories.map((c) => (
                  <li key={c} className="border-b border-[#2f4b70]/60 pb-1 last:border-0">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Monthly trend</p>
              <SparklineWithTooltips
                values={data.importTrend}
                variant="import"
                tradeDeficit={!data.isSurplus}
                formatPoint={(v, i) => {
                  const n = data.importTrend.length;
                  const latest = i === n - 1 ? " (latest)" : "";
                  return `Slice ${i + 1} of ${n}: AED ${v.toFixed(2)}B${latest}`;
                }}
              />
              <p className="mt-1 text-[10px] text-slate-500">Hover points for values.</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">{tradeWithPhrase.labelSources}</p>
              <p className="text-xs text-slate-200">{data.sourceCountries.join(" · ")}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-auto border-[#3d5b80] bg-[#0f2745] text-cyan-200 hover:bg-[#143252] hover:text-cyan-100"
            onClick={() =>
              openAIAssistant(
                `Explain import patterns for ${region} in ${month} ${year} (${scopeContextForAi}): main categories, sourcing countries, and demand drivers.`,
              )
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask Trade AI
          </Button>
        </article>
      </div>
    </section>
  );
}
