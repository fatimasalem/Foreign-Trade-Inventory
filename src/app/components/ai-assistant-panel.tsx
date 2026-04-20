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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              Trade AI Assistant
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Question */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-xs font-semibold text-purple-900 mb-2">Your Question</div>
            <p className="text-sm text-purple-800">{question}</p>
          </div>

          {/* Response */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-900 mb-3">AI Analysis</div>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {response}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => {
                onClose();
                navigate("/Foreign-Trade-Inventory/trade-ai");
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
