import { createContext, useContext } from "react";
import { type AiState } from "../../models/assistant/ai-state.model";

type AiStateContextValue = {
  aiState: AiState;
  connectionStatus: string;
};

export const AiStateContext =
  createContext<AiStateContextValue | null>(null);

export function useAiState() {
  const context = useContext(AiStateContext);

  if (!context) {
    throw new Error("useAiState must be used within AiStateProvider");
  }

  return context;
}