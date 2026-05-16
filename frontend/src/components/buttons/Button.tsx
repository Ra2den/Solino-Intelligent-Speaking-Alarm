type ButtonProps = {
  onClick?: () => void;
  label?: string;
  iconSrc: string;
};

export function Button({
  onClick,
  label,
  iconSrc,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-37.5 h-37.5 rounded-[50px] bg-black mix-blend-soft-light transition-opacity duration-300 hover:opacity-80 flex items-center justify-center"
      aria-label={label}
    >
      <img src={iconSrc} alt="" className="w-17.5 h-17.5" aria-hidden="true" />
    </button>
  );
}
