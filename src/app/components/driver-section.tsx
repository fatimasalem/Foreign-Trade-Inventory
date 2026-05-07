import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, MessageSquare, Earth, Factory } from "lucide-react";
import { Button } from "./ui/button";
import { SectionIcon } from "./section-icon";
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
        return "bg-[#123453] border-[#2f5f86]";
      case "negative":
        return "bg-[#3d2438] border-[#75476d]";
      case "neutral":
        return "bg-[#1a314d] border-[#3b5d82]";
    }
  };

  const isGlobal = title === "Global Drivers";

  return (
    <div className="rounded-xl border border-[#2e4567] bg-[#0c213b] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isGlobal ? (
            <SectionIcon icon={Earth} tone="blue" size="md" />
          ) : (
            <SectionIcon icon={Factory} tone="amber" size="md" />
          )}
          <div>
            <h3 className="m-0 text-2xl font-semibold tracking-tight text-cyan-300 md:text-3xl">{title}</h3>
            <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {isGlobal ? "External macro signals" : "Domestic market signals"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[110px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
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
              <SelectTrigger className="w-[90px] border-[#3b5b82] bg-[#112d4c] text-slate-100">
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
            className={`rounded-lg border p-3 ${getImpactColor(driver.impact)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getImpactIcon(driver.impact)}</div>
              <div className="flex-1">
                <div className="mb-1 font-medium text-slate-100">{driver.name}</div>
                <div className="text-sm text-slate-300">{driver.description}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAskAI(driver)}
                className="shrink-0 text-cyan-300 hover:bg-[#1c3e63] hover:text-cyan-200"
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
