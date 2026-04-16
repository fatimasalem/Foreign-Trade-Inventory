import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, MessageSquare, Globe2, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAIAssistant } from "../contexts/ai-assistant-context";

interface Driver {
  name: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

interface DriverSectionProps {
  title: string;
  drivers: Driver[];
}

export function DriverSection({ title, drivers }: DriverSectionProps) {
  const { openAIAssistant } = useAIAssistant();
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");

  const handleAskAI = (driver: Driver) => {
    const question = `What is the impact of ${driver.name} on Abu Dhabi's foreign trade? ${driver.description}`;
    openAIAssistant(question);
  };

  const getImpactIcon = (impact: Driver["impact"]) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case "neutral":
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: Driver["impact"]) => {
    switch (impact) {
      case "positive":
        return "bg-green-50 border-green-200";
      case "negative":
        return "bg-red-50 border-red-200";
      case "neutral":
        return "bg-gray-50 border-gray-200";
    }
  };

  const isGlobal = title === "Global Drivers";

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isGlobal ? <Globe2 className="h-5 w-5 text-gray-700" /> : <Building2 className="h-5 w-5 text-gray-700" />}
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
        </div>
        <div className="flex gap-2">
          <div>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[110px]">
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
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[90px]">
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
      <div className="space-y-3">
        {drivers.map((driver, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getImpactColor(driver.impact)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getImpactIcon(driver.impact)}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">{driver.name}</div>
                <div className="text-sm text-gray-600">{driver.description}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAskAI(driver)}
                className="shrink-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
