import { useParams } from "react-router";
import { Calendar, User, Download, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";

export function PublicationPage() {
  const { id } = useParams();

  const publications: Record<string, { title: string; date: string; author: string; content: string }> = {
    "1": {
      title: "Q1 2026 Foreign Trade Report",
      date: "April 5, 2026",
      author: "Abu Dhabi Department of Economic Development",
      content: `
        <p>The first quarter of 2026 has shown remarkable resilience in Abu Dhabi's non-oil foreign trade sector, with total trade volumes reaching AED 105.4 billion, representing a 4.2% month-over-month increase.</p>

        <h2>Executive Summary</h2>
        <p>Abu Dhabi Emirate's foreign trade performance in Q1 2026 demonstrates strong economic fundamentals and strategic positioning in global markets. The quarter was marked by significant growth in non-oil exports, particularly in the aluminum and petrochemical sectors, while imports saw a moderate decline due to reduced consumer goods demand.</p>

        <h2>Key Highlights</h2>
        <ul>
          <li>Non-oil exports increased by 12.3% MoM, reaching AED 28.7 billion</li>
          <li>Non-oil re-exports grew by 3.2% to AED 31.5 billion</li>
          <li>Non-oil imports declined by 5.8% to AED 45.2 billion</li>
          <li>Net trade balance improved by 18.5% to AED 15.0 billion</li>
          <li>Trade with 142 countries across all continents</li>
        </ul>

        <h2>Sectoral Performance</h2>
        <h3>Top Performing Sectors</h3>
        <p><strong>Aluminum and Articles (HS76):</strong> Exports in this category surged by 32.8%, driven by increased demand from China's infrastructure projects. The sector accounted for AED 8.2 billion in exports, making it the leading export category for the quarter.</p>

        <p><strong>Precious Stones and Metals (HS71):</strong> Re-exports of precious stones and metals experienced exceptional growth of 45.2%, reaching AED 7.5 billion. This increase is attributed to gold price volatility and Abu Dhabi's strategic position as a regional trading hub.</p>

        <p><strong>Organic Chemicals (HS29):</strong> Petrochemical exports showed steady growth at 8.5%, benefiting from stable oil prices around $85/barrel and strong global demand.</p>

        <h3>Sectors Requiring Attention</h3>
        <p><strong>Vehicles and Parts (HS87):</strong> Imports in this category declined by 18.5% to AED 12.3 billion, reflecting reduced consumer spending and higher interest rates impacting the automotive sector.</p>

        <p><strong>Pharmaceutical Products (HS30):</strong> A 12.3% decrease in imports was observed, primarily due to Red Sea supply chain disruptions causing delays in shipments from European markets.</p>

        <h2>Regional Analysis</h2>
        <h3>GCC Markets</h3>
        <p>Abu Dhabi maintained its position as the third-largest trading economy in the GCC, after Saudi Arabia and Qatar. Intra-GCC trade increased by 6.8%, with Saudi Arabia remaining the largest regional trading partner, accounting for 22% of regional trade.</p>

        <h3>International Markets</h3>
        <p><strong>China:</strong> Trade with China reached AED 22.5 billion, representing 21.3% of total trade. The relationship was bolstered by increased aluminum exports and machinery imports.</p>

        <p><strong>India:</strong> Following the implementation of the UAE-India trade agreement, bilateral trade grew by 15.2% to AED 18.3 billion, with pharmaceutical and textile sectors benefiting from reduced tariffs.</p>

        <p><strong>European Union:</strong> Trade with EU countries faced challenges due to Red Sea shipping disruptions, resulting in a 8.5% decline to AED 12.8 billion.</p>

        <h2>Trade Infrastructure</h2>
        <p>Abu Dhabi's free zones, particularly KIZAD (Khalifa Industrial Zone Abu Dhabi) and KEZAD (Khalifa Economic Zone Abu Dhabi), reported a 20% increase in cargo handling capacity. Khalifa Port continued its expansion, handling 12.5 million TEUs in Q1, a 22.5% increase compared to Q4 2025.</p>

        <h2>Economic Outlook</h2>
        <p>Looking ahead to Q2 2026, we anticipate:</p>
        <ul>
          <li>Continued strong performance in aluminum exports, supported by China's infrastructure spending</li>
          <li>Gradual normalization of supply chains as Red Sea shipping routes stabilize</li>
          <li>Potential recovery in automotive imports as interest rates stabilize</li>
          <li>Further benefits from bilateral trade agreements, particularly with India and Asian markets</li>
        </ul>

        <h2>Policy Recommendations</h2>
        <ol>
          <li><strong>Diversification:</strong> Continue efforts to diversify export base beyond traditional sectors, focusing on high-tech manufacturing and green industries.</li>
          <li><strong>Supply Chain Resilience:</strong> Develop contingency plans and alternative sourcing strategies to mitigate global supply chain disruptions.</li>
          <li><strong>Free Trade Agreements:</strong> Accelerate negotiations and implementation of new FTAs to expand market access for Abu Dhabi exporters.</li>
          <li><strong>Digital Trade:</strong> Invest in digital infrastructure and e-commerce platforms to facilitate cross-border trade.</li>
          <li><strong>Sustainability:</strong> Align trade policies with UAE's net-zero commitments, promoting green exports and sustainable trade practices.</li>
        </ol>

        <h2>Conclusion</h2>
        <p>Q1 2026 has demonstrated Abu Dhabi's economic resilience and strategic positioning in global markets. While challenges remain, particularly in managing supply chain disruptions and addressing sector-specific headwinds, the overall trajectory remains positive. The emirate's investment in infrastructure, strategic free trade agreements, and diversification efforts position it well for continued growth in the coming quarters.</p>
      `,
    },
    "2": {
      title: "Non-Oil Export Trends Analysis",
      date: "March 28, 2026",
      author: "Abu Dhabi Statistics Centre",
      content: `
        <p>This comprehensive analysis examines the trends and drivers behind Abu Dhabi's non-oil export performance, providing insights into sector dynamics and future opportunities.</p>

        <h2>Overview</h2>
        <p>Non-oil exports have emerged as a critical pillar of Abu Dhabi's economic diversification strategy. In recent months, the sector has demonstrated resilience and growth, with exports reaching AED 28.7 billion in March 2026.</p>

        <h2>Key Trends</h2>
        <h3>1. Industrial Sector Dominance</h3>
        <p>Aluminum and petrochemical sectors continue to lead export growth, accounting for 45% of total non-oil exports. This reflects the success of Abu Dhabi's industrial strategy and investments in manufacturing capacity.</p>

        <h3>2. Geographic Diversification</h3>
        <p>While traditional markets in Asia remain important, Abu Dhabi has successfully expanded exports to emerging markets in Africa and Latin America, reducing dependency on any single market.</p>

        <h3>3. Value-Added Products</h3>
        <p>There has been a noticeable shift towards higher value-added products, with processed goods now representing 62% of exports compared to 48% five years ago.</p>
      `,
    },
    "3": {
      title: "Trade Balance Summary - March 2026",
      date: "March 22, 2026",
      author: "Department of Economic Development",
      content: `
        <p>Abu Dhabi's trade balance showed significant improvement in March 2026, with net trade reaching AED 15.0 billion, an 18.5% increase from the previous month.</p>

        <h2>Trade Balance Components</h2>
        <h3>Exports</h3>
        <p>Total exports (including re-exports) reached AED 60.2 billion, driven by strong performance in aluminum and precious metals sectors.</p>

        <h3>Imports</h3>
        <p>Imports stood at AED 45.2 billion, showing a moderate decline due to reduced consumer goods demand and ongoing supply chain adjustments.</p>

        <h2>Implications</h2>
        <p>The improved trade balance reflects Abu Dhabi's growing competitiveness in global markets and the success of economic diversification efforts.</p>
      `,
    },
    "4": {
      title: "Annual Trade Statistics 2025",
      date: "February 15, 2026",
      author: "Abu Dhabi Department of Economic Development",
      content: `
        <p>The 2025 Annual Trade Statistics provide a comprehensive overview of Abu Dhabi's trade performance throughout the year.</p>

        <h2>2025 Highlights</h2>
        <ul>
          <li>Total trade volume: AED 1.2 trillion</li>
          <li>Non-oil sector contributed 68% of total trade</li>
          <li>Trade with 156 countries worldwide</li>
          <li>15% year-over-year growth in non-oil exports</li>
        </ul>

        <h2>Sector Performance</h2>
        <p>The manufacturing sector led growth, with particular strength in aluminum, petrochemicals, and technology products. Services exports also showed promising growth, up 22% year-over-year.</p>

        <h2>Looking Ahead to 2026</h2>
        <p>Based on 2025 performance and current trends, we project continued growth in 2026, with non-oil exports expected to increase by 10-12%.</p>
      `,
    },
  };

  const publication = publications[id || "1"];

  if (!publication) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-2xl font-bold">Publication not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {publication.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{publication.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{publication.author}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900 prose-headings:font-semibold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-gray-700 prose-li:mb-2
              prose-strong:text-gray-900 prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: publication.content }}
          />
        </div>
      </article>
    </div>
  );
}
