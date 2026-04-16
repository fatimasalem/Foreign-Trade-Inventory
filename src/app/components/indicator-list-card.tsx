import { TrendingUp, TrendingDown, Minus, MessageSquare, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { useAIAssistant } from "../contexts/ai-assistant-context";

interface IndicatorListCardProps {
  name: string;
  value: string;
  change: string;
  changeType: "MoM" | "YoY";
  unit?: string;
  tradeType?: string;
  classification?: string;
}

export function IndicatorListCard({ name, value, change, changeType, unit = "billions", tradeType = "all", classification = "HS" }: IndicatorListCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { openAIAssistant } = useAIAssistant();
  
  const getTrendIcon = () => {
    if (change.startsWith("+")) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (change.startsWith("-")) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  const getChangeColor = () => {
    if (change.startsWith("+")) return "text-green-600";
    if (change.startsWith("-")) return "text-red-600";
    return "text-gray-600";
  };

  const getTradeTypeBadge = () => {
    if (tradeType === "all") {
      // Randomly assign a type for demonstration when "all" is selected
      const types = ["import", "export", "re-export"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      return getTradeTypeInfo(randomType);
    }
    return getTradeTypeInfo(tradeType);
  };

  const getTradeTypeInfo = (type: string) => {
    switch (type) {
      case "import":
        return { label: "Import", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" };
      case "export":
        return { label: "Export", className: "bg-green-100 text-green-700 hover:bg-green-100" };
      case "re-export":
        return { label: "Re-Export", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" };
      default:
        return { label: "Import", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" };
    }
  };

  const getClassificationBadge = () => {
    return {
      label: classification,
      className: "bg-gray-100 text-gray-700 hover:bg-gray-100"
    };
  };

  const getDisplayName = () => {
    // Extract the code part (e.g., "HS71" from "Precious stones/metals (HS71)")
    const match = name.match(/\(([^)]+)\)/);
    if (!match) return name;

    const code = match[1];
    const nameWithoutCode = name.replace(/\s*\([^)]+\)/, '');

    // Replace the classification prefix if different
    if (classification !== "HS") {
      // For demo purposes, we'll keep the structure similar
      // In a real app, you'd have a mapping of codes between classifications
      const codeNumber = code.replace(/[A-Z]+/, '');
      return `${nameWithoutCode} (${classification}${codeNumber})`;
    }

    return name;
  };

  const getReason = () => {
    const isPositive = change.startsWith("+");
    const changeValue = parseFloat(change.replace("%", ""));
    const absoluteChange = Math.abs(changeValue);

    if (absoluteChange > 30) {
      return isPositive
        ? "Strong global demand surge"
        : "Supply chain disruptions";
    } else if (absoluteChange > 10) {
      return isPositive
        ? "Market expansion"
        : "Reduced consumer demand";
    } else {
      return "Normal market fluctuation";
    }
  };

  const getComparisonText = () => {
    if (changeType === "MoM") {
      return "vs. previous month";
    } else {
      return "vs. same period last year";
    }
  };

  const generateInsight = () => {
    const isPositive = change.startsWith("+");
    const changeValue = parseFloat(change.replace("%", ""));
    const absoluteChange = Math.abs(changeValue);

    if (absoluteChange > 30) {
      return `This category shows ${isPositive ? 'exceptional growth' : 'significant decline'} of ${change} ${changeType}. ${isPositive ? 'Strong market demand and favorable conditions are driving this performance.' : 'Market headwinds and reduced demand are impacting this category.'}`;
    } else if (absoluteChange > 10) {
      return `Moderate ${isPositive ? 'growth' : 'decline'} of ${change} ${changeType} observed. This ${isPositive ? 'positive trend indicates improving market conditions' : 'negative trend requires monitoring and potential intervention'}.`;
    } else {
      return `Stable performance with ${change} ${changeType}. The category remains within expected operational ranges, reflecting consistent market behavior.`;
    }
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    const question = `What are the key factors behind the ${change} ${changeType} change in ${name}?`;
    openAIAssistant(question);
  };

  const tradeTypeBadge = getTradeTypeBadge();
  const classificationBadge = getClassificationBadge();
  const displayName = getDisplayName();

  return (
    <div
      className="relative h-56 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full backface-hidden bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="text-sm text-gray-600 flex-1 line-clamp-2 font-medium">{displayName}</div>
            <div className="flex gap-1 shrink-0">
              <Badge className={`text-xs px-1.5 py-0.5 h-5 ${classificationBadge.className}`}>
                {classificationBadge.label}
              </Badge>
              <Badge className={`text-xs px-1.5 py-0.5 h-5 ${tradeTypeBadge.className}`}>
                {tradeTypeBadge.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-gray-900">{value}</span>
              <span className="text-base text-gray-500">AED</span>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className={`text-base font-semibold ${getChangeColor()}`}>{change}</span>
              <span className="text-sm text-gray-500">{changeType}</span>
            </div>
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex-1 flex flex-col">
            <div className="text-xs text-gray-500 mb-1">{getComparisonText()}</div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm text-gray-700 line-clamp-2 flex-1">{getReason()}</span>
              <button
                onClick={handleAskAI}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm shrink-0"
                title="Ask Trade AI"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-auto pt-1 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Click to see insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full backface-hidden bg-blue-50 rounded-lg border border-blue-200 p-3"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="flex flex-col h-full">
            <div className="text-sm font-medium text-blue-900 mb-2">Insight</div>
            <p className="text-sm text-blue-800 leading-relaxed flex-1 overflow-auto">
              {generateInsight()}
            </p>
            <div className="text-sm text-blue-600 mt-2">Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}