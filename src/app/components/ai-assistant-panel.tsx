import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { cn } from "./ui/utils";

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
}

export function AIAssistantPanel({ isOpen, onClose, question }: AIAssistantPanelProps) {
  const navigate = useNavigate();
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && question) {
      setIsLoading(true);
      // Simulate AI response generation
      setTimeout(() => {
        setResponse(generateResponse(question));
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, question]);

  const generateResponse = (query: string) => {
    // Generate contextual response based on the question
    if (query.toLowerCase().includes("strait of hormuz")) {
      return `The Strait of Hormuz situation has created significant disruptions to Abu Dhabi's maritime trade routes. Key impacts include:

• **Shipping Delays**: Average delays of 2-3 weeks for container shipments
• **Increased Costs**: Freight rates have increased by approximately 8% due to alternative routing
• **Route Diversification**: Traders are increasingly using land routes through Saudi Arabia and alternative sea routes
• **Category Impact**: Particularly affecting time-sensitive goods like pharmaceuticals and perishables

**Recommendations:**
1. Diversify supply chain routes to reduce dependency on Strait of Hormuz
2. Increase inventory buffers for critical categories
3. Explore air freight options for high-value, time-sensitive goods
4. Monitor geopolitical developments closely for contingency planning`;
    }

    if (query.toLowerCase().includes("growth") || query.toLowerCase().includes("increase")) {
      return `The observed growth pattern is driven by several key factors:

• **Market Demand**: Strong global and regional demand, particularly from Asian markets
• **Competitive Pricing**: Abu Dhabi's competitive pricing strategy has enhanced market share
• **Trade Agreements**: Recent UAE-India CEPA and other bilateral agreements facilitating easier market access
• **Infrastructure**: Improved port facilities and logistics capabilities at KIZAD and KEZAD

**Key Drivers:**
- Increased production capacity in the aluminum and petrochemical sectors
- Strategic positioning as a regional trade hub
- Favorable exchange rates supporting export competitiveness
- Government initiatives promoting non-oil trade diversification

**Outlook:**
The growth trajectory is expected to continue in Q2-Q3 2026, supported by sustained global demand and ongoing infrastructure investments.`;
    }

    if (query.toLowerCase().includes("decline") || query.toLowerCase().includes("decrease") || query.toLowerCase().includes("-")) {
      return `The decline can be attributed to multiple interconnected factors:

• **Global Economic Slowdown**: Reduced consumer demand in key import markets
• **Supply Chain Disruptions**: Red Sea shipping constraints affecting import volumes
• **Seasonal Factors**: Normal seasonal variation in trade patterns
• **Market Saturation**: Inventory buildup in previous quarters reducing current demand

**Impact Analysis:**
- Automotive sector particularly affected due to global chip shortage
- Pharmaceutical imports reduced as domestic production increases
- Consumer confidence affecting discretionary purchases

**Mitigation Strategies:**
1. Explore alternative markets to diversify trade partners
2. Focus on value-added sectors with higher margins
3. Strengthen domestic manufacturing to reduce import dependency
4. Monitor recovery indicators for strategic planning`;
    }

    // Default response
    return `Based on the current trade data and market analysis:

**Key Observations:**
• The trade pattern reflects broader economic trends in the UAE and global markets
• Abu Dhabi's strategic position as a trade hub continues to provide competitive advantages
• Recent policy initiatives are positively impacting trade flows

**Analysis:**
The observed trends are consistent with seasonal patterns and global economic conditions. The diversification strategy in the non-oil sector is showing positive results, with particular strength in manufacturing and re-export activities.

**Recommendations:**
1. Continue monitoring key trade indicators for early warning signals
2. Leverage trade agreements to maximize market access
3. Invest in digital trade infrastructure for enhanced efficiency
4. Strengthen partnerships with strategic trading partners

For more detailed analysis specific to your query, please consult with the trade analytics team or review the detailed sector reports available in the Publications section.`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className={cn(
          "flex h-full w-full max-w-[min(100vw,500px)] flex-col gap-0 border-l border-[#2e4567] bg-[#0f2744] p-0 text-slate-100 shadow-xl sm:max-w-[500px]",
          "[&>button.absolute]:hidden",
        )}
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-[#2e4567] px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2 shadow-sm">
                <Sparkles className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <SheetTitle className="text-lg font-semibold leading-tight text-slate-100">
                  Trade AI Assistant
                </SheetTitle>
                <p className="mt-1 text-sm text-slate-400">AI-powered trade insights</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:bg-[#163252] hover:text-white"
              onClick={onClose}
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <div className="rounded-lg border border-[#2e4567] bg-[#0b1f38] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-300/90">
                Your question
              </div>
              <p className="text-sm leading-relaxed text-slate-200">{question}</p>
            </div>

            <div className="rounded-lg border border-[#2e4567] bg-[#071a2e] p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                AI analysis
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 animate-pulse rounded bg-[#163252]" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-[#163252]" />
                  <div className="h-4 w-4/6 animate-pulse rounded bg-[#163252]" />
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-line text-slate-300">
                  {response}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#2e4567] px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-[#365985] bg-[#0d2747] text-slate-100 hover:bg-[#143359] hover:text-white"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              className="flex-1 bg-[#1f4f84] text-white hover:bg-[#29639f]"
              onClick={() => {
                onClose();
                navigate("/trade-ai");
              }}
            >
              Open full analysis
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
