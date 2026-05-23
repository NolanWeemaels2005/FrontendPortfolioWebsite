import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

type TiltOptions = {
  max?: number;
  scale?: number;
};

export function useTilt({ max = 8, scale = 1.015 }: TiltOptions = {}) {
  const frameRef = useRef<number | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const latestPointerRef = useRef<{ element: HTMLElement; x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function applyTilt() {
    frameRef.current = null;
    const latestPointer = latestPointerRef.current;
    if (!latestPointer) return;

    const { element, x, y } = latestPointer;
    const rect = rectRef.current ?? element.getBoundingClientRect();
    rectRef.current = rect;

    const localX = x - rect.left;
    const localY = y - rect.top;
    const middleX = rect.width / 2;
    const middleY = rect.height / 2;
    const rotateY = ((localX - middleX) / middleX) * max;
    const rotateX = -((localY - middleY) / middleY) * max;
    const glareX = (localX / rect.width) * 100;
    const glareY = (localY / rect.height) * 100;

    element.style.setProperty("--tilt-rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--tilt-ry", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--tilt-scale", String(scale));
    element.style.setProperty("--glare-x", `${glareX.toFixed(2)}%`);
    element.style.setProperty("--glare-y", `${glareY.toFixed(2)}%`);
    element.style.setProperty("--glare-opacity", "1");
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;

    const element = event.currentTarget;
    latestPointerRef.current = { element, x: event.clientX, y: event.clientY };

    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(applyTilt);
    }
  }

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    latestPointerRef.current = null;
    rectRef.current = null;

    const element = event.currentTarget;
    element.style.setProperty("--tilt-rx", "0deg");
    element.style.setProperty("--tilt-ry", "0deg");
    element.style.setProperty("--tilt-scale", "1");
    element.style.setProperty("--glare-opacity", "0");
  }

  return {
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onPointerEnter: () => {
      rectRef.current = null;
    },
  };
}
