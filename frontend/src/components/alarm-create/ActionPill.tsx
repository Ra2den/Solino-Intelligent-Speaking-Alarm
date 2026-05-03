export function ActionPill({
  children,
  muted = false,
  align = "center",
}: {
  children: string;
  muted?: boolean;
  align?: "center" | "left";
}) {
  return (
    <button
      className={`rounded-full bg-white px-3.75 py-2.5 text-[20px] font-medium text-black transition-all duration-200 ${
        muted ? "opacity-50" : ""
      } ${align === "left" ? "text-left" : "text-center"}`}
      type="button"
    >
      {children}
    </button>
  );
}
