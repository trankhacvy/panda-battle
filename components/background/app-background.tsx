import Image from "next/image";

export const AppBackground = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[-9999]">
    <Image
      src="/images/app-bg.png"
      alt=""
      fill
      priority
      quality={90}
      sizes="100vw"
      style={{
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  </div>
);
