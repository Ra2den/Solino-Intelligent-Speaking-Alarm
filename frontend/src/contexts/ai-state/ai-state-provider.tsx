import { type ReactNode, useMemo } from "react";
import { useAiStateWebSocket } from "../../hooks/useAiStateWebSocket";
import { AiStateContext } from "./ai-state.context";

type AiStateProviderProps = {
  children: ReactNode;
};

export function AiStateProvider({
  children,
}: AiStateProviderProps) {
  const { aiState, connectionStatus } = useAiStateWebSocket();

  const value = useMemo(
    () => ({
      aiState,
      connectionStatus,
    }),
    [aiState, connectionStatus],
  );

  return (
    <AiStateContext.Provider value={value}>
      {children}
    </AiStateContext.Provider>
  );
}
