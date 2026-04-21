import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Line, Marker } from "react-simple-maps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ZoomIn, ZoomOut, MapPinned } from "lucide-react";
import { Button } from "./ui/button";
import { SectionIcon } from "./section-icon";
import { Badge } from "./ui/badge";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/** Hub + destination coordinates [longitude, latitude] for flow map (country view). */
const BAHRAIN_HUB: [number, number] = [50.58, 26.14];

const TRADE_COUNTRY_COORDS: Record<string, [number, number]> = {
  China: [104.2, 35.9],
  India: [78.0, 22.0],
  "United States": [-98.35, 39.5],
  "Saudi Arabia": [45.0, 24.0],
  Germany: [10.45, 51.15],
  "United Kingdom": [-2.5, 54.7],
  Japan: [138.25, 36.2],
  "South Korea": [127.77, 35.9],
  France: [2.21, 46.23],
  Italy: [12.57, 41.87],
  Brazil: [-51.93, -14.24],
  Australia: [133.78, -25.27],
};

const MAP_ACCENT = "#2b59c3";
const LAND_FILL = "#e8e9ec";
const LAND_STROKE = "#ffffff";

function flowArcPoints(from: [number, number], to: [number, number]): [number, number][] {
  const midLon = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = (-dy / len) * 15;
  const ny = (dx / len) * 15;
  return [from, [midLon + nx, midLat + ny], to];
}

/** Map Natural Earth country names to mock data keys (tooltip + trade volume). */
function resolveTradeDataKey(geoName: string, trade: Record<string, number>): string | undefined {
  if (trade[geoName] !== undefined) return geoName;
  const aliases: Record<string, string> = {
    "United States of America": "United States",
    "United States": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "United Kingdom": "United Kingdom",
    "Korea, Republic of": "South Korea",
    "Korea, Rep.": "South Korea",
    Korea: "South Korea",
  };
  const mapped = aliases[geoName];
  return mapped && trade[mapped] !== undefined ? mapped : undefined;
}

type ViewType = "country" | "continent";

interface CategoryData {
  HS: { name: string; value: string }[];
  BEC: { name: string; value: string }[];
  SITC: { name: string; value: string }[];
}

interface CountryTooltipData {
  name: string;
  imports: number;
  exports: number;
  reExports: number;
  netTrade: number;
  topCategories: CategoryData;
}

interface ContinentTooltipData {
  name: string;
  imports: number;
  exports: number;
  reExports: number;
  netTrade: number;
  topCategories: CategoryData;
}

export function GlobalTradeMap() {
  const [viewType, setViewType] = useState<ViewType>("country");
  const [tradeType, setTradeType] = useState("all");
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [tooltipContent, setTooltipContent] = useState<CountryTooltipData | ContinentTooltipData | null>(null);
  const [zoom, setZoom] = useState(1);

  // Mock trade data by country (in billions AED)
  const countryTradeData: Record<string, number> = {
    "China": 22.5,
    "India": 18.3,
    "United States": 12.8,
    "Saudi Arabia": 15.2,
    "Germany": 8.5,
    "United Kingdom": 7.3,
    "Japan": 9.8,
    "South Korea": 6.5,
    "France": 5.2,
    "Italy": 4.8,
    "Brazil": 3.5,
    "Australia": 4.2,
  };

  // Mock detailed trade data for tooltips
  const countryDetailedData: Record<string, CountryTooltipData> = {
    "China": {
      name: "China",
      imports: 8.5,
      exports: 9.2,
      reExports: 4.8,
      netTrade: 5.5,
      topCategories: {
        HS: [
          { name: "HS76 - Aluminum", value: "3.2B" },
          { name: "HS39 - Plastics", value: "2.8B" },
          { name: "HS84 - Machinery", value: "2.1B" },
        ],
        BEC: [
          { name: "BEC42 - Capital goods", value: "3.5B" },
          { name: "BEC21 - Processed materials", value: "2.9B" },
          { name: "BEC51 - Transport equipment", value: "2.0B" },
        ],
        SITC: [
          { name: "SITC68 - Non-ferrous metals", value: "3.3B" },
          { name: "SITC57 - Plastics", value: "2.7B" },
          { name: "SITC71 - Machinery", value: "2.2B" },
        ],
      },
    },
    "India": {
      name: "India",
      imports: 6.8,
      exports: 7.5,
      reExports: 4.0,
      netTrade: 4.7,
      topCategories: {
        HS: [
          { name: "HS71 - Precious metals", value: "2.8B" },
          { name: "HS27 - Mineral fuels", value: "2.2B" },
          { name: "HS84 - Machinery", value: "1.8B" },
        ],
        BEC: [
          { name: "BEC42 - Capital goods", value: "2.6B" },
          { name: "BEC21 - Processed materials", value: "2.3B" },
          { name: "BEC31 - Primary fuels", value: "1.9B" },
        ],
        SITC: [
          { name: "SITC97 - Gold", value: "2.7B" },
          { name: "SITC33 - Petroleum", value: "2.1B" },
          { name: "SITC71 - Machinery", value: "1.7B" },
        ],
      },
    },
    "United States": {
      name: "United States",
      imports: 4.5,
      exports: 5.3,
      reExports: 3.0,
      netTrade: 3.8,
      topCategories: {
        HS: [
          { name: "HS87 - Vehicles", value: "2.1B" },
          { name: "HS84 - Machinery", value: "1.9B" },
          { name: "HS85 - Electronics", value: "1.3B" },
        ],
        BEC: [
          { name: "BEC51 - Transport equipment", value: "2.2B" },
          { name: "BEC42 - Capital goods", value: "1.8B" },
          { name: "BEC61 - Consumer durables", value: "1.4B" },
        ],
        SITC: [
          { name: "SITC78 - Road vehicles", value: "2.0B" },
          { name: "SITC77 - Electrical machinery", value: "1.8B" },
          { name: "SITC76 - Telecom equipment", value: "1.3B" },
        ],
      },
    },
    "Saudi Arabia": {
      name: "Saudi Arabia",
      imports: 5.2,
      exports: 6.8,
      reExports: 3.2,
      netTrade: 4.8,
      topCategories: {
        HS: [
          { name: "HS72 - Iron & steel", value: "2.5B" },
          { name: "HS39 - Plastics", value: "1.8B" },
          { name: "HS84 - Machinery", value: "1.5B" },
        ],
        BEC: [
          { name: "BEC21 - Processed materials", value: "2.4B" },
          { name: "BEC42 - Capital goods", value: "1.9B" },
          { name: "BEC22 - Processed materials", value: "1.6B" },
        ],
        SITC: [
          { name: "SITC67 - Iron & steel", value: "2.3B" },
          { name: "SITC57 - Plastics", value: "1.7B" },
          { name: "SITC71 - Machinery", value: "1.4B" },
        ],
      },
    },
    "Germany": {
      name: "Germany",
      imports: 3.2,
      exports: 4.1,
      reExports: 1.2,
      netTrade: 2.1,
      topCategories: {
        HS: [
          { name: "HS87 - Vehicles", value: "1.8B" },
          { name: "HS84 - Machinery", value: "1.2B" },
          { name: "HS30 - Pharmaceuticals", value: "0.9B" },
        ],
        BEC: [
          { name: "BEC51 - Transport equipment", value: "1.7B" },
          { name: "BEC42 - Capital goods", value: "1.3B" },
          { name: "BEC62 - Consumer goods", value: "0.8B" },
        ],
        SITC: [
          { name: "SITC78 - Road vehicles", value: "1.7B" },
          { name: "SITC71 - Machinery", value: "1.1B" },
          { name: "SITC54 - Medicaments", value: "0.9B" },
        ],
      },
    },
    "United Kingdom": {
      name: "United Kingdom",
      imports: 2.8,
      exports: 3.5,
      reExports: 1.0,
      netTrade: 1.7,
      topCategories: {
        HS: [
          { name: "HS71 - Precious metals", value: "1.2B" },
          { name: "HS84 - Machinery", value: "0.9B" },
          { name: "HS30 - Pharmaceuticals", value: "0.8B" },
        ],
        BEC: [
          { name: "BEC42 - Capital goods", value: "1.1B" },
          { name: "BEC62 - Consumer goods", value: "0.9B" },
          { name: "BEC21 - Processed materials", value: "0.7B" },
        ],
        SITC: [
          { name: "SITC97 - Gold", value: "1.1B" },
          { name: "SITC71 - Machinery", value: "0.8B" },
          { name: "SITC54 - Medicaments", value: "0.7B" },
        ],
      },
    },
    "Japan": {
      name: "Japan",
      imports: 3.5,
      exports: 4.8,
      reExports: 1.5,
      netTrade: 2.8,
      topCategories: {
        HS: [
          { name: "HS87 - Vehicles", value: "2.1B" },
          { name: "HS84 - Machinery", value: "1.5B" },
          { name: "HS85 - Electronics", value: "1.2B" },
        ],
        BEC: [
          { name: "BEC51 - Transport equipment", value: "2.0B" },
          { name: "BEC42 - Capital goods", value: "1.6B" },
          { name: "BEC61 - Consumer durables", value: "1.1B" },
        ],
        SITC: [
          { name: "SITC78 - Road vehicles", value: "2.0B" },
          { name: "SITC71 - Machinery", value: "1.4B" },
          { name: "SITC77 - Electrical machinery", value: "1.1B" },
        ],
      },
    },
    "South Korea": {
      name: "South Korea",
      imports: 2.4,
      exports: 3.2,
      reExports: 0.9,
      netTrade: 1.7,
      topCategories: {
        HS: [
          { name: "HS85 - Electronics", value: "1.4B" },
          { name: "HS87 - Vehicles", value: "1.1B" },
          { name: "HS84 - Machinery", value: "0.7B" },
        ],
        BEC: [
          { name: "BEC61 - Consumer durables", value: "1.3B" },
          { name: "BEC51 - Transport equipment", value: "1.0B" },
          { name: "BEC42 - Capital goods", value: "0.8B" },
        ],
        SITC: [
          { name: "SITC77 - Electrical machinery", value: "1.3B" },
          { name: "SITC78 - Road vehicles", value: "1.0B" },
          { name: "SITC71 - Machinery", value: "0.7B" },
        ],
      },
    },
    "France": {
      name: "France",
      imports: 2.0,
      exports: 2.5,
      reExports: 0.7,
      netTrade: 1.2,
      topCategories: {
        HS: [
          { name: "HS87 - Vehicles", value: "0.9B" },
          { name: "HS30 - Pharmaceuticals", value: "0.7B" },
          { name: "HS84 - Machinery", value: "0.6B" },
        ],
        BEC: [
          { name: "BEC51 - Transport equipment", value: "0.9B" },
          { name: "BEC62 - Consumer goods", value: "0.7B" },
          { name: "BEC42 - Capital goods", value: "0.6B" },
        ],
        SITC: [
          { name: "SITC78 - Road vehicles", value: "0.8B" },
          { name: "SITC54 - Medicaments", value: "0.7B" },
          { name: "SITC71 - Machinery", value: "0.6B" },
        ],
      },
    },
    "Italy": {
      name: "Italy",
      imports: 1.8,
      exports: 2.3,
      reExports: 0.7,
      netTrade: 1.2,
      topCategories: {
        HS: [
          { name: "HS84 - Machinery", value: "0.8B" },
          { name: "HS62 - Apparel", value: "0.7B" },
          { name: "HS87 - Vehicles", value: "0.6B" },
        ],
        BEC: [
          { name: "BEC42 - Capital goods", value: "0.8B" },
          { name: "BEC62 - Consumer goods", value: "0.7B" },
          { name: "BEC51 - Transport equipment", value: "0.6B" },
        ],
        SITC: [
          { name: "SITC71 - Machinery", value: "0.7B" },
          { name: "SITC84 - Apparel", value: "0.6B" },
          { name: "SITC78 - Road vehicles", value: "0.6B" },
        ],
      },
    },
    "Brazil": {
      name: "Brazil",
      imports: 1.3,
      exports: 1.7,
      reExports: 0.5,
      netTrade: 0.9,
      topCategories: {
        HS: [
          { name: "HS27 - Mineral fuels", value: "0.6B" },
          { name: "HS84 - Machinery", value: "0.5B" },
          { name: "HS87 - Vehicles", value: "0.4B" },
        ],
        BEC: [
          { name: "BEC31 - Primary fuels", value: "0.6B" },
          { name: "BEC42 - Capital goods", value: "0.5B" },
          { name: "BEC51 - Transport equipment", value: "0.4B" },
        ],
        SITC: [
          { name: "SITC33 - Petroleum", value: "0.6B" },
          { name: "SITC71 - Machinery", value: "0.5B" },
          { name: "SITC78 - Road vehicles", value: "0.4B" },
        ],
      },
    },
    "Australia": {
      name: "Australia",
      imports: 1.6,
      exports: 2.0,
      reExports: 0.6,
      netTrade: 1.0,
      topCategories: {
        HS: [
          { name: "HS27 - Mineral fuels", value: "0.7B" },
          { name: "HS71 - Precious metals", value: "0.6B" },
          { name: "HS84 - Machinery", value: "0.5B" },
        ],
        BEC: [
          { name: "BEC31 - Primary fuels", value: "0.7B" },
          { name: "BEC42 - Capital goods", value: "0.6B" },
          { name: "BEC21 - Processed materials", value: "0.5B" },
        ],
        SITC: [
          { name: "SITC33 - Petroleum", value: "0.6B" },
          { name: "SITC97 - Gold", value: "0.5B" },
          { name: "SITC71 - Machinery", value: "0.5B" },
        ],
      },
    },
  };

  // Mock continent data
  const continentData: Record<string, ContinentTooltipData> = {
    "Asia": {
      name: "Asia",
      imports: 35.5,
      exports: 42.8,
      reExports: 18.5,
      netTrade: 25.8,
      topCategories: {
        HS: [
          { name: "HS84 - Machinery", value: "12.5B" },
          { name: "HS85 - Electronics", value: "10.2B" },
          { name: "HS71 - Precious metals", value: "8.8B" },
        ],
        BEC: [
          { name: "BEC42 - Capital goods", value: "11.8B" },
          { name: "BEC61 - Consumer durables", value: "10.5B" },
          { name: "BEC21 - Processed materials", value: "8.2B" },
        ],
        SITC: [
          { name: "SITC71 - Machinery", value: "11.9B" },
          { name: "SITC77 - Electrical machinery", value: "10.0B" },
          { name: "SITC97 - Gold", value: "8.5B" },
        ],
      },
    },
    "Europe": {
      name: "Europe",
      imports: 18.2,
      exports: 22.5,
      reExports: 7.8,
      netTrade: 12.1,
      topCategories: {
        HS: [
          { name: "HS87 - Vehicles", value: "7.5B" },
          { name: "HS84 - Machinery", value: "6.2B" },
          { name: "HS30 - Pharmaceuticals", value: "4.8B" },
        ],
        BEC: [
          { name: "BEC51 - Transport equipment", value: "7.2B" },
          { name: "BEC42 - Capital goods", value: "6.5B" },
          { name: "BEC62 - Consumer goods", value: "4.5B" },
        ],
        SITC: [
          { name: "SITC78 - Road vehicles", value: "7.1B" },
          { name: "SITC71 - Machinery", value: "6.0B" },
          { name: "SITC54 - Medicaments", value: "4.7B" },
        ],
      },
    },
    "North America": {
      name: "North America",
      imports: 8.5,
      exports: 10.2,
      reExports: 4.5,
      netTrade: 6.2,
      topCategories: {
        HS: [
          { name: "HS87 - Vehicles", value: "3.8B" },
          { name: "HS84 - Machinery", value: "2.9B" },
          { name: "HS85 - Electronics", value: "2.1B" },
        ],
        BEC: [
          { name: "BEC51 - Transport equipment", value: "3.6B" },
          { name: "BEC42 - Capital goods", value: "3.0B" },
          { name: "BEC61 - Consumer durables", value: "2.2B" },
        ],
        SITC: [
          { name: "SITC78 - Road vehicles", value: "3.7B" },
          { name: "SITC71 - Machinery", value: "2.8B" },
          { name: "SITC77 - Electrical machinery", value: "2.0B" },
        ],
      },
    },
    "Africa": {
      name: "Africa",
      imports: 4.2,
      exports: 5.8,
      reExports: 1.8,
      netTrade: 3.4,
      topCategories: {
        HS: [
          { name: "HS27 - Mineral fuels", value: "2.1B" },
          { name: "HS84 - Machinery", value: "1.5B" },
          { name: "HS72 - Iron & steel", value: "1.2B" },
        ],
        BEC: [
          { name: "BEC31 - Primary fuels", value: "2.0B" },
          { name: "BEC42 - Capital goods", value: "1.6B" },
          { name: "BEC21 - Processed materials", value: "1.1B" },
        ],
        SITC: [
          { name: "SITC33 - Petroleum", value: "2.0B" },
          { name: "SITC71 - Machinery", value: "1.4B" },
          { name: "SITC67 - Iron & steel", value: "1.1B" },
        ],
      },
    },
    "South America": {
      name: "South America",
      imports: 3.5,
      exports: 4.2,
      reExports: 1.2,
      netTrade: 2.2,
      topCategories: {
        HS: [
          { name: "HS27 - Mineral fuels", value: "1.5B" },
          { name: "HS84 - Machinery", value: "1.0B" },
          { name: "HS87 - Vehicles", value: "0.8B" },
        ],
        BEC: [
          { name: "BEC31 - Primary fuels", value: "1.4B" },
          { name: "BEC42 - Capital goods", value: "1.1B" },
          { name: "BEC51 - Transport equipment", value: "0.8B" },
        ],
        SITC: [
          { name: "SITC33 - Petroleum", value: "1.4B" },
          { name: "SITC71 - Machinery", value: "1.0B" },
          { name: "SITC78 - Road vehicles", value: "0.7B" },
        ],
      },
    },
    "Oceania": {
      name: "Oceania",
      imports: 2.1,
      exports: 2.8,
      reExports: 0.9,
      netTrade: 1.6,
      topCategories: {
        HS: [
          { name: "HS27 - Mineral fuels", value: "0.9B" },
          { name: "HS71 - Precious metals", value: "0.7B" },
          { name: "HS84 - Machinery", value: "0.6B" },
        ],
        BEC: [
          { name: "BEC31 - Primary fuels", value: "0.9B" },
          { name: "BEC42 - Capital goods", value: "0.7B" },
          { name: "BEC21 - Processed materials", value: "0.6B" },
        ],
        SITC: [
          { name: "SITC33 - Petroleum", value: "0.8B" },
          { name: "SITC97 - Gold", value: "0.7B" },
          { name: "SITC71 - Machinery", value: "0.6B" },
        ],
      },
    },
  };

  // Country to continent mapping
  const countryToContinent: Record<string, string> = {
    "China": "Asia",
    "India": "Asia",
    "Japan": "Asia",
    "South Korea": "Asia",
    "Saudi Arabia": "Asia",
    "United States": "North America",
    "Germany": "Europe",
    "United Kingdom": "Europe",
    "France": "Europe",
    "Italy": "Europe",
    "Brazil": "South America",
    "Australia": "Oceania",
  };

  // Mock trade data by continent
  const continentTradeData: Record<string, number> = {
    "Asia": 85.3,
    "Europe": 42.5,
    "North America": 18.7,
    "South America": 8.2,
    "Africa": 12.5,
    "Oceania": 5.8,
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const getTradeTypeInfo = () => {
    switch (tradeType) {
      case "import":
        return {
          label: "Import",
          className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
          description: "Non-Oil Imports"
        };
      case "export":
        return {
          label: "Export",
          className: "bg-green-100 text-green-700 hover:bg-green-100",
          description: "Non-Oil Exports"
        };
      case "re-export":
        return {
          label: "Re-Export",
          className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
          description: "Non-Oil Re-Exports"
        };
      default:
        return {
          label: "All Types",
          className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
          description: "Total Trade Volume"
        };
    }
  };

  const maxTradeValue = Math.max(...Object.values(countryTradeData), 1e-6);
  const maxContinentValue = Math.max(...Object.values(continentTradeData));

  const topCountries = Object.entries(countryTradeData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topContinents = Object.entries(continentTradeData)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SectionIcon icon={MapPinned} tone="sky" size="md" />
          <h2 className="font-semibold text-lg text-gray-900 leading-snug m-0">Global Trade Distribution</h2>
        </div>
        <div className="flex gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Trade Type</label>
            <Select value={tradeType} onValueChange={setTradeType}>
              <SelectTrigger className="w-[150px]">
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
            <label className="text-xs font-medium text-gray-700 mb-1 block">View</label>
            <Select value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="country">By Country</SelectItem>
                <SelectItem value="continent">By Continent</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={year} onValueChange={setYear}>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200 relative">
            {/* Zoom Controls */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomIn}
                className="bg-white hover:bg-gray-100"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomOut}
                className="bg-white hover:bg-gray-100"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
              }}
              style={{ width: "100%", height: "320px" }}
            >
              <ZoomableGroup zoom={zoom} center={[0, 20]}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties.name as string;
                      const dataKey = resolveTradeDataKey(countryName, countryTradeData);
                      const continentName = dataKey ? countryToContinent[dataKey] : undefined;

                      const tooltipData =
                        viewType === "country"
                          ? dataKey
                            ? countryDetailedData[dataKey]
                            : null
                          : dataKey && continentName
                            ? continentData[continentName]
                            : null;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={LAND_FILL}
                          stroke={LAND_STROKE}
                          strokeWidth={0.35}
                          onMouseEnter={() => {
                            if (tooltipData) {
                              setTooltipContent(tooltipData);
                            }
                          }}
                          onMouseLeave={() => {
                            setTooltipContent(null);
                          }}
                          style={{
                            default: { outline: "none" },
                            hover: {
                              outline: "none",
                              fill: tooltipData ? "#d8d9dd" : LAND_FILL,
                              cursor: tooltipData ? "pointer" : "default",
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

                {viewType === "country" &&
                  Object.entries(countryTradeData).map(([name, amt]) => {
                    const coords = TRADE_COUNTRY_COORDS[name];
                    if (!coords || amt <= 0) return null;
                    return (
                      <Line
                        key={`flow-${name}`}
                        coordinates={flowArcPoints(BAHRAIN_HUB, coords)}
                        stroke={MAP_ACCENT}
                        strokeWidth={1}
                        strokeOpacity={0.42}
                        fill="transparent"
                        pointerEvents="none"
                      />
                    );
                  })}

                {viewType === "country" &&
                  Object.entries(countryTradeData).map(([name, amt]) => {
                    const coords = TRADE_COUNTRY_COORDS[name];
                    if (!coords) return null;
                    const r = 3.5 + Math.sqrt(amt / maxTradeValue) * 14;
                    return (
                      <Marker key={`dot-${name}`} coordinates={coords}>
                        <g pointerEvents="none">
                          <circle r={r} fill={MAP_ACCENT} fillOpacity={0.95} stroke="#ffffff" strokeWidth={1.25} />
                          <text
                            textAnchor="middle"
                            y={-r - 4}
                            fontSize={9}
                            fill="#111827"
                            className="select-none"
                          >
                            {name}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}

                {viewType === "country" && (
                  <Marker coordinates={BAHRAIN_HUB}>
                    <g pointerEvents="none">
                      <circle r={10} fill={MAP_ACCENT} stroke="#ffffff" strokeWidth={1.5} />
                      <text textAnchor="middle" y={-16} fontSize={9} fontWeight={600} fill="#111827" className="select-none">
                        Kingdom of Bahrain
                      </text>
                    </g>
                  </Marker>
                )}
              </ZoomableGroup>
            </ComposableMap>

            {/* Custom Tooltip */}
            {tooltipContent && (
              <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  minWidth: "420px",
                  maxHeight: "480px",
                  overflowY: "auto",
                }}
              >
                <h4 className="font-semibold text-gray-900 mb-3">{tooltipContent.name}</h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Non-Oil Imports:</span>
                    <span className="font-medium text-gray-900">{tooltipContent.imports.toFixed(1)}B AED</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Non-Oil Exports:</span>
                    <span className="font-medium text-gray-900">{tooltipContent.exports.toFixed(1)}B AED</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Non-Oil Re-Exports:</span>
                    <span className="font-medium text-gray-900">{tooltipContent.reExports.toFixed(1)}B AED</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600 font-medium">Net Trade:</span>
                    <span
                      className={
                        tooltipContent.netTrade >= 0
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {tooltipContent.netTrade.toFixed(1)}B AED
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Top 3 Categories by Classification:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {/* HS Classification */}
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2 text-center border-b pb-1">HS</div>
                      <div className="space-y-1.5">
                        {tooltipContent.topCategories.HS.map((cat, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="text-gray-600 line-clamp-2 mb-0.5" title={cat.name}>
                              {cat.name}
                            </div>
                            <div className="font-medium text-gray-900">{cat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* BEC Classification */}
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2 text-center border-b pb-1">BEC</div>
                      <div className="space-y-1.5">
                        {tooltipContent.topCategories.BEC.map((cat, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="text-gray-600 line-clamp-2 mb-0.5" title={cat.name}>
                              {cat.name}
                            </div>
                            <div className="font-medium text-gray-900">{cat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* SITC Classification */}
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2 text-center border-b pb-1">SITC</div>
                      <div className="space-y-1.5">
                        {tooltipContent.topCategories.SITC.map((cat, idx) => (
                          <div key={idx} className="text-xs">
                            <div className="text-gray-600 line-clamp-2 mb-0.5" title={cat.name}>
                              {cat.name}
                            </div>
                            <div className="font-medium text-gray-900">{cat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <span>Flows from Kingdom of Bahrain · dot size = trade amount (AED billions)</span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2b59c3]" />
              <span>Smaller</span>
              <span className="inline-block h-4 w-4 rounded-full bg-[#2b59c3]" />
              <span>Larger</span>
            </span>
          </div>
        </div>

        {/* Top Trading Partners */}
        <div className="flex flex-col h-full">
          <h3 className="font-medium text-gray-900 mb-3">
            {viewType === "country" ? "Top Countries" : "By Continent"}
          </h3>
          <div className="space-y-2 overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
            {viewType === "country"
              ? topCountries.map(([country, value], index) => {
                  const tradeTypeInfo = getTradeTypeInfo();
                  return (
                    <div key={country} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {index + 1}. {country}
                        </span>
                        <Badge className={`text-[10px] px-1.5 py-0.5 h-5 shrink-0 ${tradeTypeInfo.className}`}>
                          {tradeTypeInfo.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mb-0.5">{tradeTypeInfo.description}</div>
                      <div className="text-sm font-semibold text-gray-900 mb-2">{value.toFixed(1)}B AED</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(value / maxTradeValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              : topContinents.map(([continent, value], index) => {
                  const tradeTypeInfo = getTradeTypeInfo();
                  return (
                    <div key={continent} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {index + 1}. {continent}
                        </span>
                        <Badge className={`text-[10px] px-1.5 py-0.5 h-5 shrink-0 ${tradeTypeInfo.className}`}>
                          {tradeTypeInfo.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mb-0.5">{tradeTypeInfo.description}</div>
                      <div className="text-sm font-semibold text-gray-900 mb-2">{value.toFixed(1)}B AED</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(value / maxContinentValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>
    </div>
  );
}