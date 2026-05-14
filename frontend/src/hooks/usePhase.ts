import { useContext } from "react";
import { PhaseContext } from "../contexts/phase-context";

export function usePhase() {
  return useContext(PhaseContext);
}
