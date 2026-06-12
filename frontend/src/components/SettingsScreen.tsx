import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import backIcon from "../assets/alarm/icon-back.svg";
import {
  type SettingsItem,
  type SettingsKey,
} from "../models/settings/settings.model";
import { useState, useEffect } from "react";

type SettingsScreenProps = {
  onBack: () => void;
};

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getAllSettings(),
  });

  const mutation = useMutation({
    mutationFn: ({
      key,
      value,
    }: {
      key: SettingsKey;
      value: string | number | boolean;
    }) => settingsService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-black text-2xl">Laden...</div>
      </div>
    );
  }

  const handleUpdate = (key: SettingsKey, value: string | number | boolean) => {
    mutation.mutate({ key, value });
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col overflow-hidden bg-white/60 backdrop-blur-xl rounded-[40px] p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-black text-[40px] font-medium">Einstellungen</h1>
        <button
          onClick={onBack}
          className="w-15 h-15 flex items-center justify-center transition-opacity hover:opacity-70"
          aria-label="Zurück"
        >
          <img src={backIcon} alt="" className="w-10 h-10" aria-hidden="true" />
        </button>
      </div>

      {/* Scrollbare Liste */}
      <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-4 pr-4 custom-scrollbar">
        {settings?.map((setting) => (
          <SettingRow
            key={setting.key}
            setting={setting}
            onUpdate={(val) => handleUpdate(setting.key, val)}
          />
        ))}
      </div>
    </div>
  );
}

function SettingRow({
  setting,
  onUpdate,
}: {
  setting: SettingsItem;
  onUpdate: (val: string | number | boolean) => void;
}) {
  const [localValue, setLocalValue] = useState(setting.value);

  useEffect(() => {
    setLocalValue(setting.value);
  }, [setting.value]);

  const handleBlur = () => {
    if (localValue !== setting.value) {
      onUpdate(localValue);
    }
  };

  const labels: Record<string, string> = {
    LANGUAGE: "Sprache",
    VOICE: "Stimme",
    VOLUME_PERCENT: "Lautstärke",
    SNOOZE_DURATION_MIN: "Snooze Dauer (Min)",
    OLLAMA_HEALTH_CHECK_TIMEOUT_SEC: "Ollama Timeout (Sek)",
    GUARD_MODE_TIMER_MIN: "Wachmodus Timer (Min)",
    GUARD_MODE_TOLERANCE_MIN: "Wachmodus Toleranz (Min)",
  };

  const label = labels[setting.key] || setting.key;

  return (
    <div className="flex items-center justify-between bg-white/80 rounded-2xl p-4 shadow-sm">
      <div className="text-black text-xl font-medium">{label}</div>
      <div>
        {typeof setting.value === "number" ? (
          <input
            type="number"
            className="text-right text-xl p-2 rounded-xl bg-gray-50/50 border-none outline-none focus:ring-2 focus:ring-black w-32 transition-shadow"
            value={localValue as number}
            onChange={(e) => setLocalValue(Number(e.target.value))}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          />
        ) : typeof setting.value === "boolean" ? (
          <input
            type="checkbox"
            className="w-6 h-6 rounded-md accent-black cursor-pointer"
            checked={localValue as boolean}
            onChange={(e) => {
              const val = e.target.checked;
              setLocalValue(val);
              onUpdate(val);
            }}
          />
        ) : (
          <input
            type="text"
            className="text-right text-xl p-2 rounded-xl bg-gray-50/50 border-none outline-none focus:ring-2 focus:ring-black w-48 transition-shadow"
            value={localValue as string}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          />
        )}
      </div>
    </div>
  );
}
