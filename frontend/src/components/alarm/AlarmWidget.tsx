import { AlarmSchema } from "../../models/alarm/alarm.model";
import { AlarmCard } from "./AlarmCard";

export default function AlarmWidget() {
  const alarm = AlarmSchema.parse({
    id: 1,
    label: "Hochschule",
    time: "8:00",
    active: true,
    recurring_days: ["MON", "TUE", "FRI"],
    variant: "recurring",
  });
  return <AlarmCard alarm={alarm} isWidget={true}></AlarmCard>;
}
