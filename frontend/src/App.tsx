import { useEffect, useState } from "react";
import "./App.css";
import { AlarmsService } from "./services/alarms.service";
import type { Alarm } from "./models/alarm.model";
import Clock from "./components/Clock/Clock";


function App() {
  const [alarms, setAlarms] = useState<Array<Alarm>>([]);
  useEffect(() => {
    fetchAndSetAlarms();
  }, []);

  return (
    <>
      {/* TEMP JSON Darstellung der gefetchen Wecker */}
      <pre>{JSON.stringify(alarms, null, 2)}</pre>

      {/*Uhrzeit darstellen*/}
      <Clock locale="de-DE" options={{ hour: "2-digit", minute: "2-digit", hour12: false }} />
    </>
  );

  function fetchAndSetAlarms() {
    AlarmsService.getAlarms().then((alarms) => {
      setAlarms(alarms);
    });
  }
}

export default App;
