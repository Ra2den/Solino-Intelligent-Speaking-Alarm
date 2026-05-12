import { useState } from "react";
import "./App.css";
import { Agent } from "./components/agent/Agent";
import TimeWidget from "./components/TimeWidget";
import BgSimulator from "./components/BgSimulator";
import AlarmWidget from "./components/alarm/AlarmWidget";
import { AlarmList } from "./components/alarm/AlarmList";
import { AlarmListButton } from "./components/buttons/AlarmListButton";
import { AlarmAddButton } from "./components/buttons/AlarmAddButton";
import { SettingsButton } from "./components/buttons/SettingsButton";

function App() {
  const [showAlarmList, setShowAlarmList] = useState(false);

  return (
    <>
      <BgSimulator>
        {showAlarmList ? (
          <AlarmList onBack={() => setShowAlarmList(false)} />
        ) : (
          <div className="w-full h-full grid grid-cols-5 p-12">
            {/* Widgets */}
            <div className="col-span-2 grid grid-row-subgrid">
              {/* Time Widget */}
              <div className="row-span-3">
                <TimeWidget locale="de-DE" />
              </div>
              {/* Buttons */}
              <div className="row-span-2 justify-between items-center flex">
                <AlarmListButton onClick={() => setShowAlarmList(true)} />
                <AlarmAddButton />
                <SettingsButton />
              </div>
              <div className="row-span-3">
                <AlarmWidget></AlarmWidget>
              </div>
            </div>
            {/* Agent */}
            <div className="col-span-3">
              <Agent></Agent>
            </div>
          </div>
        )}
      </BgSimulator>
    </>
  );
}

export default App;