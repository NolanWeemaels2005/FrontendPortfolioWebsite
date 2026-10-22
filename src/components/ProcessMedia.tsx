import { useEffect, useRef } from "react";

const LOOP_FADE_SECONDS = 0.8;

export function ProcessMedia({ videoSrc }: { videoSrc: string }) {
  const firstRef = useRef<HTMLVideoElement>(null);
  const secondRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const first = firstRef.current;
    const second = secondRef.current;
    if (!first || !second) return;
    let current = first;
    let next = second;
    let frame = 0;
    let disposed = false;
    let starting = false;
    let blending = false;
    let fallback = false;
    let fadeDuration = LOOP_FADE_SECONDS;

    first.style.opacity = "1";
    first.style.zIndex = "0";
    second.style.opacity = "0";
    second.style.zIndex = "1";

    const useNativeLoop = () => {
      if (disposed) return;
      fallback = true;
      blending = false;
      starting = false;
      next.pause();
      next.style.opacity = "0";
      current.style.opacity = "1";
      current.loop = true;
      if (current.ended) current.currentTime = 0;
      void current.play().catch(() => {});
    };

    const tick = () => {
      if (disposed) return;
      if (blending) {
        // Follow decoded playback time: buffering must never fade to a blank frame.
        const progress = Math.min(1, next.currentTime / fadeDuration);
        next.style.opacity = String(progress);
        if (progress >= 1) {
          current.pause();
          current.style.opacity = "0";
          current.currentTime = 0;
          [current, next] = [next, current];
          current.style.zIndex = "0";
          next.style.zIndex = "1";
          blending = false;
        }
      } else if (!starting && !fallback && Number.isFinite(current.duration) && current.duration > 0) {
        fadeDuration = Math.min(LOOP_FADE_SECONDS, current.duration / 3);
        if (current.duration - current.currentTime <= fadeDuration && next.readyState >= 2) {
          starting = true;
          next.currentTime = 0;
          void next.play().then(() => {
            if (disposed) return;
            starting = false;
            blending = true;
          }).catch(useNativeLoop);
        } else if (current.ended && next.readyState < 2) {
          useNativeLoop();
        }
      }
      if (!fallback) frame = window.requestAnimationFrame(tick);
    };

    void first.play().catch(() => {});
    frame = window.requestAnimationFrame(tick);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      first.pause();
      second.pause();
      first.loop = false;
      second.loop = false;
    };
  }, [videoSrc]);

  return (
    <div className="home-landing__media" aria-hidden="true">
      <video ref={firstRef} src={videoSrc} autoPlay muted playsInline preload="auto" />
      <video ref={secondRef} src={videoSrc} muted playsInline preload="auto" style={{ opacity: 0 }} />
    </div>
  );
}
