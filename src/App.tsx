import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { AppProvider, useAppContext } from "./contexts/AppContext";

import { MainViewer } from "./components/viewer/MainViewer";
import { BuilderDashboard } from "./components/builder/BuilderDashboard";
import { ActiveWorkoutOverlay } from "./components/tracker/ActiveWorkoutOverlay";

// Restore your custom global CSS variables!
const globalCss = `
  :root {
    --background: 30 15% 97%;
    --foreground: 220 20% 10%;
    --border: 30 10% 85%;
    --card: 0 0% 100%;
    --card-border: 30 10% 88%;
    --muted: 30 10% 94%;
    --muted-foreground: 220 10% 45%;
    --sidebar: 0 0% 98%;
    --sidebar-foreground: 220 20% 10%;
    --sidebar-border: 30 10% 85%;
    --sidebar-accent: 30 10% 90%;
  }
  .dark {
    --background: 222 20% 10%;
    --foreground: 210 20% 92%;
    --border: 222 15% 20%;
    --card: 222 20% 13%;
    --card-border: 222 15% 22%;
    --muted: 222 20% 16%;
    --muted-foreground: 210 10% 50%;
    --sidebar: 222 25% 8%;
    --sidebar-foreground: 210 20% 88%;
    --sidebar-border: 222 20% 16%;
    --sidebar-accent: 222 20% 16%;
  }
  body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
  .section-anchor { scroll-margin-top: 24px; }
  @media (max-width: 1023px) { .section-anchor { scroll-margin-top: 72px; } }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .progress-strip { transition: width 0.4s ease-out; }
`;

const GlobalStyles = () => <style>{globalCss}</style>;

function AppLayout() {
  const { viewMode } = useAppContext();
  
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {viewMode === 'app' ? <MainViewer /> : <BuilderDashboard />}
      <ActiveWorkoutOverlay />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProviderWrapper>
      <GlobalStyles />
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </ThemeProviderWrapper>
  );
}