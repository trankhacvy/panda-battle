export const AppBackground = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 z-[-9999]"
    style={{
      backgroundImage: "url(/images/app-bg.png)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  />
);
