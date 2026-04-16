import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TrendingUp, ArrowUpRight, Target, Anchor, Globe, Ship } from "lucide-react";
import { SectionIcon } from "../components/section-icon";

type ComparisonRegion = "gcc" | "global";
type ComparisonCategory = "imports" | "exports" | "reexports" | "nettrade";
type TradeType = "air" | "sea" | "land";
type HSCategory = "all" | "HS71" | "HS87" | "HS76" | "HS84" | "HS39";

export function BenchmarkPage() {
  const [region, setRegion] = useState<ComparisonRegion>("gcc");
  const [category, setCategory] = useState<ComparisonCategory>("exports");
  const [year, setYear] = useState("2026");
  const [tradeType, setTradeType] = useState<TradeType>("sea");
  const [hsCategory, setHSCategory] = useState<HSCategory>("all");
  const [portsHSCategory, setPortsHSCategory] = useState<HSCategory>("all");

  const gccData = [
    { country: "Saudi Arabia", value: 44.2 },
    { country: "Abu Dhabi", value: 28.7 },
    { country: "Qatar", value: 26.5 },
    { country: "Kuwait", value: 19.2 },
    { country: "Oman", value: 13.1 },
    { country: "Bahrain", value: 8.7 },
  ];

  const globalData = [
    { country: "Singapore", value: 50.1 },
    { country: "Hong Kong", value: 54.2 },
    { country: "London", value: 39.5 },
    { country: "Dubai", value: 36.5 },
    { country: "Abu Dhabi", value: 28.7 },
  ];

  const portsData = [
    { port: "Zayed Port", value: 12.5 },
    { port: "Musaffah Port", value: 8.2 },
    { port: "Delma Port", value: 5.3 },
    { port: "Al Sila Port", value: 6.8 },
    { port: "Al Mirfa Port", value: 4.7 },
    { port: "Shahama Port", value: 3.2 },
  ];

  const data = region === "gcc" ? gccData : globalData;

  const insights = region === "gcc" ? [
    {
      title: "Top Trade Partner",
      value: "Saudi Arabia",
      description: "Leading trade partner with Abu Dhabi Emirate in the GCC region",
      icon: Target,
    },
    {
      title: "Growth Rate",
      value: "+12.3%",
      description: "Outpacing GCC average growth of 8.5% in Q1 2026",
      icon: TrendingUp,
    },
    {
      title: "Market Share",
      value: "18.2%",
      description: "Abu Dhabi's share of total GCC non-oil export market",
      icon: ArrowUpRight,
    },
  ] : [
    {
      title: "Top Trade Partner",
      value: "China",
      description: "Leading trade partner with Abu Dhabi Emirate globally",
      icon: Target,
    },
    {
      title: "Competitive Gap",
      value: "42% of Singapore",
      description: "Export volume relative to leading global trade hub Singapore",
      icon: TrendingUp,
    },
    {
      title: "Growth Momentum",
      value: "+12.3%",
      description: "Above global average growth rate of 6.8%",
      icon: ArrowUpRight,
    },
  ];

  const portsInsights = [
    {
      title: "Leading Port",
      value: "Zayed Port",
      description: "Major commercial port with extensive facilities for general and bulk cargo",
      icon: Anchor,
    },
    {
      title: "Port Growth",
      value: "+18.5%",
      description: "Abu Dhabi ports showing strong growth in cargo handling capacity",
      icon: TrendingUp,
    },
    {
      title: "Trade Distribution",
      value: `${tradeType === 'sea' ? '65%' : tradeType === 'air' ? '25%' : '10%'}`,
      description: `${tradeType === 'sea' ? 'Sea' : tradeType === 'air' ? 'Air' : 'Land'} trade share of total Abu Dhabi trade`,
      icon: ArrowUpRight,
    },
  ];

  const categoryLabel = {
    imports: "Non-Oil Imports",
    exports: "Non-Oil Exports",
    reexports: "Non-Oil Re-Exports",
    nettrade: "Net Trade",
  }[category];

  return (
    <div className="space-y-6">
      {/* Country/Region Comparison Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <SectionIcon icon={Globe} tone="slate" />
          <h2 className="font-semibold text-lg text-gray-900">Trade Countries Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Region</label>
            <Select value={region} onValueChange={(value) => setRegion(value as ComparisonRegion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gcc">GCC Countries</SelectItem>
                <SelectItem value="global">Global Countries</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Comparison Category</label>
            <Select value={category} onValueChange={(value) => setCategory(value as ComparisonCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imports">Non-Oil Imports</SelectItem>
                <SelectItem value="exports">Non-Oil Exports</SelectItem>
                <SelectItem value="reexports">Non-Oil Re-Exports</SelectItem>
                <SelectItem value="nettrade">Net Trade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">HS Category</label>
            <Select value={hsCategory} onValueChange={(value) => setHSCategory(value as HSCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="HS71">HS71 - Precious stones/metals</SelectItem>
                <SelectItem value="HS87">HS87 - Vehicles & parts</SelectItem>
                <SelectItem value="HS76">HS76 - Aluminum & articles</SelectItem>
                <SelectItem value="HS84">HS84 - Machinery</SelectItem>
                <SelectItem value="HS39">HS39 - Plastics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <h3 className="font-medium text-gray-900 mb-4">{categoryLabel} {hsCategory !== 'all' ? `- ${hsCategory}` : ''}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" key="grid-countries" />
                <XAxis type="number" label={{ value: 'AED Billions', position: 'bottom' }} key="xaxis-countries" />
                <YAxis dataKey="country" type="category" width={120} key="yaxis-countries" />
                <Tooltip key="tooltip-countries" />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} key="bar-countries" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Key Insights</h3>
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <SectionIcon icon={Icon} tone="blue" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">{insight.title}</div>
                      <div className="text-xl font-semibold text-gray-900 mb-1">{insight.value}</div>
                      <div className="text-xs text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* UAE Ports Comparison Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <SectionIcon icon={Ship} tone="slate" />
          <h2 className="font-semibold text-lg text-gray-900">Abu Dhabi Ports Comparison</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Trade Type</label>
            <Select value={tradeType} onValueChange={(value) => setTradeType(value as TradeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sea">Sea</SelectItem>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Comparison Category</label>
            <Select value={category} onValueChange={(value) => setCategory(value as ComparisonCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imports">Non-Oil Imports</SelectItem>
                <SelectItem value="exports">Non-Oil Exports</SelectItem>
                <SelectItem value="reexports">Non-Oil Re-Exports</SelectItem>
                <SelectItem value="nettrade">Net Trade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">HS Category</label>
            <Select value={portsHSCategory} onValueChange={(value) => setPortsHSCategory(value as HSCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="HS71">HS71 - Precious stones/metals</SelectItem>
                <SelectItem value="HS87">HS87 - Vehicles & parts</SelectItem>
                <SelectItem value="HS76">HS76 - Aluminum & articles</SelectItem>
                <SelectItem value="HS84">HS84 - Machinery</SelectItem>
                <SelectItem value="HS39">HS39 - Plastics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <h3 className="font-medium text-gray-900 mb-4">{tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} {portsHSCategory !== 'all' ? `- ${portsHSCategory}` : ''}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={portsData}>
                <CartesianGrid strokeDasharray="3 3" key="grid-ports" />
                <XAxis dataKey="port" key="xaxis-ports" />
                <YAxis label={{ value: 'AED Billions', angle: -90, position: 'insideLeft' }} key="yaxis-ports" />
                <Tooltip key="tooltip-ports" />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} key="bar-ports" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Port Insights</h3>
            {portsInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <SectionIcon icon={Icon} tone="green" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">{insight.title}</div>
                      <div className="text-xl font-semibold text-gray-900 mb-1">{insight.value}</div>
                      <div className="text-xs text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}