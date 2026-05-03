import AlarmWidget from "./alarm/AlarmWidget";
import { Agent } from "./agent/Agent";
import TimeWidget from "./TimeWidget";
import AlarmCreate from "./alarm-create/AlarmCreate";
import { useState } from "react";

export function HomeScreen() {
  const [isCreate, setIsCreate] = useState(false);

  return (
    <div className="w-full h-full grid grid-cols-5 p-12">
      {/* Widgets */}
      <div className="col-span-2 grid grid-row-subgrid">
        {isCreate ? <AlarmCreate /> : <Widgets />}
      </div>
      {/* Agent */}
      <div className="col-span-3">
        <Agent></Agent>
      </div>
    </div>
  );

  function Widgets() {
    return (
      <>
        {/* Time Widget */}
        <div className="row-span-3">
          <TimeWidget locale="de-DE" />
        </div>
        {/* Buttons */}
        <button onClick={() => setIsCreate(true)}></button>
        <div className="row-span-2 bg-green-300">{/* TODO Buttons */}</div>
        <div className="row-span-3">
          <AlarmWidget></AlarmWidget>
        </div>
      </>
    );
  }
}
