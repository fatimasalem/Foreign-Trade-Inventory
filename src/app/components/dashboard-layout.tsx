import { Outlet } from "react-router";
import { DashboardHeader } from "./dashboard-header";
import { AIAssistantProvider, useAIAssistant } from "../contexts/ai-assistant-context";
import { AIAssistantPanel } from "./ai-assistant-panel";

function DashboardLayoutContent() {
  const { isOpen, question, closeAIAssistant } = useAIAssistant();

  return (
    <div className="dark min-h-screen bg-[radial-gradient(circle_at_top,#0f2a47_0%,#091a31_45%,#071325_100%)]">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <DashboardHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="dashboard-theme px-4 pb-8 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-7"
      >
        <div className="mx-auto max-w-[1600px]">
          <Outlet />
        </div>
      </main>
      <AIAssistantPanel
        isOpen={isOpen}
        onClose={closeAIAssistant}
        question={question}
      />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <AIAssistantProvider>
      <DashboardLayoutContent />
    </AIAssistantProvider>
  );
}
