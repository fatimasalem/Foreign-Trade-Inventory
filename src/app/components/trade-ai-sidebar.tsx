import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";

interface TradeAISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function TradeAISidebar({ isOpen, onClose }: TradeAISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Trade AI assistant. How can I help you analyze foreign trade data today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const sentText = inputValue;
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: getAIResponse(sentText),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("export") || lowerQuery.includes("exports")) {
      return "Based on March 2026 data, non-oil exports reached AED 28.7B with a strong 12.3% MoM growth. The top performers are Aluminum & Articles (+32.8%) and Precious Stones/Metals (+45.2%). Would you like more detailed analysis on specific categories?";
    } else if (lowerQuery.includes("import") || lowerQuery.includes("imports")) {
      return "Non-oil imports totaled AED 45.2B in March 2026, showing a -5.8% MoM decline. The main contributors to this decrease were Vehicles & Parts (-18.5%) and Pharmaceutical Products (-12.3%). This appears to be a seasonal adjustment. Need specific sector insights?";
    } else if (lowerQuery.includes("balance") || lowerQuery.includes("trade balance")) {
      return "The net trade balance improved significantly to AED 15.0B, marking an 18.5% MoM increase. This positive trend is driven by strong export performance coupled with controlled import levels. The balance has been improving consistently over the last 3 months.";
    } else if (lowerQuery.includes("china") || lowerQuery.includes("india") || lowerQuery.includes("partner")) {
      return "Top trade partners for March 2026: China (AED 22.5B), India (AED 18.3B), USA (AED 12.8B), and Saudi Arabia (AED 10.2B). China and India together account for 38.6% of total trade volume. Would you like a breakdown by trade type?";
    } else {
      return "I can help you analyze trade data including exports, imports, trade balance, top partners, and category-specific trends. What specific aspect would you like to explore?";
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 transition-opacity"
          aria-hidden
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed right-0 z-[60] flex w-full max-w-md flex-col border-l border-[#2e4567] bg-[#0f2744] text-slate-100 shadow-xl transition-transform duration-300 ease-in-out",
          "top-0 h-full md:top-[73px] md:h-[calc(100vh-73px)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-[#2e4567] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2 shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold leading-tight text-slate-100">Trade AI Assistant</h2>
                  <p className="mt-0.5 text-sm text-slate-400">Quick answers from trade data</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-slate-400 hover:bg-[#163252] hover:text-white"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "ai" && (
                  <div className="mt-0.5 shrink-0 rounded-full bg-sky-500/15 p-2">
                    <Bot className="h-4 w-4 text-sky-300" aria-hidden />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2.5",
                    message.sender === "user"
                      ? "bg-[#1f4f84] text-white"
                      : "border border-[#2e4567] bg-[#0b1f38] text-slate-200",
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      message.sender === "user" ? "text-blue-100/80" : "text-slate-500",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.sender === "user" && (
                  <div className="mt-0.5 shrink-0 rounded-full bg-slate-600/40 p-2">
                    <User className="h-4 w-4 text-slate-300" aria-hidden />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-[#2e4567] bg-[#0b1f38]/80 px-5 py-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Ask about trade data..."
                className="flex-1 border-[#2e4567] bg-[#0f2744] text-slate-100 placeholder:text-slate-500 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/30"
              />
              <Button
                type="button"
                onClick={handleSendMessage}
                className="shrink-0 bg-[#1f4f84] px-4 text-white hover:bg-[#29639f]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
