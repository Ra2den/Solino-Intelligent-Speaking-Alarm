import SettingsIcon from "/src/assets/alarm/icon-settingsBtn.svg";

type SettingsButtonProps = {
    onClick?: () => void;
    label?: string;
};

export function SettingsButton({ onClick, label = "Einstellungen" }: SettingsButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-37.5 h-37.5 rounded-[50px] bg-black mix-blend-soft-light transition-opacity duration-300 hover:opacity-80 flex items-center justify-center"
            aria-label={label}
        >
            <img
                src={SettingsIcon}
                alt=""
                className="w-12.5 h-12.5"
                aria-hidden="true"
            />
        </button>
    );
}