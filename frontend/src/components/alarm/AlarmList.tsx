import { useEffect, useState } from "react"; // useEffect kann weg
import type { Alarm } from "../../models/alarm/alarm.model";
import { AlarmCard } from "./AlarmCard";
import backIcon from "/src/assets/alarm/icon-back.svg";
import { alarmsService } from "../../services/alarms.service";
type AlarmListProps = {
  onBack: () => void;
};

export function AlarmList({ onBack }: AlarmListProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const fetchAlarms = async () => {
      const alarms = await alarmsService.getAlarms();
      setAlarms(alarms);
    };

    fetchAlarms();
  }, []);

  return (
    <div className="h-full min-h-0 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-black text-[40px] font-medium">Deine Wecker</h1>
        <button
          onClick={onBack}
          className="w-15 h-15 flex items-center justify-center transition-opacity"
          aria-label="Zurück"
        >
          <img src={backIcon} alt="" className="w-10 h-10" aria-hidden="true" />
        </button>
      </div>

      {/* Scrollbare Liste */}
      <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-6 pr-4 custom-scrollbar">
        {alarms.length === 0 ? (
          <p className="text-gray-500">Keine Wecker vorhanden.</p>
        ) : (
          alarms.map((alarm) => (
            <div key={alarm.id} className="w-full h-65">
              <AlarmCard
                alarm={alarm}
                isWidget={false}
                onToggle={() => handleToggleAlarm(alarm.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );

  async function handleToggleAlarm(alarmId: number) {
    const updatedAlarm = await alarmsService.toggleAlarm(alarmId);

    setAlarms((currentAlarms) =>
      currentAlarms.map((alarm) =>
        alarm.id === alarmId ? updatedAlarm : alarm,
      ),
    );
  }
}
