import AlarmWidget from "./alarm/AlarmWidget";
import { Agent } from "./agent/Agent";
import TimeWidget from "./TimeWidget";
import AlarmCreate from "./alarm-create/AlarmCreate";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
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

function ListeningBorder({ isActive }: { isActive: boolean }) {
  const borderRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const proxy = { angle: 0 };
    const ctx = gsap.context(() => {
      // Smoothly fade and scale in the border
      gsap.fromTo(
        [borderRef.current, blurRef.current],
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1,
        },
      );

      // Animate the rotation angle endlessly
      gsap.to(proxy, {
        angle: 360,
        duration: 3.5,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          borderRef.current?.style.setProperty(
            "--glow-angle",
            `${proxy.angle}deg`,
          );
          blurRef.current?.style.setProperty(
            "--glow-angle",
            `${proxy.angle}deg`,
          );
        },
      });
    });

    return () => ctx.revert();
  }, [isActive]);

  if (!isActive) return null;

  const gradientBackground = `linear-gradient(black, black) padding-box, conic-gradient(from var(--glow-angle, 0deg), #4d8df1, #d64797, #e47551, #e3a033, #4d8df1) border-box`;
  const maskStyle = {
    WebkitMask:
      "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[100] overflow-hidden rounded-[50px]">
      {/* Main crisp border line */}
      <div
        ref={borderRef}
        className="absolute inset-0 rounded-[50px]"
        style={{
          background: gradientBackground,
          border: "6px solid transparent",
          ...maskStyle,
        }}
      />
      {/* Blurred outer/inner glow for the neon light effect */}
      <div
        ref={blurRef}
        className="absolute inset-0 rounded-[50px] opacity-70 blur-[15px]"
        style={{
          background: gradientBackground,
          border: "12px solid transparent",
          ...maskStyle,
        }}
      />
    </div>
  );
}

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
  } = useAlarmSession();

  const [isSettingsView, setIsSettingsView] = useState(false);
  const { aiState } = useAiState();

  if (isRinging && currentAlarmSession) {
    return (
      <>
        <ListeningBorder isActive={aiState === AiStateSchema.enum.LISTENING} />
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
      </>
    );
  }

  if (isGuard && currentAlarmSession) {
    return (
      <>
        <ListeningBorder isActive={aiState === AiStateSchema.enum.LISTENING} />
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
      </>
    );
  }

  if (isSettingsView) {
    return (
      <>
        <ListeningBorder isActive={aiState === AiStateSchema.enum.LISTENING} />
        <div className="w-full h-full p-12">
          <SettingsScreen onBack={() => setIsSettingsView(false)} />
        </div>
      </>
    );
  }

  return (
    <>
      <ListeningBorder isActive={aiState === AiStateSchema.enum.LISTENING} />
      {isCreate ? (
        <AlarmCreate onCreate={() => setIsCreate(false)} />
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
      )}
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
