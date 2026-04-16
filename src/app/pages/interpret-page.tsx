import { useState } from "react";
import { useNavigate } from "react-router";
import { DriverSection } from "../components/driver-section";
import { EventsSection } from "../components/events-section";
import { GlobalTradeMap } from "../components/global-trade-map";
import { FlippableIndicatorCard } from "../components/flippable-indicator-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { SectionIcon } from "../components/section-icon";
import { BarChart3, Shield, ArrowUpRight, Plus, Bell, Download, Info, ScrollText, LineChart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function InterpretPage() {
  const navigate = useNavigate();
  const [globalMonth, setGlobalMonth] = useState("March");
  const [globalYear, setGlobalYear] = useState("2026");
  const [metricsMonth, setMetricsMonth] = useState("March");
  const [metricsYear, setMetricsYear] = useState("2026");
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
    <div className="space-y-6">
      {/* Global Filters */}
      <div className="flex items-center justify-end">
        <div className="flex gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Month</label>
              <Select value={globalMonth} onValueChange={setGlobalMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Year</label>
              <Select value={globalYear} onValueChange={setGlobalYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      {/* Top Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Non-Oil Imports */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={BarChart3} tone="slate" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Economy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={Shield} tone="blue" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add to bookmarks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Set notification</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/official-statistics")}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                    >
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">View in Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <div className="text-3xl font-bold text-gray-900">45.2B</div>
            </div>
            <div className="text-sm text-gray-600 mb-1">AED billions</div>
            <div className="text-sm text-gray-600">
              <span className="text-red-600 font-medium">-2.6B (-5.8%)</span>
            </div>
            <div className="text-xs text-gray-500">Comparing to M/M</div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">Non-Oil Imports</h3>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">
              📅 Updated date: 2026-03-20
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 cursor-help">
                OPEN
                <Info className="h-3 w-3" />
              </Badge>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Non-Oil Exports */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={BarChart3} tone="slate" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Economy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={Shield} tone="blue" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add to bookmarks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Set notification</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/official-statistics")}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                    >
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">View in Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <div className="text-3xl font-bold text-gray-900">28.7B</div>
            </div>
            <div className="text-sm text-gray-600 mb-1">AED billions</div>
            <div className="text-sm text-gray-600">
              <span className="text-green-600 font-medium">+3.1B (+12.3%)</span>
            </div>
            <div className="text-xs text-gray-500">Comparing to M/M</div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">Non-Oil Exports</h3>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">
              📅 Updated date: 2026-03-20
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 cursor-help">
                OPEN
                <Info className="h-3 w-3" />
              </Badge>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Non-Oil Re-Exports */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={BarChart3} tone="slate" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Economy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={Shield} tone="blue" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add to bookmarks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Set notification</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/official-statistics")}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                    >
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">View in Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <div className="text-3xl font-bold text-gray-900">31.5B</div>
            </div>
            <div className="text-sm text-gray-600 mb-1">AED billions</div>
            <div className="text-sm text-gray-600">
              <span className="text-green-600 font-medium">+1.0B (+3.2%)</span>
            </div>
            <div className="text-xs text-gray-500">Comparing to M/M</div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">Non-Oil Re-Exports</h3>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">
              📅 Updated date: 2026-03-20
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 cursor-help">
                OPEN
                <Info className="h-3 w-3" />
              </Badge>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Net Trade Balance */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={BarChart3} tone="slate" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Economy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <SectionIcon icon={Shield} tone="blue" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add to bookmarks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-600">
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Set notification</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/official-statistics")}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                    >
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">View in Official Statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <div className="text-3xl font-bold text-gray-900">15.0B</div>
            </div>
            <div className="text-sm text-gray-600 mb-1">AED billions</div>
            <div className="text-sm text-gray-600">
              <span className="text-green-600 font-medium">+2.3B (+18.5%)</span>
            </div>
            <div className="text-xs text-gray-500">Comparing to M/M</div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">Net Trade Balance</h3>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">
              📅 Updated date: 2026-03-20
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 cursor-help">
                OPEN
                <Info className="h-3 w-3" />
              </Badge>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Summary */}
      <div className="rounded-lg border border-gray-200 bg-white/80 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3 mb-3">
          <SectionIcon icon={ScrollText} tone="primary" size="md" />
          <h2 className="font-semibold text-lg text-gray-900 leading-snug m-0">Overview Summary</h2>
        </div>
        <div className="prose max-w-none prose-p:my-0">
          <p className="text-gray-700 leading-relaxed text-[15px]">
            For {globalMonth} {globalYear}, Abu Dhabi's non-oil trade shows mixed performance.
            <strong className="text-gray-900"> Imports totaled AED 45.2B</strong> (<span className="text-red-600 font-medium">-5.8% MoM</span>),
            driven by reduced vehicle and pharmaceutical imports.
            <strong className="text-gray-900"> Exports reached AED 28.7B</strong> (<span className="text-green-600 font-medium">+12.3% MoM</span>),
            led by aluminum (+32.8%) and precious metals (+45.2%).
            <strong className="text-gray-900"> Re-exports at AED 31.5B</strong> grew <span className="text-green-600 font-medium">3.2% MoM</span>,
            while the <strong className="text-gray-900">net trade balance improved to AED 15.0B</strong> (<span className="text-green-600 font-medium">+18.5% MoM</span>).
          </p>
        </div>
      </div>

      {/* Main Trade Metrics */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SectionIcon icon={LineChart} tone="slate" size="md" />
            <h2 className="font-semibold text-lg text-gray-900 leading-snug m-0">Trade Metrics</h2>
          </div>
          <div className="flex gap-2">
            <div>
              <Select value={metricsMonth} onValueChange={setMetricsMonth}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={metricsYear} onValueChange={setMetricsYear}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Global Trade Map */}
      <GlobalTradeMap />

      {/* Events Section */}
      <EventsSection />
    </div>
  );
}