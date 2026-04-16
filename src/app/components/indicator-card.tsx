import { AlertCircle, AlertTriangle, Eye, CheckCircle, BarChart, Lightbulb } from "lucide-react";
import { IndicatorListCard } from "./indicator-list-card";

interface IndicatorItem {
  name: string;
  value: string;
  change: string;
  changeType: "MoM" | "YoY";
}

interface IndicatorCardProps {
  type: "total" | "critical" | "warning" | "watch" | "stable";
  label: string;
  count: number;
  description: string;
  items: IndicatorItem[];
  tradeType?: string;
  classification?: string;
}

export function IndicatorCard({ type, label, count, description, items, tradeType = "all", classification = "HS" }: IndicatorCardProps) {
  const config = {
    total: {
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-500",
      icon: BarChart,
      textColor: "text-gray-900",
    },
    critical: {
      bgColor: "bg-red-50",
      iconBg: "bg-red-500",
      icon: AlertCircle,
      textColor: "text-gray-900",
    },
    warning: {
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-500",
      icon: AlertTriangle,
      textColor: "text-gray-900",
    },
    watch: {
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-500",
      icon: Eye,
      textColor: "text-gray-900",
    },
    stable: {
      bgColor: "bg-green-50",
      iconBg: "bg-green-500",
      icon: CheckCircle,
      textColor: "text-gray-900",
    },
  };

  const { bgColor, iconBg, icon: Icon, textColor } = config[type];

  const getChangeColor = (change: string) => {
    if (change.startsWith("+")) return "text-green-600";
    if (change.startsWith("-")) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className={`${bgColor} rounded-lg p-4 border border-gray-200 ${items.length > 0 ? 'h-full' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${iconBg} rounded-md p-1.5`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm text-gray-700 font-medium">{label}</span>
      </div>
      <div className={`text-3xl font-semibold ${textColor} mb-1`}>{count}</div>
      <div className="text-xs text-gray-600 mb-3">{description}</div>
      
      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-300/50">
          <div className="grid grid-cols-1 gap-2">
            {items.map((item, index) => (
              <IndicatorListCard
                key={index}
                name={item.name}
                value={item.value}
                change={item.change}
                changeType={item.changeType}
                tradeType={tradeType}
                classification={classification}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}