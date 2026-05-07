import React, { useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  type TooltipProps as RechartsTooltipProps,
} from "recharts";
import {
  ArrowLeft,
  Download,
  Bell,
  Plus,
  Settings,
  Printer,
  FileText,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  BarChart3,
  Shield,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { SectionIcon } from "../components/section-icon";
import { cn } from "../components/ui/utils";

type GraphType = "line" | "column" | "bar" | "circular" | "table";
type RangeType = "3Y" | "5Y" | "ALL" | "RECENT";

interface IndicatorLocationState {
  title?: string;
  value?: string;
  unit?: string;
  yoyDisplay?: string;
  updateDate?: string;
  isConfidential?: boolean;
}

const CHART_ACCENT = "#22d3ee";
const CHART_GRID = "#2e4567";
const CHART_AXIS = "#94a3b8";
const LABEL_FILL = "#e2e8f0";
const CHART_BG = "#0f2744";

const LINE_MARGIN = { top: 28, right: 16, left: 8, bottom: 8 };
const BAR_H_MARGIN = { top: 12, right: 56, left: 8, bottom: 12 };

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** ISO-like month key YYYY-MM (string sortable). */
type MonthlyPoint = {
  periodKey: string;
  /** Long label for table / tooltips, e.g. "Jan 2024". */
  periodLabel: string;
  /** Short tick label for dense axes, e.g. "Jan '24". */
  axisShort: string;
  value: number;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Shift YYYY-MM by delta months (delta may be negative). */
function shiftMonthKey(key: string, deltaMonths: number): string {
  const [ys, ms] = key.split("-");
  let y = parseInt(ys, 10);
  let m = parseInt(ms, 10) - 1;
  let idx = y * 12 + m + deltaMonths;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${pad2(nm)}`;
}

/** Current calendar month as YYYY-MM (uses runtime date). */
function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function enumerateMonthKeys(fromKey: string, toKey: string): string[] {
  const keys: string[] = [];
  let k = fromKey;
  while (k <= toKey) {
    keys.push(k);
    k = shiftMonthKey(k, 1);
  }
  return keys;
}

function formatMonthLabel(key: string, style: "long" | "short"): string {
  const [ys, ms] = key.split("-");
  const y = parseInt(ys, 10);
  const m = parseInt(ms, 10);
  const mi = Math.max(1, Math.min(12, m)) - 1;
  if (style === "long") return `${MONTH_NAMES[mi]} ${y}`;
  const yy = y % 100;
  return `${MONTH_NAMES[mi]} '${pad2(yy)}`;
}

function buildDeterministicMonthlySeries(title: string, valueDisplay: string): MonthlyPoint[] {
  const raw = valueDisplay.replace(/,/g, "");
  const baseValue = parseFloat(raw.replace(/[^0-9.-]/g, "")) || 100;
  const seed = hashString(`${title}\0${raw}`);
  const endKey = currentMonthKey();
  const keys = enumerateMonthKeys("2012-01", endKey);
  const total = keys.length;
  const out: MonthlyPoint[] = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const t = total > 1 ? i / (total - 1) : 0;
    const phase = i * 0.42 + seed * 0.001;
    const wave = Math.sin(phase) * baseValue * 0.045 + Math.cos(phase * 0.71) * baseValue * 0.028;
    const trend = baseValue * (0.72 + t * 0.28);
    const monthlyRipple = Math.sin(i * 0.55 + seed * 0.002) * baseValue * 0.012;
    out.push({
      periodKey: key,
      periodLabel: formatMonthLabel(key, "long"),
      axisShort: formatMonthLabel(key, "short"),
      value: +(trend + wave + monthlyRipple).toFixed(2),
    });
  }
  return out;
}

function filterMonthlyByRange(data: MonthlyPoint[], range: RangeType): MonthlyPoint[] {
  const maxKey = data.length ? data[data.length - 1].periodKey : currentMonthKey();
  let minKey = "2012-01";
  switch (range) {
    case "RECENT":
      minKey = shiftMonthKey(maxKey, -11);
      break;
    case "3Y":
      minKey = shiftMonthKey(maxKey, -35);
      break;
    case "5Y":
      minKey = shiftMonthKey(maxKey, -59);
      break;
    case "ALL":
    default:
      minKey = "2012-01";
  }
  return data.filter((d) => d.periodKey >= minKey && d.periodKey <= maxKey);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_").slice(0, 80) || "indicator";
}

async function downloadChartImage(chartRoot: HTMLElement | null, filenameBase: string) {
  if (!chartRoot) {
    toast.error("Chart area not found.");
    return;
  }
  const svg = chartRoot.querySelector("svg");
  if (!svg) {
    toast.error("No chart to export. Choose Line, Column, or Bar view.");
    return;
  }
  let source = new XMLSerializer().serializeToString(svg);
  if (!source.includes("xmlns")) {
    source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const rect = svg.getBoundingClientRect();
  const w = Math.max(Math.ceil(rect.width), 640);
  const h = Math.max(Math.ceil(rect.height), 360);

  try {
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg-load"));
      img.src = url;
    });
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-ctx");
    ctx.fillStyle = CHART_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve();
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${filenameBase}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("Chart saved as PNG");
        resolve();
      }, "image/png");
    });
  } catch {
    const blob = new Blob([source], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${filenameBase}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Chart saved as SVG (PNG fallback)");
  }
}

export function IndicatorDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const indicatorData = location.state as IndicatorLocationState | null;

  const decodedTitle = id ? decodeURIComponent(id) : "";
  const title = indicatorData?.title ?? (decodedTitle || "Indicator details");
  const value = indicatorData?.value ?? "—";
  const unit = indicatorData?.unit ?? "";
  const yoyDisplay = indicatorData?.yoyDisplay ?? "";
  const updateDate = indicatorData?.updateDate ?? "—";
  const isConfidential = indicatorData?.isConfidential ?? false;

  const yoyPositive = yoyDisplay.trimStart().startsWith("+");
  const deltaClass = yoyPositive ? "text-emerald-400 font-medium" : "text-red-400 font-medium";
  const hasPercentageInTitle = title.includes("%") || title.includes("(% ");

  const allData = useMemo(() => buildDeterministicMonthlySeries(title, value), [title, value]);

  const [graphType, setGraphType] = useState<GraphType>("line");
  const [showTooltips, setShowTooltips] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [showPreciseValue, setShowPreciseValue] = useState(false);
  const [range, setRange] = useState<RangeType>("RECENT");
  const [chartZoom, setChartZoom] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);

  const chartSurfaceRef = useRef<HTMLDivElement>(null);
  const timeSeriesSectionRef = useRef<HTMLDivElement>(null);

  const getFilteredData = useCallback(() => filterMonthlyByRange(allData, range), [allData, range]);

  const filteredData = getFilteredData();

  const tickValuesForAxis = useMemo(() => {
    if (filteredData.length === 0) return [];
    const targetTicks = 14;
    const step = Math.max(1, Math.ceil(filteredData.length / targetTicks));
    const out: string[] = [];
    for (let i = 0; i < filteredData.length; i += step) {
      out.push(filteredData[i].axisShort);
    }
    const lastShort = filteredData[filteredData.length - 1].axisShort;
    if (out[out.length - 1] !== lastShort) out.push(lastShort);
    return out;
  }, [filteredData]);

  const columnChartWidthPx = Math.max(720, filteredData.length * 8);

  const horizontalBarChartHeight = Math.min(560, Math.max(280, 40 + filteredData.length * 22));

  const formatValue = useCallback(
    (v: number) => (showPreciseValue ? v.toFixed(2) : String(v)),
    [showPreciseValue],
  );

  const renderMonthlyTooltip = (props: RechartsTooltipProps<number, string>) => {
    const { active, payload } = props;
    const row = payload?.[0]?.payload as MonthlyPoint | undefined;
    if (!active || !row) return null;
    return (
      <div className="rounded-lg border border-[#2e4567] bg-[#0f2744] px-3 py-2 text-xs shadow-md">
        <p className="text-[#94a3b8]">{row.periodLabel}</p>
        <p className="font-medium text-[#e2e8f0]">
          {formatValue(row.value)}
          {unit ? ` ${unit}` : ""}
        </p>
      </div>
    );
  };

  const LineValueLabel = (props: { x?: number; y?: number; value?: number }) => {
    const { x, y, value: v } = props;
    if (!showDataLabels || filteredData.length > 48 || v === undefined || x === undefined || y === undefined)
      return null;
    return (
      <text x={x} y={y - 12} fill={LABEL_FILL} textAnchor="middle" fontSize={11}>
        {formatValue(v)}
      </text>
    );
  };

  const ColumnBarLabel = (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: number;
  }) => {
    const { x, y, width, height, value: v } = props;
    if (!showDataLabels || filteredData.length > 36 || v === undefined || x === undefined || y === undefined)
      return null;
    const cx = (width ?? 0) / 2 + x;
    const cy = y - 6;
    return (
      <text x={cx} y={cy} fill={LABEL_FILL} textAnchor="middle" fontSize={11}>
        {formatValue(Number(v))}
      </text>
    );
  };

  const HorizontalBarLabel = (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: number;
  }) => {
    const { x, y, width, height, value: v } = props;
    if (!showDataLabels || filteredData.length > 36 || v === undefined || x === undefined || y === undefined)
      return null;
    const vx = x + (width ?? 0) + 8;
    const vy = y + (height ?? 0) / 2 + 4;
    return (
      <text x={vx} y={vy} fill={LABEL_FILL} textAnchor="start" fontSize={11}>
        {formatValue(Number(v))}
      </text>
    );
  };

  const handleExportPng = () => {
    if (graphType === "table" || graphType === "circular") {
      toast.message("Switch to Line, Column, or Bar to export the chart as an image.");
      return;
    }
    void downloadChartImage(chartSurfaceRef.current, sanitizeFilename(title));
  };

  const handleExportXlsx = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = filteredData.map((r) => ({
        Month: r.periodKey,
        "Month (label)": r.periodLabel,
        Value: showPreciseValue ? r.value : Math.round(r.value * 100) / 100,
        ...(unit ? { Unit: unit } : {}),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Series");
      XLSX.writeFile(wb, `${sanitizeFilename(title)}.xlsx`);
      toast.success("Spreadsheet downloaded");
    } catch {
      toast.error("Could not export spreadsheet.");
    }
  };

  const handleMetadataBundle = () => {
    const payload = {
      indicator: title,
      latestValue: value,
      unit,
      yoyDisplay,
      updateDate,
      classification: isConfidential ? "confidential" : "open",
      seriesPreview: filteredData.slice(-5),
      methodologyNote:
        "Figures follow SCAD compilation standards for official statistics. Full methodology is available from SCAD.",
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${sanitizeFilename(title)}_metadata.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Metadata bundle downloaded");
  };

  const handleNotifications = () => {
    setNotificationsEnabled((n) => {
      const next = !n;
      toast.success(next ? "You will be notified of updates" : "Notifications turned off");
      return next;
    });
  };

  const handleAddToCollection = () => {
    try {
      const key = "scad_indicator_bookmarks";
      const raw = localStorage.getItem(key);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(title)) {
        list.push(title);
        localStorage.setItem(key, JSON.stringify(list));
        toast.success("Added to your collection");
      } else {
        toast.message("Already in your collection");
      }
    } catch {
      toast.error("Could not save to collection");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.message("Use your browser print dialog to save or print this page.");
  };

  const handleReport = () => {
    toast.message("Opening print view for a shareable report.", {
      description: "Use Print → Save as PDF for a report.",
    });
    window.print();
  };

  const handleFullscreen = async () => {
    const el = timeSeriesSectionRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        toast.message("Full screen — press Esc to exit");
      } else {
        await document.exitFullscreen();
      }
    } catch {
      toast.error("Full screen is not available in this browser.");
    }
  };

  const handleZoomIn = () => {
    setChartZoom((z) => Math.min(2, Math.round((z + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setChartZoom((z) => Math.max(0.55, Math.round((z - 0.15) * 100) / 100));
  };

  const handleSavePreferences = () => {
    setPreferencesOpen(false);
    toast.success("Preferences saved");
  };

  const renderGraph = () => {
    if (graphType === "table") {
      return (
        <div className="overflow-auto rounded-lg border border-[#2e4567] bg-[#0a1f36]">
          <table className="w-full min-w-[300px] border-collapse text-sm text-[#e2e8f0]">
            <thead>
              <tr className="border-b border-[#2e4567] bg-[#163252]">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#f8fafc]">
                  Month
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#f8fafc]">
                  {unit ? `Value (${unit})` : "Value"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={item.periodKey}
                  className={cn(
                    "border-b border-[#2e4567] transition-colors hover:bg-[#163252]",
                    index % 2 === 0 ? "bg-[#0f2744]" : "bg-[#0c2239]",
                  )}
                >
                  <td className="px-3 py-2.5 tabular-nums text-[#cbd5e1]">{item.periodLabel}</td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums text-[#f8fafc]">
                    {showPreciseValue ? item.value.toFixed(2) : item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (graphType === "circular") {
      return (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#2e4567] bg-[#0a1f36] px-4 text-center">
          <p className="max-w-sm text-sm text-[#94a3b8]">
            Pie or donut charts are not used for this monthly time series. Use Line, Column, Bar, or Table.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-[#2e4567] bg-[#0f2744] text-[#e2e8f0] hover:bg-[#163252]"
            onClick={() => setGraphType("line")}
          >
            Show line chart
          </Button>
        </div>
      );
    }

    const chartKey = `${graphType}-${range}-${filteredData.length}`;
    const lineDotR = filteredData.length > 80 ? 2.5 : filteredData.length > 40 ? 3.5 : 5;

    return (
      <div
        className="overflow-auto rounded-lg bg-[#0a1f36] p-2 [-ms-overflow-style:none] [scrollbar-width:thin]"
        style={{ maxHeight: chartZoom > 1 ? 520 : graphType === "bar" ? horizontalBarChartHeight + 40 : 440 }}
      >
        <div
          ref={chartSurfaceRef}
          style={{
            transform: `scale(${chartZoom})`,
            transformOrigin: "top center",
            width: graphType === "column" ? `${columnChartWidthPx}px` : "100%",
            minWidth: "100%",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height={graphType === "bar" ? horizontalBarChartHeight : 400}
            key={chartKey}
          >
            {graphType === "line" ? (
              <LineChart data={filteredData} margin={{ ...LINE_MARGIN, bottom: 12 }}>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="axisShort"
                  ticks={tickValuesForAxis}
                  tick={{ fill: CHART_AXIS, fontSize: 10 }}
                  stroke={CHART_GRID}
                  tickLine={{ stroke: CHART_GRID }}
                  axisLine={{ stroke: CHART_GRID }}
                  interval={0}
                  angle={-38}
                  textAnchor="end"
                  height={54}
                />
                <YAxis
                  tick={{ fill: CHART_AXIS, fontSize: 11 }}
                  stroke={CHART_GRID}
                  tickLine={{ stroke: CHART_GRID }}
                  axisLine={{ stroke: CHART_GRID }}
                  width={56}
                />
                {showTooltips && <RechartsTooltip content={renderMonthlyTooltip} />}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_ACCENT}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_ACCENT, strokeWidth: 0, r: lineDotR }}
                  activeDot={{ r: Math.min(8, lineDotR + 2), fill: CHART_ACCENT }}
                  isAnimationActive={true}
                  label={<LineValueLabel />}
                />
              </LineChart>
            ) : graphType === "column" ? (
              <BarChart data={filteredData} margin={{ ...LINE_MARGIN, bottom: 12 }} barCategoryGap="8%">
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="axisShort"
                  ticks={tickValuesForAxis}
                  tick={{ fill: CHART_AXIS, fontSize: 10 }}
                  stroke={CHART_GRID}
                  tickLine={{ stroke: CHART_GRID }}
                  axisLine={{ stroke: CHART_GRID }}
                  interval={0}
                  angle={-38}
                  textAnchor="end"
                  height={54}
                />
                <YAxis
                  tick={{ fill: CHART_AXIS, fontSize: 11 }}
                  stroke={CHART_GRID}
                  tickLine={{ stroke: CHART_GRID }}
                  axisLine={{ stroke: CHART_GRID }}
                  width={56}
                />
                {showTooltips && <RechartsTooltip content={renderMonthlyTooltip} />}
                <Bar
                  dataKey="value"
                  fill={CHART_ACCENT}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={filteredData.length > 48 ? 12 : 48}
                  label={showDataLabels ? <ColumnBarLabel /> : undefined}
                />
              </BarChart>
            ) : (
              <BarChart data={filteredData} layout="vertical" margin={BAR_H_MARGIN} barCategoryGap="12%">
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: CHART_AXIS, fontSize: 11 }}
                  stroke={CHART_GRID}
                  tickLine={{ stroke: CHART_GRID }}
                  axisLine={{ stroke: CHART_GRID }}
                />
                <YAxis
                  dataKey="axisShort"
                  type="category"
                  ticks={tickValuesForAxis}
                  width={56}
                  tick={{ fill: CHART_AXIS, fontSize: 10 }}
                  stroke={CHART_GRID}
                  tickLine={false}
                  interval={0}
                  axisLine={{ stroke: CHART_GRID }}
                />
                {showTooltips && <RechartsTooltip content={renderMonthlyTooltip} />}
                <Bar
                  dataKey="value"
                  fill={CHART_ACCENT}
                  radius={[0, 5, 5, 0]}
                  barSize={filteredData.length > 48 ? 14 : 20}
                  label={showDataLabels ? <HorizontalBarLabel /> : undefined}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="border-gray-200 bg-white text-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preferences</DialogTitle>
            <DialogDescription className="text-gray-600">
              Local settings for this indicator view (stored in this session only unless noted).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="digest" className="text-sm text-gray-700">
                Email digest for updates
              </Label>
              <Switch id="digest" checked={emailDigest} onCheckedChange={setEmailDigest} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="defTip" className="text-sm text-gray-700">
                Show chart tooltips by default
              </Label>
              <Switch
                id="defTip"
                checked={showTooltips}
                onCheckedChange={(c) => setShowTooltips(c === true)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-200" onClick={() => setPreferencesOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSavePreferences}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={methodologyOpen} onOpenChange={setMethodologyOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-gray-200 bg-white text-gray-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Metadata and methodology</DialogTitle>
            <DialogDescription className="text-gray-600">{title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p>
              This time series is compiled under SCAD quality frameworks: source validation, revision policy,
              and classification aligned with international statistical guidelines.
            </p>
            <p>
              <span className="font-medium text-gray-900">Frequency:</span> Monthly compilation (sample series in
              this demo); official releases follow SCAD calendars.
            </p>
            <p>
              <span className="font-medium text-gray-900">Unit:</span> {unit || "As published"}.
            </p>
            <p>
              <span className="font-medium text-gray-900">Last updated:</span> {updateDate}.
            </p>
            <p className="text-xs text-gray-500">
              For the authoritative methodology statement and revision tables, refer to the SCAD publication
              catalogue.
            </p>
          </div>
          <DialogFooter>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setMethodologyOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-gray-200"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <SectionIcon icon={BarChart3} tone="slate" size="sm" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Economy</p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <SectionIcon icon={Shield} tone="blue" size="sm" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Official statistics</p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Indicator detail
              </span>
            </div>
            <h1 className="text-balance text-xl font-semibold leading-snug text-gray-900 sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-gray-200">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              <DropdownMenuItem onSelect={handleExportPng}>Download chart (PNG)</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void handleExportXlsx()}>Export data (XLSX)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleMetadataBundle}>Metadata bundle (JSON)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-gray-200" aria-label="More actions">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleNotifications}>
                <Bell className="mr-2 h-4 w-4" />
                {notificationsEnabled ? "Mute notifications" : "Notify me on updates"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleAddToCollection}>
                <Plus className="mr-2 h-4 w-4" />
                Add to collection
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPreferencesOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleReport}>
                <FileText className="mr-2 h-4 w-4" />
                Report (PDF via print)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void handleFullscreen()}>
                <Maximize2 className="mr-2 h-4 w-4" />
                Full screen chart
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleZoomIn}>
                <ZoomIn className="mr-2 h-4 w-4" />
                Zoom in
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleZoomOut}>
                <ZoomOut className="mr-2 h-4 w-4" />
                Zoom out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-gray-200 bg-white shadow-sm ring-1 ring-white/5">
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Latest value</p>
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums text-gray-900 sm:text-4xl">{value}</span>
              {hasPercentageInTitle && <span className="text-3xl font-bold text-gray-900 sm:text-4xl">%</span>}
            </div>
            {unit ? <p className="text-sm text-gray-600">{unit}</p> : null}
            {yoyDisplay ? (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {yoyPositive ? (
                  <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 shrink-0 text-red-400" />
                )}
                <span className={cn("text-sm tabular-nums", deltaClass)}>{yoyDisplay}</span>
                <span className="text-xs text-gray-500">Year over year</span>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {isConfidential ? (
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge className="gap-1 bg-red-100 text-red-700 hover:bg-red-100">
                        Confidential
                        <Info className="h-3 w-3" />
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Authorized access only; follows SCAD classification for sensitive official statistics.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                        Open
                        <Info className="h-3 w-3" />
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Publicly available under SCAD open data guidelines.</p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            )}
            <p className="text-xs text-gray-500">Updated {updateDate}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm ring-1 ring-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">About this indicator</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-sm leading-relaxed text-gray-700">
            This indicator describes{" "}
            <span className="text-gray-900">{title.toLowerCase()}</span>. Figures are compiled and
            quality-assured by the Statistics Centre — Abu Dhabi (SCAD). The chart below uses monthly-level sample
            observations aligned with SCAD publication cycles. Use this series to track trends alongside other
            foreign trade and economy indicators.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <div ref={timeSeriesSectionRef} className="min-h-0 lg:col-span-3">
          <Card className="border-gray-200 bg-white shadow-sm ring-1 ring-white/5 print:border-none print:shadow-none">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">Time series</CardTitle>
            <p className="text-sm text-gray-500">
              Monthly observations — Recent is the last 12 months; 3Y / 5Y are trailing months; All spans from Jan
              2012 through the latest published month. Zoom from the ⋯ menu or the controls below.
            </p>
          </CardHeader>
          <CardContent className="pt-6">{renderGraph()}</CardContent>
          <CardContent className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-200 pt-6 pb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {(["3Y", "5Y", "ALL", "RECENT"] as RangeType[]).map((r) => (
                <Button
                  key={r}
                  variant={range === r ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRange(r)}
                  className={
                    range === r ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200"
                  }
                >
                  {r === "RECENT" ? "Recent" : r}
                </Button>
              ))}
            </div>
            <div className="flex w-full justify-center gap-2 border-t border-gray-200 pt-4 sm:w-auto sm:border-t-0 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200"
                onClick={handleZoomOut}
                disabled={chartZoom <= 0.55}
              >
                <ZoomOut className="mr-1 h-4 w-4" />
                Zoom out
              </Button>
              <Button variant="outline" size="sm" className="border-gray-200" disabled>
                {Math.round(chartZoom * 100)}%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200"
                onClick={handleZoomIn}
                disabled={chartZoom >= 2}
              >
                <ZoomIn className="mr-1 h-4 w-4" />
                Zoom in
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>

        <Card className="border-gray-200 bg-white shadow-sm ring-1 ring-white/5 lg:col-span-1">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">Chart type</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={graphType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("line")}
                  className={cn(
                    "h-auto min-h-10 flex-col py-2",
                    graphType === "line" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200",
                  )}
                >
                  <span className="text-xs">Line</span>
                </Button>
                <Button
                  variant={graphType === "column" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("column")}
                  className={cn(
                    "h-auto min-h-10 flex-col py-2",
                    graphType === "column" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200",
                  )}
                >
                  <span className="text-xs">Column</span>
                </Button>
                <Button
                  variant={graphType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("bar")}
                  className={cn(
                    "h-auto min-h-10 flex-col py-2",
                    graphType === "bar" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200",
                  )}
                >
                  <span className="text-xs">Bar</span>
                </Button>
                <Button
                  variant={graphType === "circular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("circular")}
                  className={cn(
                    "h-auto min-h-10 flex-col py-2",
                    graphType === "circular" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200",
                  )}
                >
                  <span className="text-xs">Circular</span>
                </Button>
                <Button
                  variant={graphType === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("table")}
                  className={cn(
                    "col-span-2 h-auto min-h-10 flex-col py-2",
                    graphType === "table" ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200",
                  )}
                >
                  <span className="text-xs">Table</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700">Options</p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tip"
                  checked={showTooltips}
                  onCheckedChange={(c) => setShowTooltips(c === true)}
                />
                <Label htmlFor="tip" className="text-sm font-normal text-gray-700">
                  Tooltips
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="labels"
                  checked={showDataLabels}
                  onCheckedChange={(c) => setShowDataLabels(c === true)}
                  disabled={graphType === "table"}
                />
                <Label htmlFor="labels" className="text-sm font-normal text-gray-700">
                  Data labels
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="precise"
                  checked={showPreciseValue}
                  onCheckedChange={(c) => setShowPreciseValue(c === true)}
                />
                <Label htmlFor="precise" className="text-sm font-normal text-gray-700">
                  Precise values
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm ring-1 ring-white/5">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <TooltipProvider>
              <TooltipUI>
                <TooltipTrigger asChild>
                  <div>
                    <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                      <Info className="h-3 w-3" />
                      {isConfidential ? "Restricted use" : "Open classification"}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    {isConfidential
                      ? "This series may be subject to access rules under SCAD confidentiality policy."
                      : "Open data may be shared and reused according to SCAD terms for official statistics."}
                  </p>
                </TooltipContent>
              </TooltipUI>
            </TooltipProvider>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Updated:</span> {updateDate}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Source:</span> SCAD official statistics
            </div>
          </div>
          <Button
            variant="link"
            className="h-auto p-0 text-cyan-400 hover:text-cyan-300"
            onClick={() => setMethodologyOpen(true)}
          >
            Metadata and methodology
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
