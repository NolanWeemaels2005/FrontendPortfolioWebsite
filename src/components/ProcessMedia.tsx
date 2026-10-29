import { useEffect, useRef } from "react";

const LOOP_FADE_SECONDS = 0.8;

export function ProcessMedia({ videoSrc }: { videoSrc: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLVideoElement>(null);
  const secondRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const first = firstRef.current;
    const second = secondRef.current;
    const container = containerRef.current;
    if (!first || !second || !container) return;
    let current = first;
    let next = second;
    let frame = 0;
    let disposed = false;
    let starting = false;
    let blending = false;
    let fallback = false;
    let visible = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canPlay = () => visible && !document.hidden && !motion.matches;
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
      if (canPlay()) void current.play().catch(() => {});
    };

    const tick = () => {
      frame = 0;
      if (disposed || !canPlay()) return;
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
            if (!canPlay()) { next.pause(); return; }
            blending = true;
          }).catch(useNativeLoop);
        } else if (current.ended && next.readyState < 2) {
          useNativeLoop();
        }
      }
      if (!fallback) frame = window.requestAnimationFrame(tick);
    };

    const syncPlayback = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (!canPlay()) { first.pause(); second.pause(); return; }
      void current.play().catch(() => {});
      if (blending) void next.play().catch(() => {});
      if (!fallback) frame = window.requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", syncPlayback);
      window.cancelAnimationFrame(frame);
      first.pause();
      second.pause();
      first.loop = false;
      second.loop = false;
    };
  }, [videoSrc]);

  return (
    <div ref={containerRef} className="home-landing__media" aria-hidden="true">
      <video ref={firstRef} src={videoSrc} muted playsInline preload="auto" />
      <video ref={secondRef} src={videoSrc} muted playsInline preload="auto" style={{ opacity: 0 }} />
    </div>
  );
}
