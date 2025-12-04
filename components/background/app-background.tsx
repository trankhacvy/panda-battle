export const AppBackground = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[-9999]">
    <picture>
      <source srcSet="/images/app-bg.avif" type="image/avif" />
      <source srcSet="/images/app-bg.webp" type="image/webp" />
      <img
        src="/images/app-bg.png"
        alt=""
        className="h-full w-full object-cover object-center"
      />
    </picture>
  </div>
);
