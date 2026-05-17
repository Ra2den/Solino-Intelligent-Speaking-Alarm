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
      className="w-25 h-25 rounded-[35px] bg-black mix-blend-soft-light transition-opacity duration-300 hover:opacity-80 flex items-center justify-center"
      aria-label={label}
    >
      <img src={iconSrc} alt="" className="w-12.5 h-12.5" aria-hidden="true" />
    </button>
  );
}
