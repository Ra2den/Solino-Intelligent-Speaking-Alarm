import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlarmSessionProvider } from "./contexts/alarm-session/alarm-session-provider.tsx";
import { AiStateProvider } from "./contexts/ai-state/ai-state-provider.tsx";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <AlarmSessionProvider client={queryClient}>
        <AiStateProvider>
          <App />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                borderRadius: "50px",
                padding: "16px 24px",
                fontSize: "20px",
                fontWeight: 500,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#fff",
                  secondary: "rgba(0, 0, 0, 0.6)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ff4b4b",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AiStateProvider>
      </AlarmSessionProvider>
    </StrictMode>
  </QueryClientProvider>,
);
