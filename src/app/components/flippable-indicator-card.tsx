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
    if (isPositive) return <TrendingUp className="h-5 w-5 text-emerald-300" />;
    return <TrendingDown className="h-5 w-5 text-rose-300" />;
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
          className="absolute h-full w-full overflow-hidden rounded-xl border border-[#335175] bg-[#112d4c] p-4 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col h-full">
            <div className="mb-2 text-sm text-slate-300">{name}</div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-2xl font-semibold text-white">{value}</div>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
              </div>
            </div>
            <div className={`mb-2 text-sm font-semibold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
              {change} {changeType}
            </div>

            {topItems && topItems.length > 0 && (
              <div className="mt-2 flex-1 border-t border-[#2f4b70] pt-2">
                <div className="mb-2 text-xs font-medium text-slate-300">Top 2 Items:</div>
                <div className="space-y-2">
                  {topItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex-1 truncate pr-2 text-slate-300">{item.name}</span>
                      <span className="shrink-0 font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comparisonText && !topItems && (
              <div className="mt-2 flex-1 border-t border-[#2f4b70] pt-2">
                <div className="mb-2 text-xs font-medium text-slate-300">Comparison:</div>
                <div
                  className="text-xs leading-relaxed text-slate-300"
                  dangerouslySetInnerHTML={{ __html: comparisonText }}
                />
              </div>
            )}

            <div className="mt-auto border-t border-[#2f4b70] pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lightbulb className="h-3 w-3" />
                  <span>Click to see insights</span>
                </div>
                {((topItems && topItems.length > 0) || comparisonText) && (
                  <button
                    onClick={handleAskAI}
                    className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
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
          className="absolute h-full w-full rounded-xl border border-[#2f4b70] bg-[#0f2745] p-6 backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="flex flex-col h-full">
            <div className="mb-2 text-xs font-medium text-cyan-300">Insight</div>
            <p className="flex-1 text-xs leading-relaxed text-slate-200">
              {insight}
            </p>
            <div className="mt-2 text-xs text-cyan-300">Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}