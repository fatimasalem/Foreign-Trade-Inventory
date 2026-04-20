export type PublicationExcelSheet = {
  name: string;
  rows: (string | number)[][];
};

export type PublicationRecord = {
  title: string;
  date: string;
  author: string;
  excelFileName: string;
  sheets: PublicationExcelSheet[];
};

export const publicationSummaries: { id: string; title: string; date: string }[] = [
  { id: "1", title: "Q1 2026 Foreign Trade Report", date: "April 5, 2026" },
  { id: "2", title: "Non-Oil Export Trends Analysis", date: "March 28, 2026" },
  { id: "3", title: "Trade Balance Summary - March 2026", date: "March 22, 2026" },
  { id: "4", title: "Annual Trade Statistics 2025", date: "February 15, 2026" },
];

function sheet(
  name: string,
  rows: (string | number)[][],
): PublicationExcelSheet {
  return { name, rows };
}

export const publications: Record<string, PublicationRecord> = {
  "1": {
    title: "Q1 2026 Foreign Trade Report",
    date: "April 5, 2026",
    author: "Abu Dhabi Department of Economic Development",
    excelFileName: "Q1-2026-Foreign-Trade-Report.xlsx",
    sheets: [
      sheet("Summary", [
        ["Metric", "Value (AED bn)", "MoM %"],
        ["Total foreign trade", 105.4, 4.2],
        ["Non-oil exports", 28.7, 12.3],
        ["Non-oil re-exports", 31.5, 3.2],
        ["Non-oil imports", 45.2, -5.8],
        ["Net trade balance", 15.0, 18.5],
      ]),
      sheet("Sector breakdown", [
        ["HS section", "Description", "Exports (AED bn)", "Share %"],
        ["76", "Aluminum and articles", 8.2, 28.6],
        ["71", "Precious stones and metals", 7.5, 26.1],
        ["29", "Organic chemicals", 4.1, 14.3],
        ["87", "Vehicles and parts (imports)", 12.3, 27.2],
        ["30", "Pharmaceutical products (imports)", 2.1, 4.6],
      ]),
      sheet("Partner economies", [
        ["Partner", "Total trade (AED bn)", "Share %", "YoY %"],
        ["China", 22.5, 21.3, 8.1],
        ["India", 18.3, 17.4, 15.2],
        ["Saudi Arabia", 14.1, 13.4, 6.8],
        ["EU (aggregate)", 12.8, 12.1, -8.5],
        ["United States", 9.2, 8.7, 3.4],
      ]),
    ],
  },
  "2": {
    title: "Non-Oil Export Trends Analysis",
    date: "March 28, 2026",
    author: "Abu Dhabi Statistics Centre",
    excelFileName: "Non-Oil-Export-Trends-Analysis.xlsx",
    sheets: [
      sheet("Monthly index", [
        ["Month", "Index (2020=100)", "YoY %"],
        ["Oct 2025", 118.2, 9.1],
        ["Nov 2025", 119.4, 9.8],
        ["Dec 2025", 120.1, 10.2],
        ["Jan 2026", 121.0, 11.0],
        ["Feb 2026", 122.3, 11.5],
        ["Mar 2026", 124.0, 12.1],
      ]),
      sheet("HS chapters (top)", [
        ["HS2", "Label", "Share of non-oil exports %"],
        ["76", "Aluminum", 18.4],
        ["71", "Precious metals", 15.2],
        ["29", "Organic chemicals", 11.0],
        ["39", "Plastics", 8.7],
        ["84", "Machinery", 7.9],
      ]),
    ],
  },
  "3": {
    title: "Trade Balance Summary - March 2026",
    date: "March 22, 2026",
    author: "Department of Economic Development",
    excelFileName: "Trade-Balance-Summary-March-2026.xlsx",
    sheets: [
      sheet("Components", [
        ["Flow", "March 2026 (AED bn)", "Feb 2026 (AED bn)", "MoM %"],
        ["Total exports (incl. re-exports)", 60.2, 58.9, 2.2],
        ["Goods imports", 45.2, 46.1, -2.0],
        ["Net trade balance", 15.0, 12.8, 17.2],
      ]),
      sheet("Balance history", [
        ["Period", "Balance (AED bn)", "3-mo avg"],
        ["Q4 2025", 11.2, 10.8],
        ["Jan 2026", 12.1, 11.4],
        ["Feb 2026", 12.8, 12.0],
        ["Mar 2026", 15.0, 13.3],
      ]),
    ],
  },
  "4": {
    title: "Annual Trade Statistics 2025",
    date: "February 15, 2026",
    author: "Abu Dhabi Department of Economic Development",
    excelFileName: "Annual-Trade-Statistics-2025.xlsx",
    sheets: [
      sheet("Annual totals", [
        ["Indicator", "2024", "2025", "YoY %"],
        ["Total trade (AED bn)", 1080.0, 1200.0, 11.1],
        ["Non-oil share of trade %", 65.0, 68.0, "—"],
        ["Partner economies (count)", 148, 156, 5.4],
      ]),
      sheet("Sector (non-oil)", [
        ["Sector group", "2025 exports (AED bn)", "YoY %"],
        ["Manufacturing", 312.0, 15.0],
        ["Wholesale & retail", 198.0, 9.2],
        ["Transport & storage", 87.0, 22.0],
      ]),
      sheet("Top partners 2025", [
        ["Rank", "Partner", "Trade (AED bn)"],
        [1, "China", 88.0],
        [2, "India", 72.0],
        [3, "Saudi Arabia", 61.0],
        [4, "United States", 44.0],
        [5, "Germany", 31.0],
      ]),
    ],
  },
};
