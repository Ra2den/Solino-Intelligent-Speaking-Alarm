import { useState } from "react";  // useEffect kann weg
import type { Alarm } from "../../models/alarm/alarm.model";
import { AlarmCard } from "./AlarmCard";
import backIcon from "/src/assets/alarm/icon-back.svg";

const demoAlarms: Alarm[] = [
    {
        id: 1,
        label: "Hochschule",
        time: "6:15",
        active: true,
        recurring_days: ["WED", "THU", "FRI"],
    },
    {
        id: 2,
        label: "Arbeit",
        time: "8:00",
        active: true,
        recurring_days: ["MON", "TUE"],
    },
    {
        id: 3,
        label: "Tabletten",
        time: "20:00",
        active: false,
        recurring_days: null,
    },
    {
        id: 4,
        label: "Sport",
        time: "18:30",
        active: true,
        recurring_days: ["MON", "WED", "FRI"],
    },
    {
        id: 5,
        label: "Zahnarzt",
        time: "14:00",
        active: false,
        recurring_days: null,
    },
];

type AlarmListProps = {
    onBack: () => void;
};

export function AlarmList({ onBack }: AlarmListProps) {
    const [alarms] = useState<Alarm[]>(demoAlarms);

    return (
        <div className="w-1/2 h-screen flex flex-col p-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-white text-[40px] font-medium">Deine Wecker</h1>
                <button
                    onClick={onBack}
                    className="w-15 h-15 flex items-center justify-center transition-opacity"
                    aria-label="Zurück"
                >
                    <img
                        src={backIcon}
                        alt=""
                        className="w-10 h-10"
                        aria-hidden="true"
                    />
                </button>
            </div>

            {/* Scrollbare Liste */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-4 custom-scrollbar">
                {alarms.map((alarm) => (
                    <AlarmCard key={alarm.id} alarm={alarm} isWidget={false} />
                ))}
            </div>
        </div>
    );
}