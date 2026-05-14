export function ActionPill({
  children,
  muted = false,
  align = "center",
  type = "button",
}: {
  children: string;
  muted?: boolean;
  align?: "center" | "left";
  type?: "button" | "submit";
}) {
  return (
    <button
      className={`rounded-full bg-white px-3.75 py-2.5 text-[20px] font-medium text-black transition-all duration-200 ${
        muted ? "opacity-50" : ""
      } ${align === "left" ? "text-left" : "text-center"}`}
      type={type}
    >
      {children}
    </button>
  );
}
