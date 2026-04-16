import { X, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

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
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: getAIResponse(inputValue),
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
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Trade AI Assistant</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-purple-700 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about trade data..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-700"
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
