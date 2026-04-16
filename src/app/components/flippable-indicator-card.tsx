import { useState } from "react";
import { TrendingUp, TrendingDown, MessageSquare, Lightbulb } from "lucide-react";
import { useAIAssistant } from "../contexts/ai-assistant-context";

interface TopItem {
  name: string;
  value: string;
}

interface FlippableIndicatorCardProps {
  name: string;
  value: string;
  change: string;
  changeType: "MoM" | "YoY";
  insight: string;
  topItems?: TopItem[];
  comparisonText?: string;
}

export function FlippableIndicatorCard({ name, value, change, changeType, insight, topItems, comparisonText }: FlippableIndicatorCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { openAIAssistant } = useAIAssistant();
  const isPositive = change.startsWith("+");

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="h-5 w-5 text-green-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    const question = `What are the key factors behind the ${change} ${changeType} change in ${name}?`;
    openAIAssistant(question);
  };

  return (
    <div
      className={`relative ${topItems || comparisonText ? 'h-64' : 'h-48'} cursor-pointer perspective-1000`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full backface-hidden bg-white border border-gray-200 rounded-lg p-4 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col h-full">
            <div className="text-sm text-gray-600 mb-2">{name}</div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
              </div>
            </div>
            <div className={`text-sm font-semibold mb-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {change} {changeType}
            </div>

            {topItems && topItems.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex-1">
                <div className="text-xs font-medium text-gray-700 mb-2">Top 2 Items:</div>
                <div className="space-y-2">
                  {topItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate flex-1 pr-2">{item.name}</span>
                      <span className="font-medium text-gray-900 shrink-0">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comparisonText && !topItems && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex-1">
                <div className="text-xs font-medium text-gray-700 mb-2">Comparison:</div>
                <div
                  className="text-xs text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: comparisonText }}
                />
              </div>
            )}

            <div className="mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Lightbulb className="h-3 w-3" />
                  <span>Click to see insights</span>
                </div>
                {((topItems && topItems.length > 0) || comparisonText) && (
                  <button
                    onClick={handleAskAI}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-xs"
                    title="Ask Trade AI"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-blue-50 border border-blue-200 rounded-lg p-6"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="flex flex-col h-full">
            <div className="text-xs font-medium text-blue-900 mb-2">Insight</div>
            <p className="text-xs text-blue-800 leading-relaxed flex-1">
              {insight}
            </p>
            <div className="text-xs text-blue-600 mt-2">Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}