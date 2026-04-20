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
    path: "/Foreign-Trade-Inventory/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: InterpretPage },
      { path: "/Foreign-Trade-Inventory/overview", Component: InterpretPage },
      { path: "/Foreign-Trade-Inventory/diagnose", Component: DiagnosePage },
      { path: "/Foreign-Trade-Inventory/benchmark", Component: BenchmarkPage },
      { path: "/Foreign-Trade-Inventory/observe", Component: ObservePage },
      { path: "/Foreign-Trade-Inventory/observe/category/:categorySlug/article/:articleSlug", Component: CategoryTradeDetailPage },
      { path: "/Foreign-Trade-Inventory/observe/category/:categorySlug", Component: CategoryTradeDetailPage },
      { path: "/Foreign-Trade-Inventory/trade-ai", Component: TradeAIPage },
      { path: "/Foreign-Trade-Inventory/official-statistics", Component: OfficialStatisticsPage },
      { path: "/Foreign-Trade-Inventory/indicator/:id", Component: IndicatorDetailPage },
      { path: "/Foreign-Trade-Inventory/compare-indicators", Component: CompareIndicatorsPage },
      { path: "/Foreign-Trade-Inventory/publications", Component: PublicationsPage },
      { path: "/Foreign-Trade-Inventory/publication/:id", Component: PublicationPage },
    ],
  },
]);