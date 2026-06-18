import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function ListeningBorder({ isActive }: { isActive: boolean }) {
  const borderRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const proxy = { angle: 0 };
    const ctx = gsap.context(() => {
      // Smoothly fade and scale in the border
      gsap.fromTo(
        [borderRef.current, blurRef.current],
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1,
        },
      );

      // Animate the rotation angle endlessly
      gsap.to(proxy, {
        angle: 360,
        duration: 3.5,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          borderRef.current?.style.setProperty(
            "--glow-angle",
            `${proxy.angle}deg`,
          );
          blurRef.current?.style.setProperty(
            "--glow-angle",
            `${proxy.angle}deg`,
          );
        },
      });
    });

    return () => ctx.revert();
  }, [isActive]);

  if (!isActive) return null;

  const gradientBackground = `linear-gradient(black, black) padding-box, conic-gradient(from var(--glow-angle, 0deg), #4d8df1, #d64797, #e47551, #e3a033, #4d8df1) border-box`;
  const maskStyle = {
    WebkitMask:
      "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-100 overflow-hidden rounded-[50px]">
      {/* Main crisp border line */}
      <div
        ref={borderRef}
        className="absolute inset-0 rounded-[50px]"
        style={{
          background: gradientBackground,
          border: "6px solid transparent",
          ...maskStyle,
        }}
      />
      {/* Blurred outer/inner glow for the neon light effect */}
      <div
        ref={blurRef}
        className="absolute inset-0 rounded-[50px] opacity-70 blur-[15px]"
        style={{
          background: gradientBackground,
          border: "12px solid transparent",
          ...maskStyle,
        }}
      />
    </div>
  );
}
