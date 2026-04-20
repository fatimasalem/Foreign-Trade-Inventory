import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, Globe, TrendingUp, AlertCircle, Lightbulb, Activity, ChevronRight, ChevronDown, BarChart3 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { SectionIcon } from "../components/section-icon";

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
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Set<string>>(() => new Set());

  const countries = ["All Countries", "China", "India", "USA", "Saudi Arabia"];

  const toggleCategoryExpanded = (key: string) => {
    setExpandedCategoryKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const riskBadgeClass = (risk: string) => {
    if (risk === "High") return "bg-red-100 text-red-800";
    if (risk === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

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
    { category: "Vehicles & Parts", value: 12.3, change: "-18.5%" },
    { category: "Electrical Machinery", value: 9.5, change: "-12.3%" },
    { category: "Nuclear Reactors", value: 8.2, change: "+8.5%" },
    { category: "Pharmaceutical Products", value: 5.8, change: "-12.3%" },
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

  const allCategoriesData = [
    {
      category: "Aluminum & Articles",
      mom: "+32.8%",
      yoy: "+45.2%",
      volume: "8.2B AED",
      type: "export" as const,
      risk: "High",
      weight: "18.5%",
      hsArticles: [
        { label: "HS7601 — Unwrought aluminum", risk: "High" as const, weight: "6.1%", mom: "+30.2%", yoy: "+42.0%" },
        { label: "HS7604 — Aluminum bars, profiles", risk: "Medium" as const, weight: "5.4%", mom: "+35.1%", yoy: "+48.2%" },
        { label: "HS7616 — Other articles of aluminum", risk: "Medium" as const, weight: "7.0%", mom: "+33.0%", yoy: "+46.0%" },
      ],
    },
    {
      category: "Precious Stones/Metals",
      mom: "+45.2%",
      yoy: "+58.3%",
      volume: "7.5B AED",
      type: "export" as const,
      risk: "High",
      weight: "16.2%",
      hsArticles: [
        { label: "HS7108 — Gold", risk: "High" as const, weight: "8.8%", mom: "+48.0%", yoy: "+62.0%" },
        { label: "HS7113 — Articles of jewelry", risk: "High" as const, weight: "4.9%", mom: "+42.5%", yoy: "+55.0%" },
        { label: "HS7118 — Coin", risk: "Medium" as const, weight: "2.5%", mom: "+40.0%", yoy: "+52.0%" },
      ],
    },
    {
      category: "Plastics & Articles",
      mom: "+2.1%",
      yoy: "+8.5%",
      volume: "4.8B AED",
      type: "export" as const,
      risk: "Low",
      weight: "9.8%",
      hsArticles: [
        { label: "HS3901 — Polymers of ethylene", risk: "Low" as const, weight: "3.6%", mom: "+1.8%", yoy: "+7.2%" },
        { label: "HS3920 — Plates, sheets of plastics", risk: "Low" as const, weight: "3.2%", mom: "+2.5%", yoy: "+9.0%" },
        { label: "HS3926 — Other articles of plastics", risk: "Low" as const, weight: "3.0%", mom: "+2.0%", yoy: "+9.2%" },
      ],
    },
    {
      category: "Iron & Steel",
      mom: "+1.5%",
      yoy: "+4.2%",
      volume: "4.2B AED",
      type: "export" as const,
      risk: "Low",
      weight: "8.5%",
      hsArticles: [
        { label: "HS7208 — Flat-rolled products", risk: "Low" as const, weight: "3.1%", mom: "+1.2%", yoy: "+3.8%" },
        { label: "HS7214 — Bars and rods", risk: "Low" as const, weight: "2.7%", mom: "+1.8%", yoy: "+4.5%" },
        { label: "HS7308 — Structures and parts", risk: "Low" as const, weight: "2.7%", mom: "+1.5%", yoy: "+4.4%" },
      ],
    },
    {
      category: "Organic Chemicals",
      mom: "+8.5%",
      yoy: "+12.1%",
      volume: "3.9B AED",
      type: "export" as const,
      risk: "Medium",
      weight: "7.9%",
      hsArticles: [
        { label: "HS2901 — Acyclic hydrocarbons", risk: "Medium" as const, weight: "2.6%", mom: "+7.0%", yoy: "+11.0%" },
        { label: "HS2915 — Saturated acyclic monocarboxylic acids", risk: "Medium" as const, weight: "2.5%", mom: "+9.0%", yoy: "+12.5%" },
        { label: "HS2933 — Heterocyclic compounds", risk: "Medium" as const, weight: "2.8%", mom: "+9.5%", yoy: "+12.8%" },
      ],
    },
    {
      category: "Vehicles & Parts",
      mom: "-18.5%",
      yoy: "-8.2%",
      volume: "12.3B AED",
      type: "import" as const,
      risk: "High",
      weight: "22.4%",
      hsArticles: [
        { label: "HS8703 — Motor cars and vehicles", risk: "High" as const, weight: "10.2%", mom: "-20.0%", yoy: "-10.0%" },
        { label: "HS8708 — Parts of motor vehicles", risk: "High" as const, weight: "8.1%", mom: "-17.0%", yoy: "-7.5%" },
        { label: "HS8714 — Parts of cycles", risk: "Medium" as const, weight: "4.1%", mom: "-15.0%", yoy: "-5.0%" },
      ],
    },
    {
      category: "Electrical Machinery",
      mom: "-12.3%",
      yoy: "+5.8%",
      volume: "9.5B AED",
      type: "import" as const,
      risk: "Medium",
      weight: "17.3%",
      hsArticles: [
        { label: "HS8504 — Electrical transformers", risk: "Medium" as const, weight: "5.8%", mom: "-11.0%", yoy: "+4.0%" },
        { label: "HS8517 — Telephone sets", risk: "Medium" as const, weight: "6.2%", mom: "-13.5%", yoy: "+6.0%" },
        { label: "HS8544 — Insulated electric conductors", risk: "Medium" as const, weight: "5.3%", mom: "-12.0%", yoy: "+7.0%" },
      ],
    },
    {
      category: "Nuclear Reactors",
      mom: "+8.5%",
      yoy: "+15.3%",
      volume: "8.2B AED",
      type: "import" as const,
      risk: "Medium",
      weight: "14.9%",
      hsArticles: [
        { label: "HS8401 — Nuclear reactors; machinery", risk: "Medium" as const, weight: "5.5%", mom: "+7.0%", yoy: "+14.0%" },
        { label: "HS8413 — Pumps for liquids", risk: "Medium" as const, weight: "4.7%", mom: "+9.0%", yoy: "+16.0%" },
        { label: "HS8481 — Taps, cocks, valves", risk: "Low" as const, weight: "4.7%", mom: "+9.5%", yoy: "+16.0%" },
      ],
    },
    {
      category: "Pharmaceutical Products",
      mom: "-12.3%",
      yoy: "+3.5%",
      volume: "5.8B AED",
      type: "import" as const,
      risk: "Medium",
      weight: "10.5%",
      hsArticles: [
        { label: "HS3002 — Human blood; vaccines", risk: "Medium" as const, weight: "3.8%", mom: "-11.0%", yoy: "+2.0%" },
        { label: "HS3004 — Medicaments", risk: "Medium" as const, weight: "4.2%", mom: "-13.0%", yoy: "+4.0%" },
        { label: "HS3006 — Pharmaceutical goods", risk: "Low" as const, weight: "2.5%", mom: "-12.5%", yoy: "+4.5%" },
      ],
    },
    {
      category: "Plastics & Articles",
      mom: "+2.8%",
      yoy: "+6.2%",
      volume: "5.2B AED",
      type: "import" as const,
      risk: "Low",
      weight: "9.4%",
      hsArticles: [
        { label: "HS3901 — Polymers of ethylene", risk: "Low" as const, weight: "3.4%", mom: "+2.5%", yoy: "+5.8%" },
        { label: "HS3907 — Polyacetals, epoxide resins", risk: "Low" as const, weight: "2.9%", mom: "+3.0%", yoy: "+6.5%" },
        { label: "HS3923 — Articles for conveyance of goods", risk: "Low" as const, weight: "3.1%", mom: "+3.0%", yoy: "+6.2%" },
      ],
    },
  ];

  const filteredCategoriesData = useMemo(() => {
    return allCategoriesData.filter((item) => {
      if (tableTradeType !== "all" && item.type !== tableTradeType) return false;
      return true;
    });
  }, [tableTradeType]);

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
            {topImportCategories.map((item, index) => {
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
                        className={`h-2 rounded-full ${isPositive ? "bg-green-600" : "bg-amber-600"}`}
                        style={{ width: `${(item.value / 15) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isPositive ? "text-green-600" : "text-amber-700"
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
            <div className="flex gap-2">
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
                <span className="sr-only">Expand HS articles</span>
              </TableHead>
              <TableHead className="w-[28%]">Category</TableHead>
              <TableHead className="w-[12%]">Risk</TableHead>
              <TableHead className="w-[10%] text-right">Weight</TableHead>
              <TableHead className="w-[10%] text-right">M/M %</TableHead>
              <TableHead className="w-[10%] text-right">Y/Y %</TableHead>
              <TableHead className="w-[12%] text-right">Total Trade Volume</TableHead>
              <TableHead className="w-[8%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategoriesData.map((item, index) => {
              const rowKey = `${item.type}-${item.category}-${index}`;
              const momPositive = item.mom.startsWith("+");
              const yoyPositive = item.yoy.startsWith("+");
              const showHsExpand = tableClassification === "HS";
              const isExpanded = showHsExpand && expandedCategoryKeys.has(rowKey);
              const goToCategoryDetail = () => {
                navigate(`/observe/category/${encodeURIComponent(item.category)}`);
              };
              const goToHsArticle = (label: string) => {
                navigate(`/observe/category/${encodeURIComponent(label)}`);
              };
              const changeClass = (v: string) =>
                v.startsWith("+") ? "text-green-600" : v.startsWith("-") ? "text-red-600" : "text-gray-600";

              return (
                <Fragment key={rowKey}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={goToCategoryDetail}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToCategoryDetail();
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <TableCell
                      className="w-10 p-1 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {showHsExpand ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Hide HS articles" : "Show HS articles"}
                          onClick={() => toggleCategoryExpanded(rowKey)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-medium">{item.category}</TableCell>
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
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </TableCell>
                  </TableRow>
                  {showHsExpand &&
                    isExpanded &&
                    item.hsArticles.map((article) => (
                      <TableRow
                        key={article.label}
                        className="cursor-pointer bg-slate-50/80 hover:bg-slate-100/90"
                        onClick={() => goToHsArticle(article.label)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToHsArticle(article.label);
                          }
                        }}
                        role="link"
                        tabIndex={0}
                      >
                        <TableCell />
                        <TableCell className="pl-8 text-sm text-gray-800 font-medium">
                          {article.label}
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
                    ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}