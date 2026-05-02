import "./App.css";
import { Agent } from "./components/agent/Agent";
import TimeWidget from "./components/TimeWidget";
import BgSimulator from "./components/BgSimulator";
import AlarmWidget from "./components/AlarmWidget";
import type { Alarm } from "./models/alarm.model";
import { useState } from "react";

const demoAlarms: Alarm[] = [
  {
    id: 1,
    label: "Hochschule",
    time: "8:00",
    active: true,
    days: ["Mi", "Do", "Fr"],
    variant: "recurring",
  }/*,
  {
    id: 2,
    label: "Zahnarzt",
    time: "14:30",
    active: true,
    days: [],
    variant: "one-time",
  },*/
];

function App() {
  const [alarms, setAlarms] = useState<Alarm[]>(demoAlarms);

  function handleToggleAlarm(id: number, newActive: boolean) {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id ? { ...alarm, active: newActive } : alarm
      )
    );
  }

  return (
    <>
      <BgSimulator>
        <div className="w-full h-full grid grid-cols-5 p-12">
          {/* Widgets */}
          <div className="col-span-2 grid grid-row-subgrid">
            {/* Time Widget */}
            <div className="row-span-3">
              <TimeWidget locale="de-DE" />
            </div>
            {/* Buttons */}
            <div className="row-span-2 bg-green-300">{/* TODO Buttons */}</div>
            {/* Alarm Widget */}
            <div className="row-span-3">
              <div className="app">
                {alarms.map((alarm) => (
                  <AlarmWidget
                    key={alarm.id}
                    name={alarm.label}
                    time={alarm.time}
                    active={alarm.active}
                    days={alarm.days}
                    variant={alarm.variant}
                    onToggle={(newActive) =>
                      handleToggleAlarm(alarm.id, newActive)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Agent */}
          <div className="col-span-3">
            <Agent></Agent>
          </div>
        </div>
      </BgSimulator>
    </>
  );
}

export default App;