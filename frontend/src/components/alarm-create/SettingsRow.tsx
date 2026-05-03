export function SettingsRow({
  icon,
  label,
  value,
  topRounded = false,
  bottomRounded = false,
  trailing,
}: {
  icon: string;
  label: string;
  value?: string;
  topRounded?: boolean;
  bottomRounded?: boolean;
  trailing?: string;
}) {
  return (
    <div
      className={`flex w-full items-center justify-between bg-white/85 p-3.75 text-[#ef5c58] mix-blend-soft-light ${
        topRounded ? "rounded-t-[15px] rounded-b-[5px]" : ""
      } ${bottomRounded ? "rounded-b-[15px] rounded-t-[5px]" : ""} ${
        !topRounded && !bottomRounded ? "rounded-[5px]" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <img
          src={icon}
          alt=""
          className="h-7.5 w-7.5 shrink-0"
          aria-hidden="true"
        />
        <span className="text-[20px] font-medium text-black">{label}</span>
      </div>
      {(trailing && (
        <img
          src={trailing}
          alt=""
          className="h-6.25 w-6.25 shrink-0 opacity-60"
          aria-hidden="true"
        />
      )) ?? (
        <>
          <span className="text-[20px] font-medium text-black opacity-90">
            {value}
          </span>
        </>
      )}
    </div>
  );
}
