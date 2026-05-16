import AlarmWidget from "./alarm/AlarmWidget";
import { Agent } from "./agent/Agent";
import TimeWidget from "./TimeWidget";
import AlarmCreate from "./alarm-create/AlarmCreate";
import { useState } from "react";

export function HomeScreen() {
  const [isCreate, setIsCreate] = useState(false);

  return (
    <>
      {isCreate ? (
        <AlarmCreate
          onCreate={() => setIsCreate(false)}
        />
      ) : (
        <div className="w-full h-full grid grid-cols-5 p-12">
          {/* Widgets */}
          <div className="col-span-2 grid grid-row-subgrid">
            <Widgets />
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
        <div className="row-span-2">
          {/* Buttons */}
          <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={() => setIsCreate(true)}>
            Wecker erstellen
          </button>
        </div>
        <div className="row-span-3">
          <AlarmWidget></AlarmWidget>
        </div>
      </>
    );
  }
}
