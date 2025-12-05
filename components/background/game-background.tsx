export const GameBackground = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 z-[-1]">
    <picture>
      <source srcSet="/images/game-bg.avif" type="image/avif" />
      <source srcSet="/images/game-bg.webp" type="image/webp" />
      <img
        src="/images/game-bg.png"
        alt=""
        className="h-full w-full object-cover object-center"
      />
    </picture>
  </div>
);
