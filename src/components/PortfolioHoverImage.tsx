import { useEffect, useRef, useState } from "react";

type Props = { src: string; srcSet: string; width: number; height: number };

export function PortfolioHoverImage(image: Props) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [near, setNear] = useState(false);
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const link = frame.closest("a");
    const request = () => setRequested(true);
    let nearby = false;
    const pointerChanged = () => { if (nearby && pointer.matches) request(); };
    link?.addEventListener("focus", request);
    pointer.addEventListener("change", pointerChanged);
    const observer = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      setNear(nearby);
      if (entry.isIntersecting && pointer.matches) setRequested(true);
    }, { rootMargin: "250px" });
    observer.observe(frame.parentElement || frame);
    return () => {
      observer.disconnect();
      link?.removeEventListener("focus", request);
      pointer.removeEventListener("change", pointerChanged);
    };
  }, []);

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;
    const img = imageRef.current;
    if (img) void img.decode().then(() => {
      if (!cancelled) setReady(true);
    }).catch(() => { /* Keep the original logo if the preview cannot load. */ });
    return () => { cancelled = true; };
  }, [requested, image.src]);

  return <span ref={frameRef} className={`project-card__hover-frame${ready ? " is-ready" : ""}${near ? " is-near" : ""}`} aria-hidden="true">
    {requested && <img ref={imageRef} className="project-card__hover-image" {...image}
      sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 31vw" alt="" decoding="async" fetchPriority="low" />}
  </span>;
}
