import "./App.css";
import { Agent } from "./components/Agent";
import TimeWidget from "./components/TimeWidget";

function App() {
  return (
    <>
      <div className="w-full h-full grid grid-cols-5 p-12">
        {/* Widgets */}
        <div className="col-span-2 grid grid-row-subgrid bg-red-200">
          {/* Time Widget */}
          <div className="row-span-3 bg-blue-400">
            {/*Uhrzeit und Tag darstellen; locale muss später dynamisch angepasst werden*/}
            <TimeWidget locale="de-DE" />
          </div>
          {/* Buttons */}
          <div className="row-span-2 bg-green-300">{/* TODO Buttons */}</div>
          {/* Alarm Widget */}
          <div className="row-span-3 bg-yellow-500">
            {/* TODO Alarm Widget */}
          </div>
        </div>
        {/* Agent */}
        <div className="col-span-3">
          <Agent></Agent>
        </div>
      </div>
    </>
  );
}

export default App;
