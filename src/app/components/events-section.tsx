import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, MessageSquare, Newspaper } from "lucide-react";
import { Button } from "./ui/button";
import { SectionIcon } from "./section-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAIAssistant } from "../contexts/ai-assistant-context";

export function EventsSection() {
  const { openAIAssistant } = useAIAssistant();
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");

  const events = [
    {
      date: "April 8, 2026",
      title: "OPEC+ Announces Production Cuts Extension",
      effect: "positive" as const,
      impact: "Expected to boost petrochemical sector exports by 8-10% in Q2",
      aiQuery: "What is the impact of OPEC+ production cuts extension on Abu Dhabi's petrochemical exports?",
    },
    {
      date: "April 5, 2026",
      title: "UAE-India Trade Agreement Implementation",
      effect: "positive" as const,
      impact: "Reduced tariffs on pharmaceutical and textile exports to India",
      aiQuery: "How will the UAE-India trade agreement affect Abu Dhabi's pharmaceutical and textile exports?",
    },
    {
      date: "April 2, 2026",
      title: "Global Supply Chain Disruption - Red Sea",
      effect: "negative" as const,
      impact: "Shipping delays affecting consumer goods imports, 2-3 week delays",
      aiQuery: "What are the implications of Red Sea supply chain disruptions on Abu Dhabi's imports?",
    },
    {
      date: "March 28, 2026",
      title: "China Announces Infrastructure Stimulus",
      effect: "positive" as const,
      impact: "Increased demand for aluminum exports expected in Q2-Q3",
      aiQuery: "How does China's infrastructure stimulus affect Abu Dhabi's aluminum export demand?",
    },
  ];

  const handleLearnMore = (query: string) => {
    openAIAssistant(query);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SectionIcon icon={Newspaper} tone="violet" size="md" />
          <h3 className="font-semibold text-lg text-gray-900 leading-snug m-0">Events & Impact on Foreign Trade</h3>
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
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">{event.date}</span>
                  {event.effect === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                <div className="text-sm text-gray-600 mb-3">{event.impact}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                  onClick={() => handleLearnMore(event.aiQuery)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Learn more by asking Trade AI
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}