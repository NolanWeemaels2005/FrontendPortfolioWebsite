export function ProcessMedia({ videoSrc }: { videoSrc: string }) {
  return (
    <div className="home-landing__media" aria-hidden="true">
      <video autoPlay muted loop playsInline preload="auto">
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
