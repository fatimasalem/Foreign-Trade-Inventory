import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Bell, Plus, Settings, Printer, ZoomIn, ZoomOut, Pencil, Maximize2, TrendingUp, Table } from "lucide-react";
import { Button } from "../components/ui/button";

type GraphType = "line" | "bar" | "table";
type RangeType = "3Y" | "5Y" | "ALL" | "RECENT";

interface IndicatorData {
  title: string;
  value: string;
  unit: string;
  yoyDisplay: string;
  updateDate: string;
  isConfidential: boolean;
}

export function CompareIndicatorsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedIndicators = (location.state?.indicators || []) as IndicatorData[];

  const [graphType, setGraphType] = useState<GraphType>("line");
  const [showTooltip, setShowTooltip] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [showPreciseValue, setShowPreciseValue] = useState(false);
  const [range, setRange] = useState<RangeType>("RECENT");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Generate comparison data
  const generateComparisonData = () => {
    const currentYear = 2026;
    const data = [];

    // Determine date range based on selection
    let startYear = 2013;
    switch (range) {
      case "3Y":
        startYear = currentYear - 3;
        break;
      case "5Y":
        startYear = currentYear - 5;
        break;
      case "RECENT":
        startYear = currentYear - 1;
        break;
      case "ALL":
      default:
        startYear = 2013;
    }

    // Generate monthly data
    for (let year = startYear; year <= currentYear; year++) {
      const months = year === currentYear ? 1 : 12; // Only Jan for current year
      for (let month = 1; month <= months; month++) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dataPoint: any = {
          date: `${monthNames[month - 1]} ${year.toString().slice(-2)}`,
        };

        selectedIndicators.forEach((indicator, idx) => {
          const baseValue = parseFloat(indicator.value.replace(/,/g, ""));
          const variance = (Math.random() - 0.5) * baseValue * 0.3;
          dataPoint[`indicator${idx}`] = +(baseValue + variance).toFixed(2);
        });

        data.push(dataPoint);
      }
    }

    return data;
  };

  const comparisonData = generateComparisonData();

  // Define colors for different indicators
  const indicatorColors = ["#06b6d4", "#a855f7", "#ef4444", "#f59e0b", "#10b981"];

  const renderGraph = () => {
    if (graphType === "table") {
      return (
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold text-gray-900">Date</th>
                {selectedIndicators.map((indicator, idx) => (
                  <th key={idx} className="text-right p-3 font-semibold text-gray-900">
                    {indicator.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">{item.date}</td>
                  {selectedIndicators.map((_, idx) => (
                    <td key={idx} className="p-3 text-right text-gray-900 font-medium">
                      {showPreciseValue ? item[`indicator${idx}`].toFixed(2) : item[`indicator${idx}`].toFixed(0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={450}>
        {graphType === "line" ? (
          <LineChart data={comparisonData}>
            <CartesianGrid key="grid-compare" strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis key="xaxis-compare" dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              key="yaxis-left-compare"
              yAxisId="left"
              tick={{ fontSize: 11 }}
              label={{ value: selectedIndicators[0]?.unit || "Million Emirati Dirham", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#06b6d4" } }}
            />
            {selectedIndicators.length > 1 && (
              <YAxis
                key="yaxis-right-compare"
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                label={{ value: selectedIndicators[1]?.unit || "Percentage (%)", angle: 90, position: "insideRight", style: { fontSize: 12, fill: "#a855f7" } }}
              />
            )}
            {showTooltip && <Tooltip key="tooltip-compare" />}
            <Legend key="legend-compare" wrapperStyle={{ paddingTop: "20px" }} />
            {selectedIndicators.map((indicator, idx) => (
              <Line
                key={`line-${idx}`}
                yAxisId={idx === 0 ? "left" : "right"}
                type="monotone"
                dataKey={`indicator${idx}`}
                name={indicator.title}
                stroke={indicatorColors[idx]}
                strokeWidth={2}
                dot={{ fill: indicatorColors[idx], r: 3 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={comparisonData}>
            <CartesianGrid key="grid-compare" strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis key="xaxis-compare" dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis key="yaxis-compare" tick={{ fontSize: 11 }} />
            {showTooltip && <Tooltip key="tooltip-compare" />}
            <Legend key="legend-compare" wrapperStyle={{ paddingTop: "20px" }} />
            {selectedIndicators.map((indicator, idx) => (
              <Bar
                key={`bar-${idx}`}
                dataKey={`indicator${idx}`}
                name={indicator.title}
                fill={indicatorColors[idx]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Main Content */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Compared Indicators - Result</h1>
              <button className="text-gray-600 hover:text-gray-900">
                <Pencil className="h-5 w-5" />
              </button>
            </div>

            {/* Graph */}
            <div className="mb-6">
              {renderGraph()}
            </div>

            {/* Range Selector */}
            <div className="flex items-center justify-center gap-2">
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

            {/* Footer */}
            <div className="mt-6 text-sm text-gray-600">
              Created By <span className="font-medium">Fatima Salem Aljaari</span>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col items-center gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Download</h3>
              <div className="flex gap-2 mb-3">
                <button
                  disabled={!acceptTerms}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded ${
                    acceptTerms ? "bg-red-100 hover:bg-red-200" : "bg-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-2xl">📄</div>
                  <div className="text-xs font-medium text-gray-700">PDF</div>
                </button>
                <button
                  disabled={!acceptTerms}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded ${
                    acceptTerms ? "bg-green-100 hover:bg-green-200" : "bg-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-2xl">📊</div>
                  <div className="text-xs font-medium text-gray-700">XLS</div>
                </button>
                <button
                  disabled={!acceptTerms}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded ${
                    acceptTerms ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-2xl">📝</div>
                  <div className="text-xs font-medium text-gray-700">Word</div>
                </button>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <span className="text-xs text-gray-600">
                  I accept the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    terms and conditions
                  </a>{" "}
                  for downloading the documents
                </span>
              </label>
            </div>

            {/* More Actions */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col items-center gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Printer className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>

              {/* Graph Type Selection */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={graphType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("line")}
                  className={`h-10 w-10 p-0 ${graphType === "line" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
                <Button
                  variant={graphType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("bar")}
                  className={`h-10 w-10 p-0 ${graphType === "bar" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </Button>
                <Button
                  variant={graphType === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGraphType("table")}
                  className={`h-10 w-10 p-0 ${graphType === "table" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  <Table className="h-4 w-4" />
                </Button>
              </div>

              {/* View Selection */}
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTooltip}
                    onChange={(e) => setShowTooltip(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Tooltip</span>
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

            {/* Zoom Controls */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col items-center gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ZoomOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
