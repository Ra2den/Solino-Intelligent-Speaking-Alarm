import alarmListIcon from "/src/assets/alarm/icon-alarmListBtn.svg";

type AlarmListButtonProps = {
    onClick?: () => void;
    label?: string;
};

export function AlarmListButton({ onClick, label = "Alle Wecker" }: AlarmListButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-37.5 h-37.5 rounded-[50px] bg-black mix-blend-soft-light transition-opacity duration-300 hover:opacity-80 flex items-center justify-center"
            aria-label={label}
        >
            <img
                src={alarmListIcon}
                alt=""
                className="w-17.5 h-17.5"
                aria-hidden="true"
            />
        </button>
    );
}