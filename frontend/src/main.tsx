import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlarmSessionProvider } from "./contexts/alarm-session/alarm-session-provider.tsx";
import { AiStateProvider } from "./contexts/ai-state/ai-state-provider.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <AlarmSessionProvider client={queryClient}>
        <AiStateProvider>
          <App />
        </AiStateProvider>
      </AlarmSessionProvider>
    </StrictMode>
  </QueryClientProvider>,
);
