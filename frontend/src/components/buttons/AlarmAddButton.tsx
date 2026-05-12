import AlarmAddIcon from "/src/assets/alarm/icon-alarmAddBtn.svg";

type AlarmAddButtonProps = {
    onClick?: () => void;
    label?: string;
};

export function AlarmAddButton({ onClick, label = "Neuer Wecker" }: AlarmAddButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-37.5 h-37.5 rounded-[50px] bg-black mix-blend-soft-light transition-opacity duration-300 hover:opacity-80 flex items-center justify-center"
            aria-label={label}
        >
            <img
                src={AlarmAddIcon}
                alt=""
                className="w-17.5 h-17.5"
                aria-hidden="true"
            />
        </button>
    );
}