import { useEffect, useState } from "react"; // useEffect kann weg
import type { Alarm } from "../../models/alarm/alarm.model";
import { AlarmCard } from "./AlarmCard";
import backIcon from "/src/assets/alarm/icon-back.svg";
import { alarmsService } from "../../services/alarms.service";
import alarmAddIcon from "../../assets/alarm/icon-alarmAddBtn.svg";
import toast from "react-hot-toast";

type AlarmListProps = {
  onBack: () => void;
  onCreate?: () => void;
  onEdit?: (alarm: Alarm) => void;
  onDelete?: (alarmId: number) => void;
};

export function AlarmList({ onBack, onCreate, onEdit, onDelete }: AlarmListProps) {
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
            <div className="flex items-center justify-center w-full h-[300px] relative rounded-[50px] bg-black mix-blend-soft-light">
              <button
                    onClick={onCreate}
                    className="w-full h-full flex-column gap-4 items-center justify-center transition-opacity"
                    aria-label="Wecker hinzufügen"
                  >
                  <img src={alarmAddIcon} alt="" className="w-full h-20"/>
                  <p className="text-white text-[24px] font-medium pt-4">
                    Neuen Wecker erstellen
                  </p>
              </button>
            </div>
        ) : (
          alarms.map((alarm) => (
            <div key={alarm.id} className="w-full h-65">
              <AlarmCard
                alarm={alarm}
                isWidget={false}
                isSnoozed={false}
                onToggle={() => handleToggleAlarm(alarm.id)}
                onEdit={() => onEdit?.(alarm)}
                onDelete={() => handleDeleteAlarm(alarm.id)}
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

  async function handleDeleteAlarm(alarmId: number) {
    try {
      await alarmsService.deleteAlarm(alarmId);
      setAlarms((currentAlarms) =>
        currentAlarms.filter((alarm) => alarm.id !== alarmId),
      );
      toast.success("Wecker erfolgreich gelöscht.");
      onDelete?.(alarmId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.deleteAlarm error:", err.message);
      }
      toast.error("Wecker konnte nicht gelöscht werden, da er noch aktive Sitzungen hat.");
    }
  }
}
