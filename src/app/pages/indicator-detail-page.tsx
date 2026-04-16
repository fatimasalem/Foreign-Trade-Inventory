import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, Download, Bell, Plus, Settings, Printer, FileText, Maximize2, ZoomIn, ZoomOut, CheckCircle2, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

type GraphType = "line" | "column" | "bar" | "circular" | "table";
type RangeType = "3Y" | "5Y" | "ALL" | "RECENT";

export function IndicatorDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const indicatorData = location.state;

  const [graphType, setGraphType] = useState<GraphType>("line");
  const [showTooltips, setShowTooltips] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [showPreciseValue, setShowPreciseValue] = useState(false);
  const [range, setRange] = useState<RangeType>("RECENT");

  // Generate historical data
  const generateHistoricalData = () => {
    const currentYear = 2026;
    const data = [];

    for (let year = 2012; year <= currentYear; year++) {
      const baseValue = parseFloat(indicatorData?.value?.replace(/[^0-9.-]/g, "") || "100");
      const variance = (Math.random() - 0.5) * 20;
      data.push({
        year: year.toString(),
        value: +(baseValue + variance).toFixed(1)
      });
    }
    return data;
  };

  const allData = generateHistoricalData();

  const getFilteredData = () => {
    const currentYear = 2026;
    switch (range) {
      case "3Y":
        return allData.filter(d => parseInt(d.year) >= currentYear - 3);
      case "5Y":
        return allData.filter(d => parseInt(d.year) >= currentYear - 5);
      case "RECENT":
        return allData.filter(d => parseInt(d.year) >= currentYear - 1);
      case "ALL":
      default:
        return allData;
    }
  };

  const filteredData = getFilteredData();

  const CustomLabel = (props: any) => {
    const { x, y, value } = props;
    if (!showDataLabels) return null;
    return (
      <text x={x} y={y - 10} fill="#374151" textAnchor="middle" fontSize="12">
        {showPreciseValue ? value.toFixed(2) : value}
      </text>
    );
  };

  const renderGraph = () => {
    if (graphType === "table") {
      return (
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold text-gray-900">Year</th>
                <th className="text-right p-3 font-semibold text-gray-900">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">{item.year}</td>
                  <td className="p-3 text-right text-gray-900 font-medium">
                    {showPreciseValue ? item.value.toFixed(2) : item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (graphType === "circular") {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Circular graph view
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        {graphType === "line" ? (
          <LineChart data={filteredData}>
            <CartesianGrid key="grid-detail" strokeDasharray="3 3" />
            <XAxis key="xaxis-detail" dataKey="year" />
            <YAxis key="yaxis-detail" />
            {showTooltips && <Tooltip key="tooltip-detail" />}
            <Line
              key="line-detail"
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              label={<CustomLabel />}
            />
          </LineChart>
        ) : graphType === "column" ? (
          <BarChart data={filteredData}>
            <CartesianGrid key="grid-detail" strokeDasharray="3 3" />
            <XAxis key="xaxis-detail" dataKey="year" />
            <YAxis key="yaxis-detail" />
            {showTooltips && <Tooltip key="tooltip-detail" />}
            <Bar
              key="bar-detail"
              dataKey="value"
              fill="#3b82f6"
              label={showDataLabels ? <CustomLabel /> : undefined}
            />
          </BarChart>
        ) : (
          <BarChart data={filteredData} layout="vertical">
            <CartesianGrid key="grid-detail" strokeDasharray="3 3" />
            <XAxis key="xaxis-detail" type="number" />
            <YAxis key="yaxis-detail" dataKey="year" type="category" />
            {showTooltips && <Tooltip key="tooltip-detail" />}
            <Bar
              key="bar-detail"
              dataKey="value"
              fill="#3b82f6"
              label={showDataLabels ? <CustomLabel /> : undefined}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{indicatorData?.title || "Indicator Details"}</h1>
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <TooltipUI>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </TooltipUI>
            </TooltipProvider>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Printer className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileText className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Maximize2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <p className="text-gray-700 leading-relaxed">
            This indicator represents {indicatorData?.title?.toLowerCase() || "the selected metric"} and provides comprehensive insights into economic trends and patterns.
            The data is collected and verified by the Statistics Centre - Abu Dhabi (SCAD) and is updated regularly to ensure accuracy and reliability.
            This metric is crucial for understanding the economic landscape and making informed policy decisions.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Main Graph Area */}
          <div className="col-span-3 bg-white rounded-lg p-6 border border-gray-200">
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Data Visualization</h3>
              {renderGraph()}
            </div>

            {/* Range Selector */}
            <div className="flex items-center gap-2 justify-center mt-6">
              {(["3Y", "5Y", "ALL", "RECENT"] as RangeType[]).map((r) => (
                <Button
                  key={r}
                  variant={range === r ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRange(r)}
                  className={range === r ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>

            {/* Graph Type Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">Graph Type</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={graphType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("line")}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${graphType === "line" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <div className="text-xs">Line</div>
                </Button>
                <Button
                  variant={graphType === "column" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("column")}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${graphType === "column" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <div className="text-xs">Column</div>
                </Button>
                <Button
                  variant={graphType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("bar")}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${graphType === "bar" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <div className="text-xs">Bar</div>
                </Button>
                <Button
                  variant={graphType === "circular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("circular")}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${graphType === "circular" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <div className="text-xs">Circular</div>
                </Button>
                <Button
                  variant={graphType === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("table")}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${graphType === "table" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <div className="text-xs">Table</div>
                </Button>
              </div>
            </div>

            {/* View Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">View Selection</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTooltips}
                    onChange={(e) => setShowTooltips(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Tooltips</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDataLabels}
                    onChange={(e) => setShowDataLabels(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Data Labels</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPreciseValue}
                    onChange={(e) => setShowPreciseValue(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Precise Value</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                        <Info className="h-3 w-3" />
                        OPEN
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Open Classification: This data is publicly available and can be freely accessed, shared, and used by anyone without restrictions.</p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Updated:</span> {indicatorData?.updateDate || "April 2026"}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Source:</span> SCAD Official
              </div>
            </div>
            <Button variant="link" className="text-blue-600">
              Metadata and methodology
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
