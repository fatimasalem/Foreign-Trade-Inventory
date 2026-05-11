import { useState, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function TradeAIPage() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Trade AI assistant. I can help you analyze foreign trade data, interpret trends, and provide insights about Abu Dhabi's trade performance. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const generateAIResponse = useCallback((question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("opec") && lowerQuestion.includes("petrochemical")) {
      return "The OPEC+ production cuts extension announced on April 8, 2026, is expected to have a significant positive impact on Abu Dhabi's petrochemical sector:\n\n**Key Impacts:**\n\n1. **Price Stabilization**: Production cuts are expected to maintain Brent crude prices at $85-90/barrel, providing price stability for petrochemical feedstock.\n\n2. **Export Growth**: Petrochemical exports are projected to increase by 8-10% in Q2 2026 as global prices improve.\n\n3. **Competitive Advantage**: Stable oil prices enhance Abu Dhabi's competitive position in global petrochemical markets.\n\n**Recommended Actions:**\n- Secure long-term export contracts during this favorable pricing period\n- Monitor OPEC+ compliance rates for price volatility indicators\n- Expand capacity utilization to maximize export opportunities";
    }

    if (lowerQuestion.includes("uae-india") || lowerQuestion.includes("pharmaceutical")) {
      return "The UAE-India Trade Agreement implementation on April 5, 2026, creates significant opportunities for Abu Dhabi's pharmaceutical and textile sectors:\n\n**Pharmaceutical Impact:**\n- Tariff reductions of 15-20% on key pharmaceutical exports to India\n- Expected export growth of 25-30% over the next 12 months\n- India represents a $1.5B annual market opportunity\n\n**Textile Impact:**\n- Reduced tariffs making Abu Dhabi textiles more competitive\n- Potential to capture 5-8% of India's textile import market\n\n**Strategic Recommendations:**\n- Focus on high-margin pharmaceutical products\n- Establish direct distribution channels in major Indian cities\n- Leverage free zones for India-focused manufacturing";
    }

    if (lowerQuestion.includes("red sea") && lowerQuestion.includes("supply chain")) {
      return "The Red Sea supply chain disruptions since April 2, 2026, are creating significant challenges for Abu Dhabi's import operations:\n\n**Current Impact:**\n- 2-3 week shipping delays affecting consumer goods imports\n- Container rates increased by 8% due to longer alternative routes\n- Import costs up 12-15% for goods from European markets\n\n**Categories Most Affected:**\n- Consumer electronics (HS85): -12.3% MoM\n- Vehicles & parts (HS87): -18.5% MoM\n- Pharmaceutical products (HS30): -12.3% MoM\n\n**Mitigation Strategies:**\n- Diversify sourcing to Asia-Pacific suppliers\n- Build 60-90 day inventory buffers for critical goods\n- Consider air freight for high-value, time-sensitive items\n- Expected normalization by May-June 2026";
    }

    if (lowerQuestion.includes("china") && lowerQuestion.includes("aluminum")) {
      return "China's infrastructure stimulus announced on March 28, 2026, is creating strong demand for Abu Dhabi's aluminum exports:\n\n**Demand Impact:**\n- Aluminum export growth of +32.8% MoM already observed\n- China's infrastructure spending of $850B creates sustained demand\n- Expected to maintain strong growth through Q2-Q3 2026\n\n**Market Opportunity:**\n- China now represents 35% of Abu Dhabi's aluminum export market\n- High-grade aluminum products seeing premium pricing (+8%)\n- Long-term contracts being secured at favorable terms\n\n**Strategic Outlook:**\n- Peak demand expected in Q2 2026\n- Gradual moderation in Q4 as initial stimulus effects taper\n- Recommend securing multi-year contracts during current favorable period\n\n**Production Capacity:**\n- Current utilization at 92%\n- Room for 8-10% expansion to meet demand";
    }

    if (lowerQuestion.includes("export") && lowerQuestion.includes("growth")) {
      return "The recent export growth of +12.3% MoM is primarily driven by three key factors:\n\n1. **Aluminum Sector Surge**: A 32.8% increase in aluminum exports due to strong demand from China's infrastructure projects.\n\n2. **Petrochemical Performance**: Stable oil prices around $85/barrel have supported petrochemical export competitiveness.\n\n3. **Free Zone Expansion**: KIZAD and KEZAD have reported 20% increases in cargo handling, facilitating export operations.\n\nThe growth is sustainable as long as global demand remains stable and supply chains continue to improve.";
    }

    if (lowerQuestion.includes("attention") || lowerQuestion.includes("categories")) {
      return "Based on current data, 9 categories require attention:\n\n**Critical (3 categories):**\n- HS71 (Precious stones/metals): +45.2% MoM - volatile due to gold price fluctuations\n- HS87 (Vehicles & parts): -18.5% MoM - declining consumer demand\n- HS30 (Pharmaceutical products): -12.3% MoM - supply chain disruptions\n\n**Recommended Actions:**\n- Monitor HS71 closely for price stabilization\n- Investigate root causes of HS87 decline\n- Coordinate with suppliers to resolve HS30 supply issues";
    }

    if (lowerQuestion.includes("gcc") || lowerQuestion.includes("compare")) {
      return "Abu Dhabi's trade performance relative to GCC countries:\n\n**Ranking:** 3rd in non-oil exports after Saudi Arabia and Qatar\n\n**Strengths:**\n- Growth rate of +12.3% exceeds GCC average of +8.5%\n- Market share of 18.2% in GCC non-oil exports\n- Strong performance in aluminum and petrochemicals\n\n**Opportunities:**\n- Close gap with Qatar (currently 8% behind)\n- Leverage free trade agreements more effectively\n- Expand into high-tech manufacturing sectors";
    }

    if (lowerQuestion.includes("forecast") || lowerQuestion.includes("q2")) {
      return "The forecast for Q2 2026 non-oil exports:\n\n**Base Case Scenario (50% probability):**\n- Expected growth: +8.5% quarter-over-quarter\n- Projected value: AED 92.4B by end of Q2\n\n**Key Assumptions:**\n- Oil prices remain stable at $80-90/barrel\n- China GDP growth at 4.5-5.0%\n- No major supply chain disruptions\n\n**Optimistic Scenario (+15.2%):** If global demand strengthens and supply chains fully normalize\n\n**Risk Factors:** Geopolitical tensions, shipping cost increases, currency fluctuations";
    }

    return "I've analyzed your question. Based on the current foreign trade data for Abu Dhabi Emirate, here are some key insights:\n\n- Non-oil exports are showing strong growth at +12.3% MoM\n- The trade balance has improved by AED 8.2B\n- 9 categories require critical attention\n- Overall trade outlook remains positive for Q2 2026\n\nWould you like me to provide more specific details on any particular aspect?";
  }, []);

  const handleSendMessage = useCallback(
    (messageText?: string) => {
      const text = typeof messageText === "string" ? messageText : inputValue;
      if (!text || !text.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse = generateAIResponse(text);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);
    },
    [inputValue, generateAIResponse],
  );

  // Handle incoming query from navigation (one-shot; avoid deps that re-run after replaceState and cancel the timer)
  useEffect(() => {
    if (location.state?.query && typeof location.state.query === "string") {
      const q = location.state.query;
      setInputValue(q);
      setTimeout(() => {
        handleSendMessage(q);
      }, 500);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only react to navigation payload
  }, [location.state]);

  const suggestedQuestions = [
    "What are the key drivers behind the recent export growth?",
    "Which HS categories need attention this month?",
    "Compare Abu Dhabi's trade performance with other GCC countries",
    "What is the forecast for non-oil exports in Q2 2026?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#2a3d5f] bg-[#0a1d35] text-slate-100 shadow-[0_14px_38px_rgba(2,8,25,0.45)]">
      <div className="shrink-0 border-b border-[#2a3d5f] px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-cyan-500/35 bg-cyan-500/15 p-2">
            <Sparkles className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-cyan-300 md:text-xl">Trade AI Assistant</h2>
            <p className="text-sm text-slate-400">Ask me anything about foreign trade data and insights</p>
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-[#07182c]">
        <div className="space-y-6 p-5 md:p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="h-fit rounded-full border border-[#3d5b80] bg-[#112d4c] p-2">
                  <Bot className="h-5 w-5 text-cyan-300" />
                </div>
              )}
              <div
                className={`max-w-[min(100%,28rem)] rounded-xl border px-4 py-3 ${
                  message.role === "user"
                    ? "border-[#2e6bab] bg-[#153a63] text-slate-50"
                    : "border-[#355279] bg-[#112d4c] text-slate-100"
                }`}
              >
                <div className="whitespace-pre-line text-sm leading-relaxed">{message.content}</div>
                <div
                  className={`mt-2 text-xs ${message.role === "user" ? "text-slate-300" : "text-slate-500"}`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {message.role === "user" && (
                <div className="h-fit rounded-full border border-[#3d5b80] bg-[#143252] p-2">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="h-fit rounded-full border border-[#3d5b80] bg-[#112d4c] p-2">
                <Bot className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="rounded-xl border border-[#355279] bg-[#112d4c] px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:120ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && (
        <div className="shrink-0 border-t border-[#2a3d5f] px-5 pb-4 pt-3 md:px-6">
          <div className="mb-2 text-sm font-medium text-slate-300">Suggested questions</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestedQuestion(question)}
                className="rounded-lg border border-[#355279] bg-[#112d4c] p-3 text-left text-sm text-slate-200 transition-colors hover:border-[#3f628c] hover:bg-[#153457]"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-[#2a3d5f] bg-[#0a1d35] px-5 py-4 md:px-6">
        <div className="flex gap-3">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about trade data, trends, or insights..."
            className="min-h-[60px] resize-none border-[#3b5b82] bg-[#112d4c] text-slate-100 placeholder:text-slate-500 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="h-[60px] shrink-0 border border-cyan-600/50 bg-cyan-700/80 px-5 text-white hover:bg-cyan-600 disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}
