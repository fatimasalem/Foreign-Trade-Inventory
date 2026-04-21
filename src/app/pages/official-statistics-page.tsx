import { useState } from "react";
import { useNavigate } from "react-router";
import { BarChart3, Shield, Info, ArrowUpRight, Check, Download, Plus, Bell, LayoutGrid, BarChart2, Search, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast, Toaster } from "sonner";
import { SectionIcon } from "../components/section-icon";

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  /** Absolute year-over-year change amount (shown beside the percentage, same color). */
  absoluteChange: string;
  updateDate: string;
  isConfidential: boolean;
  isChecked: boolean;
  onCheckChange: (checked: boolean) => void;
}

function StatCard({ title, value, unit, change, absoluteChange, updateDate, isConfidential, isChecked, onCheckChange }: StatCardProps) {
  const navigate = useNavigate();
  const isPositive = change.startsWith("+");
  const deltaClass = isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium";
  const hasPercentage = title.includes("%") || title.includes("(% ");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "graph">("card");
  const [emailSubscribe, setEmailSubscribe] = useState(false);

  const handleNavigateToDetail = () => {
    navigate(`/indicator/${encodeURIComponent(title)}`, {
      state: { title, value, unit, change, absoluteChange, updateDate, isConfidential }
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success("Added to my bookmarks");
    }
  };

  const handleNotification = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
    if (!isNotificationEnabled) {
      toast(
        <div className="flex flex-col gap-2">
          <p className="text-sm">You have set this indicator to notifications</p>
          <p className="text-sm">We have added this to the notification, Would you like to subscribe through email?</p>
          <div className="flex items-center gap-2">
            <Switch checked={emailSubscribe} onCheckedChange={setEmailSubscribe} />
            <span className="text-xs text-gray-600">Email subscription</span>
          </div>
        </div>,
        { duration: 5000 }
      );
    }
  };

  // Generate sample data for the line graph
  const graphData = [
    { year: '2012', value: parseFloat(value) * 0.7 },
    { year: '2014', value: parseFloat(value.replace(/,/g, '')) * 0.75 },
    { year: '2016', value: parseFloat(value.replace(/,/g, '')) * 0.8 },
    { year: '2018', value: parseFloat(value.replace(/,/g, '')) * 0.85 },
    { year: '2020', value: parseFloat(value.replace(/,/g, '')) * 0.9 },
    { year: '2022', value: parseFloat(value.replace(/,/g, '')) * 0.95 },
    { year: '2024', value: parseFloat(value.replace(/,/g, '')) * 0.98 },
    { year: '2026', value: parseFloat(value.replace(/,/g, '')) },
  ];

  if (viewMode === "graph") {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 col-span-full">
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
                  <button
                    onClick={handleBookmark}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                      isBookmarked ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
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
                  <button
                    onClick={handleNotification}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                      isNotificationEnabled ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
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
                    onClick={() => setViewMode("card")}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                      viewMode === "card" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Card view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("graph")}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                      viewMode === "graph" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Graph view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleNavigateToDetail}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                  >
                    <ArrowUpRight className="h-4 w-4 text-gray-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Left side - Value info */}
          <div className="col-span-1">
            <div className="flex items-baseline gap-1 mb-2">
              <div className="text-3xl font-bold text-gray-900">
                {value}
              </div>
              {hasPercentage && (
                <div className="text-3xl font-bold text-gray-900">%</div>
              )}
            </div>
            <div className="text-sm text-gray-600 mb-2">{unit}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
              {isPositive ? <TrendingUp className="h-4 w-4 shrink-0 text-green-600" /> : <TrendingDown className="h-4 w-4 shrink-0 text-red-600" />}
              <span className={`text-sm tabular-nums ${deltaClass}`}>{absoluteChange}</span>
              <span className={`text-sm tabular-nums ${deltaClass}`}>{change}</span>
            </div>
            <div className="text-xs text-gray-500">Comparing to Y/Y</div>
          </div>

          {/* Center - Graph */}
          <div className="col-span-3">
            <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" key="grid-stat" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#9ca3af" key="xaxis-stat" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" key="yaxis-stat" />
                <RechartsTooltip key="tooltip-stat" />
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee", r: 4 }} key="line-stat" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-2">
              📅 Updated date: {updateDate}
            </div>
            <div className="flex items-center gap-2 text-cyan-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Compared Indicator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConfidential ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1 cursor-help">
                        CONFIDENTIAL
                        <Info className="h-3 w-3" />
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs font-semibold mb-1">Data Classification: Confidential</p>
                    <p className="text-xs">Data that is authorized for access by all local and federal government entities, statistical agencies of other emirates, and government companies fully or partially owned by the emirate of Abu Dhabi</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 cursor-help">
                        OPEN
                        <Info className="h-3 w-3" />
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs font-semibold mb-1">Data Classification: Open</p>
                    <p className="text-xs">Data that is authorized for direct access without restriction</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${isChecked ? "bg-blue-100 text-blue-600 border-blue-600" : ""}`}
                    onClick={() => onCheckChange(!isChecked)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Check to compare multiple indicators</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem>Export to excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <BarChart3 className="h-5 w-5 text-gray-700" />
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
                  <Shield className="h-5 w-5 text-blue-600" />
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
                <button
                  onClick={handleBookmark}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                    isBookmarked ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
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
                <button
                  onClick={handleNotification}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                    isNotificationEnabled ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
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
                  onClick={() => setViewMode("card")}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                    viewMode === "card" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Card view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode("graph")}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                    viewMode === "graph" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <BarChart2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Graph view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleNavigateToDetail}
                  className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <ArrowUpRight className="h-4 w-4 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <div className="text-3xl font-bold text-gray-900">
            {value}
          </div>
          {hasPercentage && (
            <div className="text-3xl font-bold text-gray-900">%</div>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-1">{unit}</div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm tabular-nums">
          <span className={deltaClass}>{absoluteChange}</span>
          <span className={deltaClass}>{change}</span>
        </div>
        <div className="text-xs text-gray-500">Comparing to Y/Y</div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{title}</h3>
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-2">
          📅 Updated date: {updateDate}
        </div>
        <div className="flex items-center justify-between">
          {isConfidential ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1 cursor-help">
                      CONFIDENTIAL
                      <Info className="h-3 w-3" />
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs font-semibold mb-1">Data Classification: Confidential</p>
                  <p className="text-xs">Data that is authorized for access by all local and federal government entities, statistical agencies of other emirates, and government companies fully or partially owned by the emirate of Abu Dhabi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 cursor-help">
                      OPEN
                      <Info className="h-3 w-3" />
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs font-semibold mb-1">Data Classification: Open</p>
                  <p className="text-xs">Data that is authorized for direct access without restriction</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${isChecked ? "bg-blue-100 text-blue-600 border-blue-600" : ""}`}
                    onClick={() => onCheckChange(!isChecked)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Check to compare multiple indicators</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem>Export to excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfficialStatisticsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedCards, setCheckedCards] = useState<Set<number>>(new Set());

  const handleCheckChange = (index: number, checked: boolean) => {
    const newCheckedCards = new Set(checkedCards);
    if (checked) {
      newCheckedCards.add(index);
    } else {
      newCheckedCards.delete(index);
    }
    setCheckedCards(newCheckedCards);
  };

  const handleCompare = () => {
    const selectedIndicators = Array.from(checkedCards).map(index => statistics[index]);
    navigate("/compare-indicators", {
      state: { indicators: selectedIndicators }
    });
  };

  const statistics = [
    {
      title: "Balance of trade of agricultural goods and food",
      value: "1,223.96",
      unit: "Million Emirati Dirham",
      change: "+89%",
      absoluteChange: "1,089.2 million Emirati dirham",
      updateDate: "2025-06-20",
      isConfidential: false
    },
    {
      title: "Balance of trade of goods",
      value: "45,678.50",
      unit: "Million Emirati Dirham",
      change: "+12.5%",
      absoluteChange: "5,087.6 million Emirati dirham",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Balance of trade of goods (% of GDP)",
      value: "28.5",
      unit: "Percentage",
      change: "+3.2%",
      absoluteChange: "0.9 percentage points",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of crude oil",
      value: "125,340.75",
      unit: "Million Emirati Dirham",
      change: "+8.7%",
      absoluteChange: "10,028.4 million Emirati dirham",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of goods (% of GDP)",
      value: "42.3",
      unit: "Percentage",
      change: "+5.1%",
      absoluteChange: "2.1 percentage points",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of goods of the emirates of Abu Dhabi",
      value: "89,542.30",
      unit: "Million Emirati Dirham",
      change: "+15.8%",
      absoluteChange: "12,256.4 million Emirati dirham",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of oil, gas and oil products",
      value: "156,890.25",
      unit: "Million Emirati Dirham",
      change: "+6.9%",
      absoluteChange: "10,129.4 million Emirati dirham",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of oil, gas and oil products (% GDP)",
      value: "52.7",
      unit: "Percentage",
      change: "+4.3%",
      absoluteChange: "2.2 percentage points",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of oil, gas and oil products (% total exports of goods)",
      value: "68.4",
      unit: "Percentage",
      change: "+2.8%",
      absoluteChange: "1.9 percentage points",
      updateDate: "2025-06-20",
      isConfidential: true
    },
    {
      title: "Exports of refined petroleum products",
      value: "32,456.80",
      unit: "Million Emirati Dirham",
      change: "+11.2%",
      absoluteChange: "3,275.2 million Emirati dirham",
      updateDate: "2025-06-20",
      isConfidential: true
    }
  ];

  const filteredStatistics = statistics.filter(stat =>
    stat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedCount = checkedCards.size;

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Search and Compare Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search indicators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            disabled={checkedCount < 2}
            onClick={handleCompare}
            className={`${
              checkedCount >= 2
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Compare ({checkedCount})
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStatistics.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              isChecked={checkedCards.has(index)}
              onCheckChange={(checked) => handleCheckChange(index, checked)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
