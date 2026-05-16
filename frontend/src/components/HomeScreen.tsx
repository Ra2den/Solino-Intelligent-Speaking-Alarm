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

export function HomeScreen() {
  const [isCreate, setIsCreate] = useState(false);
  const [isListView, setIsListView] = useState(false);

  return (
    <>
      {isCreate ? (
        <AlarmCreate onCreate={() => setIsCreate(false)} />
      ) : (
        <div className="w-full h-full overflow-hidden grid grid-cols-5 p-12 gap-6">
          {/* Widgets */}
          <div className="col-span-2 min-h-0 grid grid-row-subgrid">
            {isListView ? (
              <AlarmList onBack={() => setIsListView(false)} />
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
        <div className="row-span-2 flex items-center justify-between">
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
