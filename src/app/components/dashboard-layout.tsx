import { useState } from "react";
import { Outlet } from "react-router";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { AIAssistantProvider, useAIAssistant } from "../contexts/ai-assistant-context";
import { AIAssistantPanel } from "./ai-assistant-panel";

function DashboardLayoutContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isOpen, question, closeAIAssistant } = useAIAssistant();

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 via-background to-muted/20">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 p-4 transition-[margin] duration-300 ease-out sm:p-6 md:p-8 ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
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
