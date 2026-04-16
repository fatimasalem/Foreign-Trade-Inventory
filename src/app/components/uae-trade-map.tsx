import { useState } from "react";
import { useNavigate } from "react-router";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertTriangle, MessageSquare, TrendingUp, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";

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

// GeoJSON for UAE - accurate representation based on actual borders
const uaeGeoJson = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature",
      properties: { name: "Abu Dhabi" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          // Western coastline and islands
          [51.5, 24.3], [51.7, 24.5], [52.0, 24.6], [52.5, 24.5], [53.0, 24.4],
          [53.5, 24.3], [54.0, 24.2], [54.3, 24.3], [54.6, 24.4], [54.9, 24.35],
          // Eastern boundary with other emirates
          [55.0, 24.3], [55.15, 24.5], [55.3, 24.7], [55.4, 24.8],
          // Northern boundary
          [55.45, 24.75], [55.4, 24.65], [55.3, 24.55], [55.2, 24.45],
          [55.0, 24.2], [54.8, 24.0], [54.5, 23.8], [54.0, 23.7],
          // Southern boundary
          [53.5, 23.5], [53.0, 23.3], [52.5, 23.2], [52.0, 23.3],
          [51.5, 23.5], [51.3, 23.8], [51.4, 24.0], [51.5, 24.3]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Other Emirates" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          // Northern emirates - from west to east
          [55.0, 24.3], [55.15, 24.5], [55.3, 24.7], [55.4, 24.8],
          [55.5, 25.0], [55.6, 25.3], [55.7, 25.6], [55.85, 25.8],
          [56.0, 25.95], [56.15, 26.0], [56.3, 25.95], [56.4, 25.85],
          [56.35, 25.7], [56.25, 25.5], [56.15, 25.3], [56.05, 25.1],
          [55.95, 24.9], [55.85, 24.7], [55.75, 24.5], [55.65, 24.35],
          [55.55, 24.25], [55.45, 24.2], [55.3, 24.25], [55.15, 24.3],
          [55.0, 24.3]
        ]]
      }
    }
  ]
};

export function UAETradeMap() {
  const navigate = useNavigate();
  const [foreignTradeType, setForeignTradeType] = useState("all");
  const [classification, setClassification] = useState("HS");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [transportType, setTransportType] = useState("sea");
  const [selectedPort, setSelectedPort] = useState("all");
  const [tooltipContent, setTooltipContent] = useState<PortTooltipData | null>(null);

  // Check if it's from March 2026 and onwards for critical alert
  const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthIndex = monthOrder.indexOf(month);
  const marchIndex = monthOrder.indexOf("March");

  const isCritical = parseInt(year) > 2026 ||
                     (year === "2026" && currentMonthIndex >= marchIndex);

  const ports = [
    { name: "Zayed Port", coordinates: [54.5, 24.3], affected: isCritical },
    { name: "Musaffah Port", coordinates: [54.6, 24.35], affected: isCritical },
    { name: "Delma Port", coordinates: [52.3, 24.5], affected: isCritical },
    { name: "Al Sila Port", coordinates: [51.8, 24.2], affected: isCritical },
    { name: "Al Mirfa Port", coordinates: [52.0, 24.1], affected: isCritical },
    { name: "Shahama Port", coordinates: [54.3, 24.4], affected: isCritical },
  ];

  // Port trade data for tooltips
  const portTradeData: Record<string, PortTooltipData> = {
    "Zayed Port": {
      name: "Zayed Port",
      imports: 8.5,
      exports: 12.3,
      reExports: 6.2,
      netTrade: 10.0,
      topCategories: [
        { name: "HS76 - Aluminum & articles", value: "3.2B AED" },
        { name: "HS84 - Machinery", value: "2.8B AED" },
        { name: "HS27 - Mineral fuels", value: "2.1B AED" }
      ],
      affectedCategories: [
        { name: "HS87 - Vehicles & parts", impact: "-35.2%" },
        { name: "HS84 - Machinery", impact: "-29.8%" },
        { name: "HS30 - Pharmaceutical products", impact: "-22.5%" }
      ]
    },
    "Musaffah Port": {
      name: "Musaffah Port",
      imports: 6.8,
      exports: 9.5,
      reExports: 4.3,
      netTrade: 7.0,
      topCategories: [
        { name: "HS72 - Iron & steel", value: "2.5B AED" },
        { name: "HS73 - Articles of iron/steel", value: "2.0B AED" },
        { name: "HS87 - Vehicles & parts", value: "1.8B AED" }
      ],
      affectedCategories: [
        { name: "HS72 - Iron & steel", impact: "-28.3%" },
        { name: "HS87 - Vehicles & parts", impact: "-26.7%" },
        { name: "HS73 - Articles of iron/steel", impact: "-19.5%" }
      ]
    },
    "Delma Port": {
      name: "Delma Port",
      imports: 2.1,
      exports: 3.8,
      reExports: 1.5,
      netTrade: 3.2,
      topCategories: [
        { name: "HS03 - Fish & seafood", value: "1.2B AED" },
        { name: "HS27 - Mineral fuels", value: "0.9B AED" },
        { name: "HS84 - Machinery", value: "0.7B AED" }
      ],
      affectedCategories: [
        { name: "HS27 - Mineral fuels", impact: "-18.2%" },
        { name: "HS84 - Machinery", impact: "-15.8%" },
        { name: "HS39 - Plastics", impact: "-12.3%" }
      ]
    },
    "Al Sila Port": {
      name: "Al Sila Port",
      imports: 1.8,
      exports: 2.5,
      reExports: 1.2,
      netTrade: 1.9,
      topCategories: [
        { name: "HS27 - Mineral fuels", value: "0.8B AED" },
        { name: "HS84 - Machinery", value: "0.6B AED" },
        { name: "HS39 - Plastics", value: "0.5B AED" }
      ],
      affectedCategories: [
        { name: "HS27 - Mineral fuels", impact: "-24.5%" },
        { name: "HS84 - Machinery", impact: "-20.1%" },
        { name: "HS39 - Plastics", impact: "-16.8%" }
      ]
    },
    "Al Mirfa Port": {
      name: "Al Mirfa Port",
      imports: 1.5,
      exports: 2.2,
      reExports: 0.9,
      netTrade: 1.6,
      topCategories: [
        { name: "HS76 - Aluminum & articles", value: "0.7B AED" },
        { name: "HS72 - Iron & steel", value: "0.5B AED" },
        { name: "HS84 - Machinery", value: "0.4B AED" }
      ],
      affectedCategories: [
        { name: "HS76 - Aluminum & articles", impact: "-17.3%" },
        { name: "HS72 - Iron & steel", impact: "-14.6%" },
        { name: "HS84 - Machinery", impact: "-11.2%" }
      ]
    },
    "Shahama Port": {
      name: "Shahama Port",
      imports: 3.2,
      exports: 5.1,
      reExports: 2.4,
      netTrade: 4.3,
      topCategories: [
        { name: "HS84 - Machinery", value: "1.5B AED" },
        { name: "HS85 - Electrical machinery", value: "1.2B AED" },
        { name: "HS87 - Vehicles & parts", value: "0.9B AED" }
      ],
      affectedCategories: [
        { name: "HS87 - Vehicles & parts", impact: "-31.8%" },
        { name: "HS84 - Machinery", impact: "-27.5%" },
        { name: "HS85 - Electrical machinery", impact: "-23.2%" }
      ]
    }
  };

  const affectedCategories = [
    {
      category: "HS87 - Vehicles & parts",
      tradeType: "Import",
      transportType: "Sea",
      impact: "High",
      value: "-32.5%"
    },
    {
      category: "HS84 - Machinery",
      tradeType: "Import",
      transportType: "Sea",
      impact: "High",
      value: "-28.3%"
    },
    {
      category: "HS30 - Pharmaceutical products",
      tradeType: "Import",
      transportType: "Sea",
      impact: "Medium",
      value: "-18.5%"
    },
  ];

  const topPerformingCategories = [
    {
      category: "HS76 - Aluminum & articles",
      tradeType: "Export",
      transportType: "Sea",
      performance: "Excellent",
      value: "+45.8%",
      volume: "8.2B AED"
    },
    {
      category: "HS71 - Precious metals",
      tradeType: "Export",
      transportType: "Air",
      performance: "Excellent",
      value: "+38.2%",
      volume: "7.5B AED"
    },
    {
      category: "HS27 - Mineral fuels",
      tradeType: "Export",
      transportType: "Sea",
      performance: "Good",
      value: "+28.5%",
      volume: "6.8B AED"
    },
  ];

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

  const handleAskAI = (category: typeof affectedCategories[0] | typeof topPerformingCategories[0], isCritical: boolean) => {
    const question = isCritical
      ? `What is the impact of the Strait of Hormuz situation on ${category.category} ${category.tradeType} through ${category.transportType} transport?`
      : `What are the key drivers behind the strong performance of ${category.category} ${category.tradeType} through ${category.transportType} transport?`;
    navigate("/trade-ai", { state: { query: question } });
  };

  return (
    <div className={`bg-white rounded-lg p-6 border ${isCritical ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-gray-700" />
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
        <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200 relative h-[280px]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 3500,
              center: [54, 24]
            }}
            width={800}
            height={400}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={uaeGeoJson}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      geo.properties.name === "Abu Dhabi"
                        ? "#ffffff"
                        : "#e5e7eb"
                    }
                    stroke={
                      geo.properties.name === "Abu Dhabi"
                        ? "#3b82f6"
                        : "#9ca3af"
                    }
                    strokeWidth={geo.properties.name === "Abu Dhabi" ? 1.5 : 0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>
            {ports.map((port, index) => (
              <Marker key={index} coordinates={port.coordinates}>
                <circle
                  r={4}
                  fill={isCritical ? "#ef4444" : "#3b82f6"}
                  stroke="white"
                  strokeWidth={1.5}
                  onMouseEnter={() => {
                    const portData = portTradeData[port.name];
                    if (portData) {
                      setTooltipContent(portData);
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(null);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <text
                  textAnchor="middle"
                  y={-8}
                  style={{ fontFamily: "system-ui", fontSize: 8, fill: "#374151", fontWeight: 500, pointerEvents: "none" }}
                >
                  {port.name.split(' ')[0]}
                </text>
              </Marker>
            ))}
          </ComposableMap>

          {/* Port Tooltip */}
          {tooltipContent && (
            <div className={`absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border w-64 z-20 ${isCritical ? 'border-red-400' : 'border-gray-300'}`}>
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
                  <span className="font-semibold text-blue-600">{tooltipContent.netTrade.toFixed(1)}B AED</span>
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
              affectedCategories.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 flex-1">
                      {item.category}
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
            ) : (
              topPerformingCategories.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 flex-1">
                      {item.category}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
