import { useEffect, useRef } from "react";

// Exact logo outline, translated so its center is (0, 0).
const STAR = "M30.58,-4.76c-11.96-4.43-21.4-13.86-25.82-25.82-1.63-4.42-7.88-4.42-9.52,0-4.43,11.96-13.86,21.4-25.82,25.82-4.42,1.63-4.42,7.88,0,9.52,11.96,4.43,21.4,13.86,25.82,25.82,1.63,4.42,7.88,4.42,9.52,0,4.43-11.96,13.86-21.4,25.82-25.82,4.42-1.63,4.42-7.88,0-9.52Z";

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const star = new Path2D(STAR);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;

    function draw() {
      if (!context) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      // Match the reference: a small star below and left of the headline.
      context.translate(width * .39, height * .70);
      context.rotate(-Math.PI / 12);
      const minimumRadius = Math.max(22, width * .025);
      const spacing = Math.max(20, width * .027);
      const phase = (elapsed % 10500) / 10500 * 2;
      const limit = Math.hypot(width * .61, height * .70) * 2.5;
      for (let index = -2; index < Math.ceil(limit / spacing); index++) {
        const progress = index + phase;
        if (progress < 0) continue;
        // Gradually widen the gaps as each contour moves away from the center.
        const radius = minimumRadius + spacing * (progress + .025 * progress * progress);
        if (radius > limit) break;
        const scale = radius / 34;
        context.save();
        context.scale(scale, scale);
        context.lineWidth = 1 / scale;
        context.globalAlpha = .23 * Math.min(1, (radius - minimumRadius) / spacing);
        context.strokeStyle = index % 2 === 0 ? "#ff993f" : "#ffffff";
        context.stroke(star);
        context.restore();
      }
    }

    function tick(time: number) {
      // At most 30 drawings per second; elapsed time stays frozen while offscreen.
      if (!previousTime) previousTime = time;
      if (time - previousTime >= 1000 / 30) {
        elapsed += Math.min(time - previousTime, 100);
        previousTime = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function updatePlayback() {
      cancelAnimationFrame(frame);
      previousTime = 0;
      if (visible && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(tick);
      } else if (reducedMotion.matches) {
        draw();
      }
    }

    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      // Bound the backing store even on Retina displays: no oversized SVG layers.
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25, 2400 / Math.max(width, height, 1));
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      draw();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    resize.observe(canvas);
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      reducedMotion.removeEventListener("change", updatePlayback);
    };
  }, []);

  return (
    <div className="home-landing__background" aria-hidden="true">
      <canvas ref={canvasRef} className="home-star-canvas" />
    </div>
  );
}
