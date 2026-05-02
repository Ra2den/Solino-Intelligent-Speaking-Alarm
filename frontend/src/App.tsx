import "./App.css";
import { Agent } from "./components/agent/Agent";
import TimeWidget from "./components/TimeWidget";
import BgSimulator from "./components/BgSimulator";
import { AlarmWidget } from "./components/AlarmWidget";
import type { Alarm } from "./models/alarm.model";

const demoAlarms: Alarm[] = [
  {
    id: 1,
    label: "Hochschule",
    time: "06:15",
    active: true,
    days: ["Mi", "Do", "Fr"],
  },
  {
    id: 2,
    label: "Arbeit",
    time: "08:00",
    active: true,
    days: ["Mo", "Di"],
  },
  {
    id: 3,
    label: "Tabletten",
    time: "20:00",
    active: true,
    days: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  },
];

function App() {
  return (
    <>
      <BgSimulator>
        <div className="w-full h-full grid grid-cols-5 p-12">
          {/* Widgets */}
          <div className="col-span-2 grid grid-row-subgrid">
            {/* Time Widget */}
            <div className="row-span-3">
              {/*Uhrzeit und Tag darstellen; locale muss später dynamisch angepasst werden*/}
              <TimeWidget locale="de-DE" />
            </div>
            {/* Buttons */}
            <div className="row-span-2 bg-green-300">{/* TODO Buttons */}</div>
            {/* Alarm Widget */}
            <div className="row-span-3 bg-yellow-500">
              <div className="app">
                <p>Anzahl Alarme: {demoAlarms.length}</p>

                {demoAlarms.map((alarm) => (
                <AlarmWidget
                  key={alarm.id}
                  name={alarm.label}
                  time={alarm.time}
                  active={alarm.active}
                  days={alarm.days}
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