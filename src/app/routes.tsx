import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/dashboard-layout";
import { InterpretPage } from "./pages/interpret-page";
import { DiagnosePage } from "./pages/diagnose-page";
import { BenchmarkPage } from "./pages/benchmark-page";
import { ObservePage } from "./pages/observe-page";
import { CategoryTradeDetailPage } from "./pages/category-trade-detail-page";
import { TradeAIPage } from "./pages/trade-ai-page";
import { PublicationPage } from "./pages/publication-page";
import { PublicationsPage } from "./pages/publications-page";
import { OfficialStatisticsPage } from "./pages/official-statistics-page";
import { IndicatorDetailPage } from "./pages/indicator-detail-page";
import { CompareIndicatorsPage } from "./pages/compare-indicators-page";
import { ForecastPage } from "./pages/forecast-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: InterpretPage },
      { path: "overview", Component: InterpretPage },
      { path: "diagnose", Component: DiagnosePage },
      { path: "benchmark", Component: BenchmarkPage },
      { path: "observe", Component: ObservePage },
      { path: "observe/category/:categorySlug/article/:articleSlug", Component: CategoryTradeDetailPage },
      { path: "observe/category/:categorySlug", Component: CategoryTradeDetailPage },
      { path: "trade-ai", Component: TradeAIPage },
      { path: "official-statistics", Component: OfficialStatisticsPage },
      { path: "indicator/:id", Component: IndicatorDetailPage },
      { path: "compare-indicators", Component: CompareIndicatorsPage },
      { path: "publications", Component: PublicationsPage },
      { path: "publication/:id", Component: PublicationPage },
    ],
  },
]);