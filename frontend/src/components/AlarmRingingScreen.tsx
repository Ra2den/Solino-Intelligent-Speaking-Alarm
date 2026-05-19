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
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <p>Stop</p>
      <Button onClick={onStop} iconSrc=""></Button>
      <p>Snooze</p>
      <Button onClick={onSnooze} iconSrc=""></Button>
    </>
  );
}
