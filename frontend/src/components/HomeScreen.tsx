import AlarmWidget from "./alarm/AlarmWidget";
import { Agent } from "./agent/Agent";
import TimeWidget from "./TimeWidget";
import AlarmCreate from "./alarm-create/AlarmCreate";
import { useState, useEffect } from "react";
import { Button } from "./buttons/Button";
import alarmListIcon from "/src/assets/alarm/icon-alarmListBtn.svg";
import alarmAddIcon from "/src/assets/alarm/icon-alarmAddBtn.svg";
import settingsIcon from "/src/assets/alarm/icon-settingsBtn.svg";
import { AlarmList } from "./alarm/AlarmList";
import { useAlarmSession } from "../contexts/alarm-session/alarm-session.context";
import { AlarmRingingScreen } from "./AlarmRingingScreen";
import { AlarmGuardScreen } from "./AlarmGuardScreen";
import SettingsScreen from "./SettingsScreen";
import { useAiState } from "../contexts/ai-state/ai-state.context";
import { AiStateSchema } from "../models/assistant/ai-state.model";
import ListeningBorder from "./ListeningBorder";
import { usePhase } from "../hooks/usePhase";
import { useWeatherNowcast } from "../hooks/weather/useWeatherNowcast";
import { LoadingScreen } from "./LoadingScreen";

export function HomeScreen() {
  const [isCreate, setIsCreate] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const {
    isRinging,
    isGuard,
    currentAlarmSession,
    stopAlarm,
    snoozeAlarm,
    togglePressureSensor,
    isLoading: isSessionLoading,
  } = useAlarmSession();

  const [isSettingsView, setIsSettingsView] = useState(false);
  const { aiState } = useAiState();

  const phase = usePhase();
  const { isLoading: isWeatherLoading, isError: isWeatherError } =
    useWeatherNowcast();

  const [hasInitialized, setHasInitialized] = useState(false);
  const isInitializing =
    phase === undefined ||
    (isWeatherLoading && !isWeatherError) ||
    isSessionLoading;

  useEffect(() => {
    if (!isInitializing) {
      setHasInitialized(true);
    }
  }, [isInitializing]);

  const mainContent = (() => {
    if (isRinging && currentAlarmSession) {
      return (
        <div className="w-full h-full overflow-hidden grid grid-cols-5 p-12 gap-6">
          {/* Alarm-Ringing Widget */}
          <div className="col-span-2 h-full">
            <AlarmRingingScreen
              session={currentAlarmSession}
              onStop={stopAlarm}
              onSnooze={() => snoozeAlarm()}
            />
          </div>
          <div className="col-span-3">
            <Agent />
          </div>
        </div>
      );
    }

    if (isGuard && currentAlarmSession) {
      return (
        <div className="w-full h-full overflow-hidden grid grid-cols-5 p-12 gap-6">
          {/* Guard mode widget */}
          <div className="col-span-2 h-full">
            <AlarmGuardScreen
              session={currentAlarmSession}
              onPressureStart={togglePressureSensor}
            />
          </div>
          <div className="col-span-3">
            <Agent isGuard />
          </div>
        </div>
      );
    }

    if (isSettingsView) {
      return (
        <div className="w-full h-full p-12">
          <SettingsScreen onBack={() => setIsSettingsView(false)} />
        </div>
      );
    }

    return isCreate ? (
      <AlarmCreate onCreate={() => setIsCreate(false)} onBack={() => setIsCreate(false)} />
    ) : (
      <div className="w-full h-full overflow-hidden grid grid-cols-5 p-12 gap-6">
        {/* Widgets */}
        <div className="col-span-2 min-h-0 grid grid-rows-8 h-full">
          {isListView ? (
            <div className="row-span-8">
              <AlarmList onBack={() => setIsListView(false)} />
            </div>
          ) : (
            <Widgets />
          )}
        </div>
        {/* Agent */}
        <div className="col-span-3">
          <Agent aiState={aiState} />
        </div>
      </div>
    );
  })();

  return (
    <>
      <LoadingScreen
        isPhaseLoading={!hasInitialized && phase === undefined}
        isWeatherLoading={
          !hasInitialized && isWeatherLoading && !isWeatherError
        }
        isSessionLoading={!hasInitialized && isSessionLoading}
      />
      <ListeningBorder isActive={aiState === AiStateSchema.enum.LISTENING} />
      {mainContent}
    </>
  );

  function Widgets() {
    return (
      <>
        {/* Time Widget */}
        <div className="row-span-3">
          <TimeWidget locale="de-DE" />
        </div>
        <div className="row-span-2 flex items-center justify-evenly">
          {/* Buttons */}
          <Button
            onClick={() => setIsListView(true)}
            label="Alle Wecker"
            iconSrc={alarmListIcon}
          />
          <Button
            onClick={() => setIsCreate(true)}
            label="Wecker hinzufügen"
            iconSrc={alarmAddIcon}
          />
          <Button
            onClick={() => setIsSettingsView(true)}
            label="Einstellungen"
            iconSrc={settingsIcon}
          />
        </div>
        <div className="row-span-3">
          <AlarmWidget></AlarmWidget>
        </div>
      </>
    );
  }
}
