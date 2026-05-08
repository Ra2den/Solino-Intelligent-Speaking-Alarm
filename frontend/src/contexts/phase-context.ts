import { createContext } from "react";
import type { Phase } from "../models/simulator/phase.model.js";

export const PhaseContext = createContext<Phase | undefined>(undefined);
