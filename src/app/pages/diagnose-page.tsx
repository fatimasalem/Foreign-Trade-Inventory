import { Fragment, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Bot, ChevronDown, ChevronRight, LineChart as LineChartIcon, PieChart } from "lucide-react";
import { getHsSectionForChapter, parseHsChapterCode } from "../../lib/hs-sections";
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
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { UAETradeMap } from "../components/uae-trade-map";

type Classification = "HS1" | "BEC" | "SITC";

export function DiagnosePage() {
  const { openAIAssistant } = useAIAssistant();
  const [classification, setClassification] = useState<Classification>("HS1");
  const [foreignTradeType, setForeignTradeType] = useState("all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["All Countries"]);
  const [tradeType, setTradeType] = useState("all");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(() => new Set());

  const countries = ["All Countries", "China", "India", "USA", "Saudi Arabia"];

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

  const toggleRowExpanded = (rowKey: string) => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const handleAskAI = () => {
    if (selectedCategory) {
      const question = `What are the factors contributing to the ${selectedCategory.risk.toLowerCase()} risk level for ${getCategoryName(selectedCategory)}? The category shows ${selectedCategory.mom} MoM and ${selectedCategory.yoy} YoY changes.`;
      openAIAssistant(question);
      setIsDialogOpen(false);
    }
  };

  const getCategoryName = (category: typeof categories[0]) => {
    switch (classification) {
      case "HS1":
        return category.hs1;
      case "BEC":
        return category.bec;
      case "SITC":
        return category.sitc;
    }
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
      {/* UAE Trade Distribution Map */}
      <UAETradeMap />

      {/* Category Analysis Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <SectionIcon icon={PieChart} tone="slate" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Category Analysis</h3>
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
              <TableHead className="w-10 p-2">
                <span className="sr-only">Expand HS section</span>
              </TableHead>
              <TableHead className="w-[32%]">Category</TableHead>
              <TableHead className="w-[15%]">Risk</TableHead>
              <TableHead className="w-[12%] text-right">Weight</TableHead>
              <TableHead className="w-[12%] text-right">MoM</TableHead>
              <TableHead className="w-[16%] text-right">YoY</TableHead>
              <TableHead className="w-[10%] text-right">
                <span className="sr-only">Open trend</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TooltipProvider>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-10">
                    No categories match the selected filters. Try widening country, trade mode, or foreign trade type.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => {
                  const rowKey = category.hs1;
                  const isExpanded = expandedRowKeys.has(rowKey);
                  const hsChapter = parseHsChapterCode(category.hs1);
                  const hsSection = hsChapter != null ? getHsSectionForChapter(hsChapter) : null;

                  return (
                    <Fragment key={rowKey}>
                      <TableRow
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleRowClick(category)}
                      >
                        <TableCell className="w-10 p-1 align-middle" onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Hide HS section details" : "Show HS section details"}
                            onClick={() => toggleRowExpanded(rowKey)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{getCategoryName(category)}</TableCell>
                        <TableCell>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help ${getRiskBadgeColor(
                                  category.riskLevel
                                )}`}
                              >
                                {category.risk}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">{category.riskCause}</p>
                            </TooltipContent>
                          </UITooltip>
                        </TableCell>
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
                      {isExpanded && (
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableCell colSpan={7} className="py-3 px-4 border-b border-gray-100">
                            <div className="pl-2 text-sm text-gray-800">
                              {hsSection && hsChapter != null ? (
                                <>
                                  <p className="font-medium text-gray-900">
                                    {hsSection.number}. {hsSection.title}
                                  </p>
                                  <ul className="mt-2 list-none pl-0 space-y-0.5 text-gray-600 font-mono text-sm tabular-nums">
                                    {hsSection.chapterCodes.map((code) => (
                                      <li key={code}>{code}</li>
                                    ))}
                                  </ul>
                                  <p className="text-xs text-gray-500 mt-2">
                                    This row&apos;s HS chapter{" "}
                                    <span className="font-mono tabular-nums">
                                      {String(hsChapter).padStart(2, "0")}
                                    </span>{" "}
                                    falls under HS Section {hsSection.number}.
                                  </p>
                                </>
                              ) : (
                                <p className="text-gray-500 text-sm">
                                  HS section could not be resolved from this category&apos;s chapter code.
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TooltipProvider>
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