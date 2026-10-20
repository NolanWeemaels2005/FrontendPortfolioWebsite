import { assetPath } from "../utils/asset";

// Pass the finished process video's URL here; the photo remains its poster.
export function ProcessMedia({ videoSrc }: { videoSrc?: string }) {
  const poster = assetPath("assets/home/design-process-1800.jpg");

  return (
    <div className="home-landing__media" aria-hidden="true">
      {videoSrc ? (
        <video autoPlay muted loop playsInline poster={poster}>
          <source src={videoSrc} />
        </video>
      ) : (
        <img src={poster} srcSet={`${assetPath("assets/home/design-process-900.jpg")} 900w, ${poster} 1800w`} sizes="100vw" alt="" width="2948" height="4030" fetchPriority="high" decoding="async" />
      )}
    </div>
  );
}
