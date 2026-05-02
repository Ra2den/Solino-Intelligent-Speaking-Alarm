import "./App.css";
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
  );
}

export default App;