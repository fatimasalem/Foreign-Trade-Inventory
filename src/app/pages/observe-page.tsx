import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Globe,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Activity,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Search,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { SectionIcon } from "../components/section-icon";
import {
  categoryAnalysisRowsForClassification,
  categoryAnalysisRowMatchesSearch,
  classificationArticleDisplayRows,
  type CategoryAnalysisRow,
  type ClassificationDisplayRow,
  type ClassificationKind,
} from "../data/observe-categories-analysis";

/** Skip descendant rows when a chapter/heading node is collapsed. */
function getVisibleNestedClassificationRows(
  rows: ClassificationDisplayRow[],
  rowPrefix: string,
  collapsedNestedKeys: Set<string>,
): { row: ClassificationDisplayRow; nestedKey: string; flatIndex: number }[] {
  const out: { row: ClassificationDisplayRow; nestedKey: string; flatIndex: number }[] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    const nestedKey = `${rowPrefix}::${i}`;
    if (row.kind === "node") {
      out.push({ row, nestedKey, flatIndex: i });
      if (collapsedNestedKeys.has(nestedKey)) {
        const d = row.depth;
        i++;
        while (i < rows.length && rows[i].depth > d) {
          i++;
        }
        continue;
      }
      i++;
      continue;
    }
    out.push({ row, nestedKey, flatIndex: i });
    i++;
  }
  return out;
}

/** Keys for all hierarchy "node" rows (collapsed by default so only the expand control opens detail). */
function collectNestedNodeKeysForRow(
  item: CategoryAnalysisRow,
  cls: ClassificationKind,
  rowKey: string,
): string[] {
  const displayRows = classificationArticleDisplayRows(item, cls);
  return displayRows.reduce<string[]>((acc, r, i) => {
    if (r.kind === "node") acc.push(`${rowKey}::${i}`);
    return acc;
  }, []);
}

interface FlippableCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  subtitle: string;
  unit: string;
  insight: string;
}

function FlippableCard({ icon, label, value, change, subtitle, unit, insight }: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isPositive = change.includes("↑");

  return (
    <div
      className="relative h-48 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 preserve-3d`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full backface-hidden bg-white rounded-lg p-6 border border-gray-200 flex flex-col"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm text-gray-600">{label}</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
          <div className={`text-sm mt-1 ${isPositive ? "text-green-600" : "text-gray-600"}`}>{change}</div>
          <div className="text-xs text-gray-400 mt-1">{unit}</div>
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lightbulb className="h-3 w-3" />
              <span>Click to see insights</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-blue-50 rounded-lg p-4 border border-blue-200"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="flex flex-col h-full">
            <div className="text-xs font-medium text-blue-900 mb-2">Insight</div>
            <p className="text-xs text-blue-800 leading-relaxed flex-1">
              {insight}
            </p>
            <div className="text-xs text-blue-600 mt-2">Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ObservePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All Categories");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["All Countries"]);
  const [exportMonth, setExportMonth] = useState("March");
  const [exportYear, setExportYear] = useState("2026");
  const [exportClassification, setExportClassification] = useState("HS");
  const [exportSelectedCountries, setExportSelectedCountries] = useState<string[]>(["All Countries"]);
  const [importMonth, setImportMonth] = useState("March");
  const [importYear, setImportYear] = useState("2026");
  const [importClassification, setImportClassification] = useState("HS");
  const [importSelectedCountries, setImportSelectedCountries] = useState<string[]>(["All Countries"]);
  const [tableClassification, setTableClassification] = useState("HS");
  const [tableSelectedCountries, setTableSelectedCountries] = useState<string[]>(["All Countries"]);
  const [tableMonth, setTableMonth] = useState("March");
  const [tableYear, setTableYear] = useState("2026");
  const [tableTradeType, setTableTradeType] = useState("all");
  const [categoryAnalysisSearch, setCategoryAnalysisSearch] = useState("");
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Set<string>>(() => new Set());
  const [collapsedNestedKeys, setCollapsedNestedKeys] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setExpandedCategoryKeys(new Set());
    setCollapsedNestedKeys(new Set());
  }, [tableClassification, categoryAnalysisSearch]);

  const countries = ["All Countries", "China", "India", "USA", "Saudi Arabia"];

  const toggleCategoryExpanded = (rowKey: string, item: CategoryAnalysisRow) => {
    const cls = tableClassification as ClassificationKind;
    if (expandedCategoryKeys.has(rowKey)) {
      setExpandedCategoryKeys((prev) => {
        const next = new Set(prev);
        next.delete(rowKey);
        return next;
      });
      setCollapsedNestedKeys((prev) => {
        const next = new Set(prev);
        for (const k of prev) {
          if (k.startsWith(`${rowKey}::`)) next.delete(k);
        }
        return next;
      });
    } else {
      setExpandedCategoryKeys((prev) => new Set(prev).add(rowKey));
      setCollapsedNestedKeys((prev) => {
        const next = new Set(prev);
        for (const nk of collectNestedNodeKeysForRow(item, cls, rowKey)) next.add(nk);
        return next;
      });
    }
  };

  const toggleNestedCollapsed = (nestedKey: string) => {
    setCollapsedNestedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(nestedKey)) next.delete(nestedKey);
      else next.add(nestedKey);
      return next;
    });
  };

  const riskBadgeClass = (risk: string) => {
    if (risk === "High") return "bg-red-100 text-red-800";
    if (risk === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };
  const formatCategoryLabel = (label: string) =>
    tableClassification === "HS" ? `HS ${label}` : label;

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

  const handleExportCountryToggle = (country: string) => {
    if (country === "All Countries") {
      setExportSelectedCountries(["All Countries"]);
    } else {
      const newSelection = exportSelectedCountries.includes(country)
        ? exportSelectedCountries.filter(c => c !== country)
        : [...exportSelectedCountries.filter(c => c !== "All Countries"), country];
      setExportSelectedCountries(newSelection.length > 0 ? newSelection : ["All Countries"]);
    }
  };

  const handleImportCountryToggle = (country: string) => {
    if (country === "All Countries") {
      setImportSelectedCountries(["All Countries"]);
    } else {
      const newSelection = importSelectedCountries.includes(country)
        ? importSelectedCountries.filter(c => c !== country)
        : [...importSelectedCountries.filter(c => c !== "All Countries"), country];
      setImportSelectedCountries(newSelection.length > 0 ? newSelection : ["All Countries"]);
    }
  };

  const handleTableCountryToggle = (country: string) => {
    if (country === "All Countries") {
      setTableSelectedCountries(["All Countries"]);
    } else {
      const newSelection = tableSelectedCountries.includes(country)
        ? tableSelectedCountries.filter(c => c !== country)
        : [...tableSelectedCountries.filter(c => c !== "All Countries"), country];
      setTableSelectedCountries(newSelection.length > 0 ? newSelection : ["All Countries"]);
    }
  };

  const topExportCategories = [
    { category: "Aluminum & Articles", value: 8.2, change: "+32.8%" },
    { category: "Precious Stones/Metals", value: 7.5, change: "+45.2%" },
    { category: "Plastics & Articles", value: 4.8, change: "+2.1%" },
    { category: "Iron & Steel", value: 4.2, change: "+1.5%" },
    { category: "Organic Chemicals", value: 3.9, change: "+8.5%" },
  ];

  const topImportCategories = [
    { category: "Vehicles & Parts", value: 12.3, change: "+18.5%" },
    { category: "Electrical Machinery", value: 9.5, change: "+12.3%" },
    { category: "Nuclear Reactors", value: 8.2, change: "+8.5%" },
    { category: "Pharmaceutical Products", value: 5.8, change: "+12.3%" },
    { category: "Plastics & Articles", value: 5.2, change: "+2.8%" },
  ];

  const exportTableData = [
    { category: "Aluminum & Articles", mom: "+32.8%", yoy: "+45.2%", volume: "8.2B AED" },
    { category: "Precious Stones/Metals", mom: "+45.2%", yoy: "+58.3%", volume: "7.5B AED" },
    { category: "Plastics & Articles", mom: "+2.1%", yoy: "+8.5%", volume: "4.8B AED" },
    { category: "Iron & Steel", mom: "+1.5%", yoy: "+4.2%", volume: "4.2B AED" },
    { category: "Organic Chemicals", mom: "+8.5%", yoy: "+12.1%", volume: "3.9B AED" },
  ];

  const importTableData = [
    { category: "Vehicles & Parts", mom: "-18.5%", yoy: "-8.2%", volume: "12.3B AED" },
    { category: "Electrical Machinery", mom: "-12.3%", yoy: "+5.8%", volume: "9.5B AED" },
    { category: "Nuclear Reactors", mom: "+8.5%", yoy: "+15.3%", volume: "8.2B AED" },
    { category: "Pharmaceutical Products", mom: "-12.3%", yoy: "+3.5%", volume: "5.8B AED" },
    { category: "Plastics & Articles", mom: "+2.8%", yoy: "+6.2%", volume: "5.2B AED" },
  ];

  const filteredCategoriesData = useMemo(() => {
    const cls = tableClassification as ClassificationKind;
    return categoryAnalysisRowsForClassification(cls).filter((item) => {
      if (tableTradeType !== "all" && item.type !== tableTradeType) return false;
      if (!categoryAnalysisRowMatchesSearch(item, cls, categoryAnalysisSearch)) return false;
      return true;
    });
  }, [tableTradeType, categoryAnalysisSearch, tableClassification]);

  const collapseAllCategoryRows = () => {
    setExpandedCategoryKeys(new Set());
    setCollapsedNestedKeys(new Set());
  };

  const hasExpandedCategoryRows = expandedCategoryKeys.size > 0;

  const tradePartners = [
    { country: "China", value: 22.5, color: "#ef4444" },
    { country: "India", value: 18.3, color: "#f59e0b" },
    { country: "USA", value: 12.8, color: "#3b82f6" },
    { country: "Saudi Arabia", value: 10.2, color: "#10b981" },
    { country: "Others", value: 36.2, color: "#94a3b8" },
  ];

  const monthlyTrend = [
    { month: "Oct", imports: 48.2, exports: 26.5, reexports: 28.3 },
    { month: "Nov", imports: 46.8, exports: 27.1, reexports: 29.2 },
    { month: "Dec", imports: 47.5, exports: 25.8, reexports: 30.5 },
    { month: "Jan", imports: 48.9, exports: 28.2, reexports: 31.2 },
    { month: "Feb", imports: 47.2, exports: 29.1, reexports: 30.8 },
    { month: "Mar", imports: 45.2, exports: 28.7, reexports: 31.5 },
    { month: "Apr", imports: 46.5, exports: 30.2, reexports: 32.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FlippableCard
          icon={<SectionIcon icon={Package} tone="blue" />}
          label="Total Trade Volume"
          value="AED 105.4B"
          change="↑ 4.2% MoM"
          subtitle="Active countries"
          unit="billions AED"
          insight="Total trade volume increased by 4.2% month-over-month, driven by strong export performance and stable re-export activity. This growth reflects healthy trade dynamics across all categories."
        />

        <FlippableCard
          icon={<SectionIcon icon={Globe} tone="green" />}
          label="Trade Partners"
          value="142"
          change="Active countries"
          subtitle=""
          unit="countries"
          insight="Abu Dhabi maintains active trade relationships with 142 countries globally, demonstrating strong international connectivity and diversified trade portfolio across regions."
        />

        <FlippableCard
          icon={<SectionIcon icon={TrendingUp} tone="purple" />}
          label="Export Growth"
          value="+12.3%"
          change="Above target"
          subtitle=""
          unit="percentage change"
          insight="Export growth of 12.3% exceeds targets, driven by aluminum and precious metals. This performance indicates strong competitiveness in global markets."
        />

        <FlippableCard
          icon={<SectionIcon icon={AlertCircle} tone="yellow" />}
          label="Trade Balance"
          value="AED 15.0B"
          change="↑ 18.5% MoM"
          subtitle=""
          unit="billions AED"
          insight="The trade balance improved by 18.5% month-over-month, reaching AED 15.0B, reflecting strong export performance and controlled import levels."
        />
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SectionIcon icon={Activity} tone="slate" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Monthly Trade Trend</h3>
              <p className="text-xs text-gray-500 mt-1">All amounts displayed in billions AED</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between text-sm">
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
                          id={country}
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => handleCountryToggle(country)}
                        />
                        <label
                          htmlFor={country}
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
              <label className="text-xs font-medium text-gray-700 mb-1 block">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[120px]">
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
                <SelectTrigger className="w-[100px]">
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
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" key="grid" />
            <XAxis dataKey="month" key="xaxis" />
            <YAxis label={{ value: 'AED Billions', angle: -90, position: 'insideLeft' }} key="yaxis" />
            <Tooltip
              key="tooltip"
              formatter={(value: number) => `${value.toFixed(1)}B AED`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
            />
            <Legend key="legend" />
            <Line
              type="monotone"
              dataKey="imports"
              stroke="#ef4444"
              strokeWidth={2}
              name="Non-Oil Imports"
              key="line-imports"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="exports"
              stroke="#10b981"
              strokeWidth={2}
              name="Non-Oil Exports"
              key="line-exports"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="reexports"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Non-Oil Re-Exports"
              key="line-reexports"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Export Categories */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SectionIcon icon={TrendingUp} tone="green" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Top Export Categories</h3>
                <p className="text-xs text-gray-500 mt-1">All amounts displayed in billions AED</p>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[160px] justify-between text-sm">
                      {exportSelectedCountries.length === 1
                        ? exportSelectedCountries[0]
                        : `${exportSelectedCountries.length} countries selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-3">
                    <div className="space-y-2">
                      {countries.map((country) => (
                        <div key={`export-top-${country}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`export-top-${country}`}
                            checked={exportSelectedCountries.includes(country)}
                            onCheckedChange={() => handleExportCountryToggle(country)}
                          />
                          <label
                            htmlFor={`export-top-${country}`}
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
                <Select value={exportClassification} onValueChange={setExportClassification}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HS">HS</SelectItem>
                    <SelectItem value="BEC">BEC</SelectItem>
                    <SelectItem value="SITC">SITC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={exportMonth} onValueChange={setExportMonth}>
                  <SelectTrigger className="w-[110px]">
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
                <Select value={exportYear} onValueChange={setExportYear}>
                  <SelectTrigger className="w-[90px]">
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
          <div className="space-y-4">
            {topExportCategories.map((item, index) => {
              const isPositive = item.change.startsWith("+");
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{item.category}</div>
                    <div className="text-xs text-gray-500 mt-0.5">AED {item.value}B</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isPositive ? "bg-green-600" : "bg-red-600"}`}
                        style={{ width: `${(item.value / 10) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Import Categories */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SectionIcon icon={Package} tone="red" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Top Import Categories</h3>
                <p className="text-xs text-gray-500 mt-1">All amounts displayed in billions AED</p>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[160px] justify-between text-sm">
                      {importSelectedCountries.length === 1
                        ? importSelectedCountries[0]
                        : `${importSelectedCountries.length} countries selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-3">
                    <div className="space-y-2">
                      {countries.map((country) => (
                        <div key={`import-top-${country}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`import-top-${country}`}
                            checked={importSelectedCountries.includes(country)}
                            onCheckedChange={() => handleImportCountryToggle(country)}
                          />
                          <label
                            htmlFor={`import-top-${country}`}
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
                <Select value={importClassification} onValueChange={setImportClassification}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HS">HS</SelectItem>
                    <SelectItem value="BEC">BEC</SelectItem>
                    <SelectItem value="SITC">SITC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={importMonth} onValueChange={setImportMonth}>
                  <SelectTrigger className="w-[110px]">
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
                <Select value={importYear} onValueChange={setImportYear}>
                  <SelectTrigger className="w-[90px]">
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
          <div className="space-y-4">
            {topImportCategories.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{item.category}</div>
                  <div className="text-xs text-gray-500 mt-0.5">AED {item.value}B</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${(item.value / 15) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-600">{item.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Analysis Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SectionIcon icon={BarChart3} tone="slate" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Categories Analysis</h3>
                <p className="text-xs text-gray-500 mt-1">Detailed breakdown of trade categories</p>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-full min-w-0 sm:w-56 sm:min-w-[14rem]">
                <label className="text-xs font-medium text-gray-700 mb-1 block" htmlFor="category-analysis-search">
                  Search
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                  <Input
                    id="category-analysis-search"
                    type="search"
                    placeholder="Search main row and expanded classification lines…"
                    value={categoryAnalysisSearch}
                    onChange={(e) => setCategoryAnalysisSearch(e.target.value)}
                    className="h-9 pl-8 text-sm"
                    aria-label="Search categories in the analysis table"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Trade Type</label>
                <Select value={tableTradeType} onValueChange={setTableTradeType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="import">Import</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Classification</label>
                <Select value={tableClassification} onValueChange={setTableClassification}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HS">HS</SelectItem>
                    <SelectItem value="BEC">BEC</SelectItem>
                    <SelectItem value="SITC">SITC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-between text-sm">
                      {tableSelectedCountries.length === 1
                        ? tableSelectedCountries[0]
                        : `${tableSelectedCountries.length} selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-3">
                    <div className="space-y-2">
                      {countries.map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox
                            id={`table-${country}`}
                            checked={tableSelectedCountries.includes(country)}
                            onCheckedChange={() => handleTableCountryToggle(country)}
                          />
                          <label
                            htmlFor={`table-${country}`}
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
                <label className="text-xs font-medium text-gray-700 mb-1 block">Month</label>
                <Select value={tableMonth} onValueChange={setTableMonth}>
                  <SelectTrigger className="w-[110px]">
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
                <Select value={tableYear} onValueChange={setTableYear}>
                  <SelectTrigger className="w-[90px]">
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 p-2">
                <span className="sr-only">Expand classification articles</span>
              </TableHead>
              <TableHead className="w-[28%]">Category</TableHead>
              <TableHead className="w-[12%]">Risk</TableHead>
              <TableHead className="w-[10%] text-right">Weight</TableHead>
              <TableHead className="w-[10%] text-right">M/M %</TableHead>
              <TableHead className="w-[10%] text-right">Y/Y %</TableHead>
              <TableHead className="w-[12%] text-right">Total Trade Volume</TableHead>
              <TableHead className="w-[8%] p-2 text-right align-bottom">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 px-2.5"
                  onClick={collapseAllCategoryRows}
                  disabled={!hasExpandedCategoryRows}
                  aria-label="Collapse all category rows"
                >
                  Collapse all
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategoriesData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-gray-500"
                >
                  No categories match your search. Try a different term or clear the search.
                </TableCell>
              </TableRow>
            ) : null}
            {filteredCategoriesData.map((item, index) => {
              const cls = tableClassification as ClassificationKind;
              const displayRows = classificationArticleDisplayRows(item, cls);
              const rowKey = `${cls}-${item.type}-${item.category}-${index}`;
              const visibleNestedRows = getVisibleNestedClassificationRows(
                displayRows,
                rowKey,
                collapsedNestedKeys,
              );
              const momPositive = item.mom.startsWith("+");
              const yoyPositive = item.yoy.startsWith("+");
              const isExpanded = expandedCategoryKeys.has(rowKey);
              const qs = new URLSearchParams({ cls: tableClassification });
              const goToCategoryDetail = () => {
                navigate(`/observe/category/${encodeURIComponent(item.category)}?${qs.toString()}`);
              };
              const goToArticle = (label: string) => {
                navigate(
                  `/observe/category/${encodeURIComponent(item.category)}/article/${encodeURIComponent(label)}?${qs.toString()}`,
                );
              };
              const changeClass = (v: string) =>
                v.startsWith("+") ? "text-green-600" : v.startsWith("-") ? "text-red-600" : "text-gray-600";

              return (
                <Fragment key={rowKey}>
                  <TableRow className="hover:bg-gray-50/80">
                    <TableCell className="w-10 p-1 align-middle">
                      {displayRows.length > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Hide classification details" : "Show classification details"}
                          onClick={() => toggleCategoryExpanded(rowKey, item)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{formatCategoryLabel(item.category)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskBadgeClass(
                          item.risk
                        )}`}
                      >
                        {item.risk}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.weight}</TableCell>
                    <TableCell className={`text-right font-medium tabular-nums ${momPositive ? "text-green-600" : "text-red-600"}`}>
                      {item.mom}
                    </TableCell>
                    <TableCell className={`text-right font-medium tabular-nums ${yoyPositive ? "text-green-600" : "text-red-600"}`}>
                      {item.yoy}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.volume}</TableCell>
                    <TableCell className="p-2 w-[8%] text-right align-middle">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-auto text-gray-400 hover:text-slate-800 hover:bg-slate-100"
                        onClick={goToCategoryDetail}
                        aria-label={`Open details for ${item.category}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded &&
                    visibleNestedRows.map((nestedEntry) => {
                      const row = nestedEntry.row;
                      const nestedKey = nestedEntry.nestedKey;
                      const depthPad = [
                        "pl-6",
                        "pl-10",
                        "pl-14",
                        "pl-[4.25rem]",
                        "pl-20",
                        "pl-24",
                      ] as const;
                      const padClass = depthPad[Math.min(row.depth, depthPad.length - 1)];

                      if (row.kind === "node") {
                        const nestedCollapsed = collapsedNestedKeys.has(nestedKey);
                        return (
                          <TableRow
                            key={`${rowKey}-hdr-${nestedKey}`}
                            className="cursor-pointer bg-slate-50/50 hover:bg-slate-100/80"
                            onClick={() => toggleNestedCollapsed(nestedKey)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleNestedCollapsed(nestedKey);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={!nestedCollapsed}
                            aria-label={nestedCollapsed ? "Expand nested rows" : "Collapse nested rows"}
                          >
                            <TableCell className="w-10 p-1 align-middle" aria-hidden>
                              <div className="inline-flex h-8 w-8 items-center justify-center text-slate-600">
                                {nestedCollapsed ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell colSpan={7} className={`${padClass} py-2`}>
                              <span className="text-sm font-semibold text-slate-700">{formatCategoryLabel(row.label)}</span>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      const article = row.metric;
                      return (
                        <TableRow
                          key={`${rowKey}-${nestedKey}-${article.label}`}
                          className="cursor-pointer bg-slate-50/80 hover:bg-slate-100/90"
                          onClick={() => goToArticle(article.label)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              goToArticle(article.label);
                            }
                          }}
                          role="link"
                          tabIndex={0}
                        >
                          <TableCell />
                          <TableCell className={`${padClass} text-sm text-gray-800 font-medium`}>
                            {formatCategoryLabel(article.label)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskBadgeClass(
                                article.risk
                              )}`}
                            >
                              {article.risk}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{article.weight}</TableCell>
                          <TableCell className={`text-right text-sm font-medium tabular-nums ${changeClass(article.mom)}`}>
                            {article.mom}
                          </TableCell>
                          <TableCell className={`text-right text-sm font-medium tabular-nums ${changeClass(article.yoy)}`}>
                            {article.yoy}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-500">—</TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}