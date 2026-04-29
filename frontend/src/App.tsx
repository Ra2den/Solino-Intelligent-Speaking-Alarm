import { useEffect, useState } from "react";
import "./App.css";
import { AlarmsService } from "./services/alarms.service";
import type { Alarm } from "./models/alarm.model";

function App() {
  const [alarms, setAlarms] = useState<Array<Alarm>>([]);
  useEffect(() => {
    fetchAndSetAlarms();
  }, []);

  return (
    <>
      {/* TEMP JSON Darstellung der gefetchen Wecker */}
      <pre>{JSON.stringify(alarms, null, 2)}</pre>
    </>
  );

  function fetchAndSetAlarms() {
    AlarmsService.getAlarms().then((alarms) => {
      setAlarms(alarms);
    });
  }
}

export default App;
