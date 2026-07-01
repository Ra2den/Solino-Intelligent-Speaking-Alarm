import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import backIcon from "../assets/alarm/icon-back.svg";
import type { SettingsKey } from "../models/settings/settings.model";

type SettingsScreenProps = {
  onBack: () => void;
};

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<"General" | "Advanced">("General");
  const [isDev, setIsDev] = useState<boolean>(true);

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

  if (isLoading || !settings) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-black text-2xl font-medium">Laden...</div>
      </div>
    );
  }

  const getSettingValue = (key: SettingsKey) => {
    return settings.find((s) => s.key === key)?.value;
  };

  const handleUpdate = (key: SettingsKey, value: string | number | boolean) => {
    // Only update if changed
    if (getSettingValue(key) !== value) {
      mutation.mutate({ key, value });
    }
  };

  // Swipe gesture handling for tabs
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      // Swiped left
      setActiveTab("Advanced");
    }
    if (touchEndX - touchStartX > 50) {
      // Swiped right
      setActiveTab("General");
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col rounded-[40px] p-6 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-10">
          <button onClick={onBack} className="" aria-label="Zurück">
            <img
              src={backIcon}
              alt=""
              className="w-10 h-10"
              aria-hidden="true"
            />
          </button>
          <h1 className="text-black text-[32px] font-medium text-center">
            Einstellungen
          </h1>
        </div>
        {/* Tab Bar */}
        <div className="flex bg-gray-200/60 rounded-full p-2 w-94 max-w-md shrink-0 shadow-inner mix-blend-soft-light">
          <button
            className={`flex-1 py-5 px-6 rounded-full text-2xl font-medium transition-all duration-300 ${
              activeTab === "General"
                ? "bg-white text-black shadow-md"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("General")}
          >
            Allgemein
          </button>
          <button
            className={`flex-1 py-3 px-6 rounded-full text-2xl font-medium transition-all duration-300 ${
              activeTab === "Advanced"
                ? "bg-white text-black shadow-md"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("Advanced")}
          >
            Erweitert
          </button>
        </div>
      </div>

      {/* Tab Content - No scrolling allowed! */}
      <div className="flex-1 flex flex-col justify-center">
        {activeTab === "General" ? (
          <>
            <SettingSegmentGroup
              label="Sprache"
              options={[
                { label: "English", value: "ENGLISH" },
                { label: "Deutsch", value: "GERMAN" },
              ]}
              currentValue={getSettingValue("LANGUAGE") as string}
              onChange={(val) => handleUpdate("LANGUAGE", val)}
            />
            <SettingSegmentGroup
              label="Lautstärke"
              options={[
                { label: "25%", value: 25 },
                { label: "50%", value: 50 },
                { label: "75%", value: 75 },
                { label: "100%", value: 100 },
              ]}
              currentValue={getSettingValue("VOLUME_PERCENT") as number}
              onChange={(val) => handleUpdate("VOLUME_PERCENT", val)}
            />
            <SettingSegmentGroup
              label="Schlummer Dauer"
              options={[
                { label: "1 min", value: 1 },
                { label: "2 min", value: 2 },
                { label: "5 min", value: 5 },
                { label: "10 min", value: 10 },
              ]}
              currentValue={getSettingValue("SNOOZE_DURATION_MIN") as number}
              onChange={(val) => handleUpdate("SNOOZE_DURATION_MIN", val)}
            />
            <SettingSegmentGroup
              label="Morgen-Begrüßung"
              options={[
                { label: "An", value: true },
                { label: "Aus", value: false },
              ]}
              currentValue={getSettingValue("WAKE_UP_MESSAGE_ENABLED") as boolean}
              onChange={(val) => handleUpdate("WAKE_UP_MESSAGE_ENABLED", val)}
            />
          </>
        ) : (
          <>
            <SettingSegmentGroup
              label="Guard Modus Dauer"
              options={
                isDev
                  ? [
                      { label: "1 min", value: 1 },
                      { label: "10 min", value: 10 },
                      { label: "20 min", value: 20 },
                      { label: "30 min", value: 30 },
                    ]
                  : [
                      { label: "10 min", value: 10 },
                      { label: "20 min", value: 20 },
                      { label: "30 min", value: 30 },
                    ]
              }
              currentValue={getSettingValue("GUARD_MODE_TIMER_MIN") as number}
              onChange={(val) => handleUpdate("GUARD_MODE_TIMER_MIN", val)}
            />
            <SettingSegmentGroup
              label="Guard Modus Toleranz"
              options={
                isDev
                  ? [
                      { label: "10s", value: 10 / 60 },
                      { label: "1 min", value: 1 },
                      { label: "2 min", value: 2 },
                      { label: "3 min", value: 3 },
                    ]
                  : [
                      { label: "1 min", value: 1 },
                      { label: "2 min", value: 2 },
                      { label: "3 min", value: 3 },
                    ]
              }
              currentValue={getSettingValue("GUARD_MODE_TOLERANCE_MIN") as number}
              onChange={(val) => handleUpdate("GUARD_MODE_TOLERANCE_MIN", val)}
            />
            <SettingSegmentGroup
              label="Ollama Timeout"
              options={[
                { label: "15s", value: 15 },
                { label: "30s", value: 30 },
                { label: "60s", value: 60 },
                { label: "120s", value: 120 },
              ]}
              currentValue={
                getSettingValue("OLLAMA_HEALTH_CHECK_TIMEOUT_SEC") as number
              }
              onChange={(val) =>
                handleUpdate("OLLAMA_HEALTH_CHECK_TIMEOUT_SEC", val)
              }
            />
            <SettingSegmentGroup
              label="Entwickler-Modus"
              options={[
                { label: "An", value: true },
                { label: "Aus", value: false },
              ]}
              currentValue={isDev}
              onChange={(val) => setIsDev(val as boolean)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function SettingSegmentGroup({
  label,
  options,
  currentValue,
  onChange,
}: {
  label: string;
  options: { label: string; value: string | number | boolean }[];
  currentValue: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between w-full mix-blend-soft-light transition-opacity py-5">
        <span className="text-black text-2xl font-medium ml-4 shrink-0">
          {label}
        </span>
        <div className="flex gap-2 justify-end pr-2 flex-wrap sm:flex-nowrap">
          {options.map((opt) => {
            // For floats like 10/60, allow a small epsilon for equality
            const isActive =
              typeof currentValue === "number" && typeof opt.value === "number"
                ? Math.abs(currentValue - opt.value) < 0.0001
                : currentValue === opt.value;
                
            return (
              <button
                key={String(opt.value)}
                onClick={() => onChange(opt.value)}
                className={`min-w-40 h-19 px-12 rounded-full text-2xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-black text-white shadow-md scale-105"
                    : "bg-gray-100/80 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-black/30 mix-blend-soft-light rounded-full w-auto h-0.5 mx-0"></div>
    </>
  );
}
