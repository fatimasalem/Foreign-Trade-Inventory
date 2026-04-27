import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertTriangle, MessageSquare, Anchor } from "lucide-react";
import { Badge } from "./ui/badge";
import { SectionIcon } from "./section-icon";
import { AbuDhabiTradeLeafletMap } from "./abu-dhabi-trade-leaflet-map";
import { stripClassificationCode } from "../../lib/strip-classification-label";

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
  const [mapSelectedPortId, setMapSelectedPortId] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<PortTooltipData | null>(null);
  const portCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const visiblePorts = useMemo(
    () =>
      ports.filter((p) => {
        if (selectedPort !== "all" && p.id !== selectedPort) return false;
        if (transportType !== "all" && p.transport !== transportType) return false;
        return true;
      }),
    [ports, selectedPort, transportType],
  );

  useLayoutEffect(() => {
    if (!mapSelectedPortId) return;
    const el = portCardRefs.current[mapSelectedPortId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [mapSelectedPortId, visiblePorts]);

  const handleAskAIPort = (portName: string, critical: boolean) => {
    const question = critical
      ? `What is the impact of the Strait of Hormuz situation on trade and categories at ${portName}?`
      : `What are the key drivers behind top-performing trade categories at ${portName}?`;
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
            selectedPortId={mapSelectedPortId}
            onPortClick={(port) => {
              setMapSelectedPortId((cur) => (cur === port.id ? null : port.id));
            }}
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
                      <div key={idx} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-600">{stripClassificationCode(cat.name)}</span>
                        <span className="font-semibold text-red-600 shrink-0">{cat.impact}</span>
                      </div>
                    ))
                  ) : (
                    tooltipContent.topCategories.map((cat, idx) => (
                      <div key={idx} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-600">{stripClassificationCode(cat.name)}</span>
                        <span className="font-medium text-gray-900 shrink-0">{cat.value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories by port (linked to map selection) */}
        <div className="space-y-3 min-h-0 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900">
              {isCritical ? "Affected categories (by port)" : "Top performing (by port)"}
            </h4>
            {mapSelectedPortId && (
              <button
                type="button"
                onClick={() => setMapSelectedPortId(null)}
                className="text-xs text-blue-600 hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 -mt-1">Click a port on the map or a card to highlight the matching port.</p>
          <div className="max-h-[420px] space-y-2 overflow-y-auto scroll-smooth py-1 pl-1 pr-2">
            {visiblePorts.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                No facilities match the current port and transport filters.
              </p>
            ) : (
              visiblePorts.map((port) => {
                const base = portTradeDataBase[port.name];
                if (!base) return null;
                const active = mapSelectedPortId === port.id;
                return (
                  <div
                    key={port.id}
                    ref={(el) => {
                      portCardRefs.current[port.id] = el;
                    }}
                    className={`scroll-mt-1 rounded-lg border-2 p-3 transition-[box-shadow,background-color] ${
                      active
                        ? "border-blue-600 bg-sky-50/95 shadow-md"
                        : "border-gray-200 bg-white shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setMapSelectedPortId((id) => (id === port.id ? null : port.id))}
                      className="w-full text-left"
                    >
                      <div className="text-xs font-semibold text-gray-800 mb-2">{port.name}</div>
                      <div className="space-y-1.5">
                        {isCritical
                          ? base.affectedCategories.map((ac, i) => (
                              <div key={i} className="flex justify-between gap-2 text-xs">
                                <span className="text-gray-700">{stripClassificationCode(ac.name)}</span>
                                <span className="font-semibold text-red-600 shrink-0">{ac.impact}</span>
                              </div>
                            ))
                          : base.topCategories.map((row, i) => (
                              <div key={i} className="flex justify-between gap-2 text-xs">
                                <span className="text-gray-700">{stripClassificationCode(categoryLabel(row))}</span>
                                <span className="font-medium text-gray-900 shrink-0">{row.value}</span>
                              </div>
                            ))}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskAIPort(port.name, isCritical)}
                      className="mt-2 w-full flex items-center justify-center gap-1 text-purple-600 hover:text-purple-700 text-xs py-1.5 border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Ask AI
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
