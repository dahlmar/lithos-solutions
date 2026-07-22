export default function LithosBackground() {
  return (
    <>
      <div
        className="
        absolute
        inset-0
        overflow-hidden
        pointer-events-none
        "
      >
        <div
          className="
          absolute
          inset-[-80px]
          opacity-40
          animate-lithos-grid
          "
          style={{
            backgroundImage:
              `
              linear-gradient(
                rgba(255,255,255,0.035) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.035) 1px,
                transparent 1px
              )
              `,
            backgroundSize: "60px 60px",
          }}
        />

        <div
          className="
          absolute
          top-[22%]
          left-1/2
          -translate-x-1/2
          w-[900px]
          h-[900px]
          rounded-full
          animate-lithos-glow
          "
          style={{
            background:
              "radial-gradient(circle, rgba(31,176,124,0.12) 0%, transparent 60%)",
          }}
        />

      </div>
    </>
  );
}
