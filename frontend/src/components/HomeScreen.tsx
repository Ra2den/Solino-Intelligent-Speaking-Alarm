import AlarmWidget from "./alarm/AlarmWidget";
import { Agent } from "./agent/Agent";
import TimeWidget from "./TimeWidget";
import AlarmCreate from "./alarm-create/AlarmCreate";
import { useState } from "react";
import { Button } from "./buttons/Button";
import alarmListIcon from "/src/assets/alarm/icon-alarmListBtn.svg";
import alarmAddIcon from "/src/assets/alarm/icon-alarmAddBtn.svg";
import settingsIcon from "/src/assets/alarm/icon-settingsBtn.svg";
import { AlarmList } from "./alarm/AlarmList";
import { useAlarmSession } from "../contexts/alarm-session.context";
import { AlarmRingingScreen } from "./AlarmRingingScreen";

export function HomeScreen() {
  const [isCreate, setIsCreate] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const { isRinging, currentAlarmSession, stopAlarm, snoozeAlarm } =
    useAlarmSession();

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
        {/* Agent bleibt rechts */}
        <div className="col-span-3">
          <Agent />
        </div>
      </div>
    );
  }

  return (
    <>
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
            <Agent></Agent>
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
          <Button label="Einstellungen" iconSrc={settingsIcon} />
        </div>
        <div className="row-span-3">
          <AlarmWidget></AlarmWidget>
        </div>
      </>
    );
  }
}