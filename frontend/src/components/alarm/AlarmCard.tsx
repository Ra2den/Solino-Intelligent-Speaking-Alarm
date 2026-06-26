import { useState, useRef, type PointerEvent, type MouseEvent } from "react";
import type { Alarm } from "../../models/alarm/alarm.model";
import { RecurringDays } from "./RecurringDays";
import singleAlarmIcon from "/src/assets/alarm/icon-alarm-once.svg";
import recurringAlarmIcon from "/src/assets/alarm/icon-alarm.svg";
import snoozeIcon from "/src/assets/alarm/icon-snooze.svg";

type AlarmCardProps = {
  alarm?: Alarm;
  isSnoozed: boolean;
  isWidget?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AlarmCard({
  alarm,
  isWidget,
  isSnoozed,
  onToggle,
  onEdit,
  onDelete,
}: AlarmCardProps) {
  const isRecurring = alarm?.recurring_days !== null;

  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isSwipeDirectionRef = useRef<"none" | "x" | "y">("none");
  const activeRef = useRef(false);
  const wasDraggingRef = useRef(false);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isWidget) return;
    if (e.button !== 0) return;

    activeRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isSwipeDirectionRef.current = "none";
    wasDraggingRef.current = false;
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (isSwipeDirectionRef.current === "none") {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX > 10 || absY > 10) {
        if (absX > absY) {
          isSwipeDirectionRef.current = "x";
          setIsDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        } else {
          isSwipeDirectionRef.current = "y";
          activeRef.current = false;
        }
      }
    }

    if (isSwipeDirectionRef.current === "x") {
      setTranslateX(deltaX);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return;
    activeRef.current = false;

    if (isSwipeDirectionRef.current === "x") {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      wasDraggingRef.current = true;

      const threshold = 120;
      if (translateX > threshold) {
        onEdit?.();
        setTranslateX(600);
        setTimeout(() => setTranslateX(0), 300);
      } else if (translateX < -threshold) {
        onDelete?.();
        setTranslateX(-600);
        setTimeout(() => setTranslateX(0), 300);
      } else {
        setTranslateX(0);
      }
    }
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (activeRef.current) {
      if (isSwipeDirectionRef.current === "x") {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      activeRef.current = false;
      setIsDragging(false);
      setTranslateX(0);
    }
  };

  const handleCaptureClick = (e: MouseEvent) => {
    if (wasDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
      wasDraggingRef.current = false;
    }
  };

  return (
    <div
      onClickCapture={handleCaptureClick}
      className="w-full h-full relative select-none touch-pan-y"
    >
      {/* Background action layers */}
      {!isWidget && (
        <>
          {/* Left Action: Edit (visible when translating to the right, i.e. > 0) */}
          <div
            style={{ width: `${Math.max(0, translateX)}px` }}
            className="absolute left-0 top-0 bottom-0 overflow-hidden bg-indigo-400 text-white rounded-[50px] flex items-center"
          >
            <div className="flex items-center gap-4 pl-12.5 w-75 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
              <span className="text-[28px] font-medium">Bearbeiten</span>
            </div>
          </div>

          {/* Right Action: Delete (visible when translating to the left, i.e. < 0) */}
          <div
            style={{ width: `${Math.max(0, -translateX)}px` }}
            className="absolute right-0 top-0 bottom-0 overflow-hidden bg-rose-400 text-white rounded-[50px] flex items-center justify-end"
          >
            <div className="flex items-center justify-end gap-4 pr-12.5 w-75 shrink-0">
              <span className="text-[28px] font-medium">Löschen</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Foreground card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        className={`w-full h-full bg-black mix-blend-soft-light rounded-[50px] transition-opacity duration-300 ${
          !alarm?.active ? "opacity-50" : ""
        } ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
      >
        <div className="flex flex-col justify-center w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px]">
          {isWidget && alarm == null && (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-white text-[36px] font-medium">
                Kein Wecker gestellt
              </p>
            </div>
          )}
          {alarm != null && (
            <>
              {/* Zeile 1: Name + Icon */}
              <div className="flex items-center justify-between w-full">
                <span className="text-white text-[40px] font-medium truncate max-w-96">
                  {isWidget && isSnoozed && (
                    <div className="text-white text-3xl font-bold leading-none">
                      Schlummern
                    </div>
                  )}
                  {alarm?.label}
                </span>
                {isSnoozed && (
                  <img
                    src={snoozeIcon}
                    alt=""
                    className="w-10 h-10"
                    aria-hidden="true"
                  />
                )}
                {!isSnoozed && (
                  <img
                    src={isRecurring ? recurringAlarmIcon : singleAlarmIcon}
                    alt=""
                    className="w-7.5 h-7.5"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Zeile 2: Time + Toggle */}
              <div className="flex items-center justify-between w-full mt-2">
                <div className="text-white text-[75px] font-medium leading-none">
                  {alarm?.time}
                </div>

                {!isWidget && (
                  <button
                    onClick={onToggle}
                    className="relative w-20 h-11 rounded-full bg-white transition-all duration-300"
                    aria-label={
                      alarm?.active
                        ? "Wecker deaktivieren"
                        : "Wecker aktivieren"
                    }
                  >
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 left-1.5 w-8.5 h-8.5 rounded-full bg-black transition-transform duration-300 ${
                        alarm?.active ? "translate-x-8" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Zeile 3: Wochentage (nur bei recurring) */}
              {isRecurring && (
                <RecurringDays
                  recurring_days={alarm?.recurring_days}
                ></RecurringDays>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
