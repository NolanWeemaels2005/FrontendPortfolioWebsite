import { useEffect, useRef } from "react";

/** A small SVG cap: only its edge bends, never the full-page content. */
export function ScrollSectionEdge({ audit = false, color }: { audit?: boolean; color?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    const draw = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, root.getBoundingClientRect().top / window.innerHeight));
      const bend = motion.matches ? 0 : 64 * Math.sin(Math.PI * progress);
      root.style.visibility = window.scrollY > 1 ? "visible" : "hidden";
      // Use actual CSS pixels so resizing cannot stretch a circular arc into an ellipse.
      const width = Math.max(1, root.getBoundingClientRect().width);
      const radius = (width * width / 4 + bend * bend) / (2 * Math.max(bend, .001));
      const edge = bend < .01 ? `M0 80 L${width} 80` : `M0 80 A${radius} ${radius} 0 0 1 ${width} 80`;
      fillRef.current?.ownerSVGElement?.setAttribute("viewBox", `0 0 ${width} 82`);
      fillRef.current?.setAttribute("d", `${edge} L${width} 82 L0 82 Z`);
      lineRef.current?.setAttribute("d", edge);
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: "100px 0px" });
    observer.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", draw);
    draw();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", draw);
    };
  }, []);

  return (
    <div ref={rootRef} className={`home-section-edge${audit ? " home-section-edge--audit" : ""}`} style={color ? { color } : undefined} aria-hidden="true">
      <svg viewBox="0 0 1000 82" preserveAspectRatio="none" focusable="false">
        <path ref={fillRef} d="M0 80 Q500 80 1000 80 L1000 82 L0 82 Z" fill="currentColor" />
        <path ref={lineRef} d="M0 80 Q500 80 1000 80" fill="none" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
