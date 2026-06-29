import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../../services/settings.service";

export function useGuardModeDuration() {
    return useQuery({
        queryKey: ["settings", "GUARD_MODE_TIMER_MIN"],
        queryFn: () => settingsService.getSetting("GUARD_MODE_TIMER_MIN"),
        staleTime: 5 * 60 * 1000,
    });
}