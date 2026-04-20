import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertTriangle, MessageSquare, TrendingUp, Anchor } from "lucide-react";
import { Badge } from "./ui/badge";
import { SectionIcon } from "./section-icon";
import { AbuDhabiTradeLeafletMap } from "./abu-dhabi-trade-leaflet-map";

type TradeFlowKey = "import" | "export" | "re-export";

interface PortTooltipData {
  name: string;
  imports: number;
  exports: number;
  reExports: number;
  netTrade: number;
  topCategories: {
    name: string;
    value: string;
  }[];
  affectedCategories: {
    name: string;
    impact: string;
  }[];
}

type PortDef = {
  id: string;
  name: string;
  /** [longitude, latitude] — Abu Dhabi coastline–aligned positions */
  coordinates: [number, number];
  /** Dominant mode for this facility (filters dim or hide when mismatched) */
  transport: "sea" | "land" | "air";
  affected: boolean;
};

export function UAETradeMap() {
  const navigate = useNavigate();
  const [foreignTradeType, setForeignTradeType] = useState("all");
  const [classification, setClassification] = useState("HS");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [transportType, setTransportType] = useState("all");
  const [selectedPort, setSelectedPort] = useState("all");
  const [tooltipContent, setTooltipContent] = useState<PortTooltipData | null>(null);

  // Check if it's from March 2026 and onwards for critical alert
  const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthIndex = monthOrder.indexOf(month);
  const marchIndex = monthOrder.indexOf("March");

  const isCritical = parseInt(year) > 2026 ||
                     (year === "2026" && currentMonthIndex >= marchIndex);

  const ports: PortDef[] = [
    { id: "zayed", name: "Zayed Port", coordinates: [54.37, 24.52], transport: "sea", affected: isCritical },
    { id: "musaffah", name: "Musaffah Port", coordinates: [54.48, 24.36], transport: "sea", affected: isCritical },
    { id: "delma", name: "Delma Port", coordinates: [52.32, 24.33], transport: "sea", affected: isCritical },
    { id: "alsila", name: "Al Sila Port", coordinates: [51.72, 24.08], transport: "sea", affected: isCritical },
    { id: "almirfa", name: "Al Mirfa Port", coordinates: [53.46, 24.1], transport: "sea", affected: isCritical },
    { id: "shahama", name: "Shahama Port", coordinates: [54.66, 24.41], transport: "sea", affected: isCritical },
    { id: "auh_cargo", name: "Abu Dhabi Airport Cargo", coordinates: [54.65, 24.43], transport: "air", affected: isCritical },
    { id: "ghweifat", name: "Al Ghuwaifat Land Border", coordinates: [52.56, 24.09], transport: "land", affected: isCritical },
  ];

  type CatRow = { hs: string; bec: string; sitc: string; value: string };

  const portTradeDataBase: Record<
    string,
    Omit<PortTooltipData, "topCategories"> & { topCategories: CatRow[] }
  > = {
    "Zayed Port": {
      name: "Zayed Port",
      imports: 8.5,
      exports: 12.3,
      reExports: 6.2,
      netTrade: 10.0,
      topCategories: [
        { hs: "HS76 - Aluminum & articles", bec: "BEC5 - Capital goods", sitc: "SITC68 - Non-ferrous metals", value: "3.2B AED" },
        { hs: "HS84 - Machinery", bec: "BEC5 - Capital goods", sitc: "SITC74 - General machinery", value: "2.8B AED" },
        { hs: "HS27 - Mineral fuels", bec: "BEC2 - Industrial supplies", sitc: "SITC33 - Petroleum products", value: "2.1B AED" },
      ],
      affectedCategories: [
        { name: "HS87 - Vehicles & parts", impact: "-35.2%" },
        { name: "HS84 - Machinery", impact: "-29.8%" },
        { name: "HS30 - Pharmaceutical products", impact: "-22.5%" },
      ],
    },
    "Musaffah Port": {
      name: "Musaffah Port",
      imports: 6.8,
      exports: 9.5,
      reExports: 4.3,
      netTrade: 7.0,
      topCategories: [
        { hs: "HS72 - Iron & steel", bec: "BEC2 - Industrial supplies", sitc: "SITC67 - Iron & steel", value: "2.5B AED" },
        { hs: "HS73 - Articles of iron/steel", bec: "BEC2 - Industrial supplies", sitc: "SITC69 - Metal manufactures", value: "2.0B AED" },
        { hs: "HS87 - Vehicles & parts", bec: "BEC4 - Transport equipment", sitc: "SITC78 - Road vehicles", value: "1.8B AED" },
      ],
      affectedCategories: [
        { name: "HS72 - Iron & steel", impact: "-28.3%" },
        { name: "HS87 - Vehicles & parts", impact: "-26.7%" },
        { name: "HS73 - Articles of iron/steel", impact: "-19.5%" },
      ],
    },
    "Delma Port": {
      name: "Delma Port",
      imports: 2.1,
      exports: 3.8,
      reExports: 1.5,
      netTrade: 3.2,
      topCategories: [
        { hs: "HS03 - Fish & seafood", bec: "BEC6 - Consumer goods", sitc: "SITC03 - Fish", value: "1.2B AED" },
        { hs: "HS27 - Mineral fuels", bec: "BEC2 - Industrial supplies", sitc: "SITC33 - Petroleum products", value: "0.9B AED" },
        { hs: "HS84 - Machinery", bec: "BEC5 - Capital goods", sitc: "SITC74 - General machinery", value: "0.7B AED" },
      ],
      affectedCategories: [
        { name: "HS27 - Mineral fuels", impact: "-18.2%" },
        { name: "HS84 - Machinery", impact: "-15.8%" },
        { name: "HS39 - Plastics", impact: "-12.3%" },
      ],
    },
    "Al Sila Port": {
      name: "Al Sila Port",
      imports: 1.8,
      exports: 2.5,
      reExports: 1.2,
      netTrade: 1.9,
      topCategories: [
        { hs: "HS27 - Mineral fuels", bec: "BEC2 - Industrial supplies", sitc: "SITC33 - Petroleum products", value: "0.8B AED" },
        { hs: "HS84 - Machinery", bec: "BEC5 - Capital goods", sitc: "SITC74 - General machinery", value: "0.6B AED" },
        { hs: "HS39 - Plastics", bec: "BEC2 - Industrial supplies", sitc: "SITC57 - Plastics", value: "0.5B AED" },
      ],
      affectedCategories: [
        { name: "HS27 - Mineral fuels", impact: "-24.5%" },
        { name: "HS84 - Machinery", impact: "-20.1%" },
        { name: "HS39 - Plastics", impact: "-16.8%" },
      ],
    },
    "Al Mirfa Port": {
      name: "Al Mirfa Port",
      imports: 1.5,
      exports: 2.2,
      reExports: 0.9,
      netTrade: 1.6,
      topCategories: [
        { hs: "HS76 - Aluminum & articles", bec: "BEC5 - Capital goods", sitc: "SITC68 - Non-ferrous metals", value: "0.7B AED" },
        { hs: "HS72 - Iron & steel", bec: "BEC2 - Industrial supplies", sitc: "SITC67 - Iron & steel", value: "0.5B AED" },
        { hs: "HS84 - Machinery", bec: "BEC5 - Capital goods", sitc: "SITC74 - General machinery", value: "0.4B AED" },
      ],
      affectedCategories: [
        { name: "HS76 - Aluminum & articles", impact: "-17.3%" },
        { name: "HS72 - Iron & steel", impact: "-14.6%" },
        { name: "HS84 - Machinery", impact: "-11.2%" },
      ],
    },
    "Shahama Port": {
      name: "Shahama Port",
      imports: 3.2,
      exports: 5.1,
      reExports: 2.4,
      netTrade: 4.3,
      topCategories: [
        { hs: "HS84 - Machinery", bec: "BEC5 - Capital goods", sitc: "SITC74 - General machinery", value: "1.5B AED" },
        { hs: "HS85 - Electrical machinery", bec: "BEC5 - Capital goods", sitc: "SITC77 - Electrical machinery", value: "1.2B AED" },
        { hs: "HS87 - Vehicles & parts", bec: "BEC4 - Transport equipment", sitc: "SITC78 - Road vehicles", value: "0.9B AED" },
      ],
      affectedCategories: [
        { name: "HS87 - Vehicles & parts", impact: "-31.8%" },
        { name: "HS84 - Machinery", impact: "-27.5%" },
        { name: "HS85 - Electrical machinery", impact: "-23.2%" },
      ],
    },
    "Abu Dhabi Airport Cargo": {
      name: "Abu Dhabi Airport Cargo",
      imports: 4.1,
      exports: 3.6,
      reExports: 5.8,
      netTrade: 2.1,
      topCategories: [
        { hs: "HS71 - Precious stones, metals", bec: "BEC6 - Consumer goods", sitc: "SITC97 - Gold", value: "2.4B AED" },
        { hs: "HS30 - Pharmaceutical products", bec: "BEC6 - Consumer goods", sitc: "SITC54 - Medicinal products", value: "1.1B AED" },
        { hs: "HS85 - Electrical machinery", bec: "BEC5 - Capital goods", sitc: "SITC77 - Electrical machinery", value: "0.9B AED" },
      ],
      affectedCategories: [
        { name: "HS30 - Pharmaceutical products", impact: "-14.1%" },
        { name: "HS85 - Electrical machinery", impact: "-11.4%" },
        { name: "HS71 - Precious stones, metals", impact: "-9.2%" },
      ],
    },
    "Al Ghuwaifat Land Border": {
      name: "Al Ghuwaifat Land Border",
      imports: 3.4,
      exports: 2.1,
      reExports: 0.6,
      netTrade: -0.7,
      topCategories: [
        { hs: "HS27 - Mineral fuels", bec: "BEC2 - Industrial supplies", sitc: "SITC33 - Petroleum products", value: "1.4B AED" },
        { hs: "HS87 - Vehicles & parts", bec: "BEC4 - Transport equipment", sitc: "SITC78 - Road vehicles", value: "0.8B AED" },
        { hs: "HS39 - Plastics", bec: "BEC2 - Industrial supplies", sitc: "SITC57 - Plastics", value: "0.5B AED" },
      ],
      affectedCategories: [
        { name: "HS27 - Mineral fuels", impact: "-21.0%" },
        { name: "HS87 - Vehicles & parts", impact: "-16.5%" },
        { name: "HS39 - Plastics", impact: "-10.8%" },
      ],
    },
  };

  const categoryLabel = (row: CatRow) => {
    switch (classification) {
      case "BEC":
        return row.bec;
      case "SITC":
        return row.sitc;
      default:
        return row.hs;
    }
  };

  const monthIndex = monthOrder.indexOf(month);
  const yearFactor = 1 + (2026 - parseInt(year, 10)) * 0.04 + monthIndex * 0.008;

  const applyFlowToTotals = (data: PortTooltipData, flow: string): PortTooltipData => {
    if (flow === "all") return data;
    const f = flow as TradeFlowKey;
    const imports = Number((data.imports * (f === "import" ? 1.06 : 0.94)).toFixed(2));
    const exports = Number((data.exports * (f === "export" ? 1.06 : 0.94)).toFixed(2));
    const reExports = Number((data.reExports * (f === "re-export" ? 1.06 : 0.94)).toFixed(2));
    const netTrade = Number(
      (data.netTrade * (f === "import" ? 0.94 : f === "export" ? 1.06 : f === "re-export" ? 1.05 : 1)).toFixed(2),
    );
    return { ...data, imports, exports, reExports, netTrade };
  };

  const buildTooltipPayload = (portName: string): PortTooltipData | null => {
    const base = portTradeDataBase[portName];
    if (!base) return null;
    const topCategories = base.topCategories.map((row) => ({
      name: categoryLabel(row),
      value: row.value,
    }));
    const raw: PortTooltipData = {
      ...base,
      topCategories,
      imports: Number((base.imports * yearFactor).toFixed(2)),
      exports: Number((base.exports * yearFactor).toFixed(2)),
      reExports: Number((base.reExports * yearFactor).toFixed(2)),
      netTrade: Number((base.netTrade * yearFactor).toFixed(2)),
    };
    return applyFlowToTotals(raw, foreignTradeType);
  };

  type SidebarTransport = "Sea" | "Air" | "Land";

  const affectedCategories = [
    {
      hs: "HS87 - Vehicles & parts",
      bec: "BEC4 - Transport equipment",
      sitc: "SITC78 - Road vehicles",
      tradeType: "Import" as const,
      transportType: "Sea" as SidebarTransport,
      impact: "High",
      value: "-32.5%",
    },
    {
      hs: "HS84 - Machinery",
      bec: "BEC5 - Capital goods",
      sitc: "SITC74 - General machinery",
      tradeType: "Import" as const,
      transportType: "Sea" as SidebarTransport,
      impact: "High",
      value: "-28.3%",
    },
    {
      hs: "HS30 - Pharmaceutical products",
      bec: "BEC6 - Consumer goods",
      sitc: "SITC54 - Medicinal products",
      tradeType: "Import" as const,
      transportType: "Air" as SidebarTransport,
      impact: "Medium",
      value: "-18.5%",
    },
    {
      hs: "HS27 - Mineral fuels",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC33 - Petroleum products",
      tradeType: "Import" as const,
      transportType: "Land" as SidebarTransport,
      impact: "Medium",
      value: "-12.1%",
    },
  ];

  const topPerformingCategories = [
    {
      hs: "HS76 - Aluminum & articles",
      bec: "BEC5 - Capital goods",
      sitc: "SITC68 - Non-ferrous metals",
      tradeType: "Export" as const,
      transportType: "Sea" as SidebarTransport,
      performance: "Excellent",
      value: "+45.8%",
      volume: "8.2B AED",
    },
    {
      hs: "HS71 - Precious metals",
      bec: "BEC6 - Consumer goods",
      sitc: "SITC97 - Gold, non-monetary",
      tradeType: "Export" as const,
      transportType: "Air" as SidebarTransport,
      performance: "Excellent",
      value: "+38.2%",
      volume: "7.5B AED",
    },
    {
      hs: "HS27 - Mineral fuels",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC33 - Petroleum products",
      tradeType: "Export" as const,
      transportType: "Sea" as SidebarTransport,
      performance: "Good",
      value: "+28.5%",
      volume: "6.8B AED",
    },
    {
      hs: "HS39 - Plastics, articles",
      bec: "BEC2 - Industrial supplies",
      sitc: "SITC57 - Plastics",
      tradeType: "Re-Export" as const,
      transportType: "Land" as SidebarTransport,
      performance: "Good",
      value: "+14.2%",
      volume: "2.1B AED",
    },
  ];

  const sidebarCategoryLabel = (row: { hs: string; bec: string; sitc: string }) => {
    switch (classification) {
      case "BEC":
        return row.bec;
      case "SITC":
        return row.sitc;
      default:
        return row.hs;
    }
  };

  const tradeFlowMatchesFilter = (tradeType: string) => {
    if (foreignTradeType === "all") return true;
    const map: Record<string, string> = {
      import: "Import",
      export: "Export",
      "re-export": "Re-Export",
    };
    return tradeType === map[foreignTradeType];
  };

  const transportMatchesFilter = (t: SidebarTransport) => {
    if (transportType === "all") return true;
    const cap = transportType === "sea" ? "Sea" : transportType === "air" ? "Air" : "Land";
    return t === cap;
  };

  const filteredAffectedCategories = useMemo(
    () => affectedCategories.filter((item) => tradeFlowMatchesFilter(item.tradeType) && transportMatchesFilter(item.transportType)),
    [foreignTradeType, transportType],
  );

  const filteredTopPerformingCategories = useMemo(
    () => topPerformingCategories.filter((item) => tradeFlowMatchesFilter(item.tradeType) && transportMatchesFilter(item.transportType)),
    [foreignTradeType, transportType],
  );

  const visiblePorts = useMemo(
    () =>
      ports.filter((p) => {
        if (selectedPort !== "all" && p.id !== selectedPort) return false;
        if (transportType !== "all" && p.transport !== transportType) return false;
        return true;
      }),
    [ports, selectedPort, transportType],
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "Excellent":
        return "bg-green-100 text-green-700";
      case "Good":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleAskAI = (
    category: (typeof affectedCategories)[number] | (typeof topPerformingCategories)[number],
    isCritical: boolean,
  ) => {
    const label = sidebarCategoryLabel(category);
    const question = isCritical
      ? `What is the impact of the Strait of Hormuz situation on ${label} ${category.tradeType} through ${category.transportType} transport?`
      : `What are the key drivers behind the strong performance of ${label} ${category.tradeType} through ${category.transportType} transport?`;
    navigate("/trade-ai", { state: { query: question } });
  };

  return (
    <div className={`bg-white rounded-lg p-6 border ${isCritical ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SectionIcon icon={Anchor} tone="sky" />
            <h3 className="font-semibold text-lg text-gray-900">UAE Trade Distribution - Abu Dhabi Ports</h3>
            {isCritical && (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
                <AlertTriangle className="h-3 w-3" />
                Critical - Strait of Hormuz Situation
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Port-level trade analysis for Abu Dhabi Emirate
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Classification</label>
          <Select value={classification} onValueChange={setClassification}>
            <SelectTrigger className="w-full">
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
          <label className="text-xs font-medium text-gray-700 mb-1 block">Port</label>
          <Select value={selectedPort} onValueChange={setSelectedPort}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ports</SelectItem>
              <SelectItem value="zayed">Zayed Port</SelectItem>
              <SelectItem value="musaffah">Musaffah Port</SelectItem>
              <SelectItem value="delma">Delma Port</SelectItem>
              <SelectItem value="alsila">Al Sila Port</SelectItem>
              <SelectItem value="almirfa">Al Mirfa Port</SelectItem>
              <SelectItem value="shahama">Shahama Port</SelectItem>
              <SelectItem value="auh_cargo">Abu Dhabi Airport Cargo</SelectItem>
              <SelectItem value="ghweifat">Al Ghuwaifat Land Border</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Transport Type</label>
          <Select value={transportType} onValueChange={setTransportType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="sea">Sea</SelectItem>
              <SelectItem value="land">Land</SelectItem>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-slate-100/80 rounded-lg p-3 border border-gray-200 relative min-h-[360px] h-[420px]">
          <AbuDhabiTradeLeafletMap
            ports={visiblePorts}
            isCritical={isCritical}
            onHoverPort={(port) => {
              if (!port) {
                setTooltipContent(null);
                return;
              }
              const payload = buildTooltipPayload(port.name);
              if (payload) setTooltipContent(payload);
            }}
          />

          {visiblePorts.length === 0 && (
            <div className="absolute inset-4 flex items-center justify-center rounded-lg bg-white/90 border border-dashed border-gray-300 z-[1100]">
              <p className="text-sm text-gray-600 px-4 text-center">
                No facilities match the current port and transport filters.
              </p>
            </div>
          )}

          {/* Port Tooltip */}
          {tooltipContent && (
            <div className={`absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border w-64 z-[1200] pointer-events-auto ${isCritical ? 'border-red-400' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{tooltipContent.name}</h4>
                {isCritical && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                    Critical
                  </Badge>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Imports:</span>
                  <span className="font-medium text-gray-900">{tooltipContent.imports.toFixed(1)}B AED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exports:</span>
                  <span className="font-medium text-gray-900">{tooltipContent.exports.toFixed(1)}B AED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Re-Exports:</span>
                  <span className="font-medium text-gray-900">{tooltipContent.reExports.toFixed(1)}B AED</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Net Trade:</span>
                  <span
                    className={`font-semibold ${tooltipContent.netTrade < 0 ? "text-red-600" : "text-blue-600"}`}
                  >
                    {tooltipContent.netTrade.toFixed(1)}B AED
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                  {isCritical ? "Affected Categories" : `Top Categories (${classification})`}
                </h5>
                <div className="space-y-1.5">
                  {isCritical ? (
                    tooltipContent.affectedCategories.map((cat, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{cat.name}</span>
                        <span className="font-semibold text-red-600">{cat.impact}</span>
                      </div>
                    ))
                  ) : (
                    tooltipContent.topCategories.map((cat, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{cat.name}</span>
                        <span className="font-medium text-gray-900">{cat.value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            {isCritical ? "Affected Categories" : "Top Performing Categories"}
          </h4>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {isCritical ? (
              filteredAffectedCategories.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                  No categories match the current filters. Adjust trade type or transport.
                </p>
              ) : (
                filteredAffectedCategories.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 flex-1">
                      {sidebarCategoryLabel(item)}
                    </div>
                    <Badge className={`text-xs ${getImpactColor(item.impact)}`}>
                      {item.impact}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Trade Type:</span>
                    <Badge className={`text-xs ${
                      item.tradeType === "Import" ? "bg-blue-100 text-blue-700" :
                      item.tradeType === "Export" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {item.tradeType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Transport:</span>
                    <span className="font-medium">{item.transportType}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">Impact:</span>
                    <span className="font-semibold text-red-600">{item.value}</span>
                  </div>
                  <button
                    onClick={() => handleAskAI(item, true)}
                    className="w-full flex items-center justify-center gap-1 text-purple-600 hover:text-purple-700 text-xs py-1 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Ask AI
                  </button>
                </div>
              ))
              )
            ) : (
              filteredTopPerformingCategories.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                  No categories match the current filters. Adjust trade type or transport.
                </p>
              ) : (
                filteredTopPerformingCategories.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 flex-1">
                      {sidebarCategoryLabel(item)}
                    </div>
                    <Badge className={`text-xs ${getPerformanceColor(item.performance)}`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {item.performance}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Trade Type:</span>
                    <Badge className={`text-xs ${
                      item.tradeType === "Import" ? "bg-blue-100 text-blue-700" :
                      item.tradeType === "Export" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {item.tradeType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Transport:</span>
                    <span className="font-medium">{item.transportType}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Volume:</span>
                    <span className="font-medium">{item.volume}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">Growth:</span>
                    <span className="font-semibold text-green-600">{item.value}</span>
                  </div>
                  <button
                    onClick={() => handleAskAI(item, false)}
                    className="w-full flex items-center justify-center gap-1 text-purple-600 hover:text-purple-700 text-xs py-1 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Ask AI
                  </button>
                </div>
              ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
