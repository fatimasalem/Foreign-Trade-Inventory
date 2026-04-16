import { Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function KeyImpactSection() {
  const impacts = [
    {
      category: "Precious Stones & Metals",
      hsCode: "HS71",
      change: "+45.2%",
      type: "increase" as const,
      driver: "Gold re-export activity surge due to global price volatility",
      recommendation: "Monitor for sustainability; potential reversal if prices stabilize",
    },
    {
      category: "Aluminum & Articles",
      hsCode: "HS76",
      change: "+32.8%",
      type: "increase" as const,
      driver: "Increased demand from China infrastructure projects",
      recommendation: "Opportunity to secure long-term export contracts",
    },
    {
      category: "Vehicles & Parts",
      hsCode: "HS87",
      change: "-18.5%",
      type: "decrease" as const,
      driver: "Reduced consumer spending and high interest rates",
      recommendation: "Expected to normalize in Q3 as interest rates stabilize",
    },
    {
      category: "Electrical Machinery",
      hsCode: "HS85",
      change: "-12.3%",
      type: "decrease" as const,
      driver: "Delayed shipments due to Red Sea supply chain disruptions",
      recommendation: "Temporary effect; recovery expected by May 2026",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-900 mb-4">Key Impact Categories</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {impacts.map((impact, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">{impact.category}</div>
                  <div className="text-sm text-gray-500">{impact.hsCode}</div>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 font-semibold ${
                  impact.type === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {impact.type === "increase" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {impact.change}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Driver</div>
                <div className="text-sm text-gray-700">{impact.driver}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Recommendation</div>
                <div className="text-sm text-gray-700">{impact.recommendation}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
