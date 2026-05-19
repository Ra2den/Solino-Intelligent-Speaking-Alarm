import type { AlarmSession } from "../models/alarm-session.model";
import { Button } from "./buttons/Button";

type AlarmRingingScreenProps = {
  session: AlarmSession;
  onStop: () => Promise<void>;
  onSnooze: () => Promise<void>;
};

export function AlarmRingingScreen({
  session,
  onStop,
  onSnooze,
}: AlarmRingingScreenProps) {
  return (
    <>

    </>
  );
}
