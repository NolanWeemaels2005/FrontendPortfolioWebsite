import { useEffect, useRef } from "react";

const defaultSize = 26;

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const isSafari = /^((?!chrome|android|crios|fxios|firefox).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      document.documentElement.classList.add("native-cursor");
      return () => document.documentElement.classList.remove("native-cursor");
    }

    if (!cursor || !finePointer.matches) return;
    const cursorElement = cursor;

    const interactiveSelector = "a, button, input, textarea, select";
    const buttonLikeSelector = "button, .btn, .menu-btn, .nav-talk, .video-play, .contact-form button";
    let frame: number | null = null;
    let nextStyle = "";
    let activeElement: HTMLElement | null = null;
    let activeRect: DOMRect | null = null;
    let activeRadius = 999;
    let pressed = false;

    function clearActiveCache() {
      activeElement = null;
      activeRect = null;
      activeRadius = 999;
    }

    function applyCursor(
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      active: boolean,
      variant: "dot" | "merge" | "soft",
    ) {
      nextStyle = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0) scale(${pressed ? 0.92 : 1})`;
      cursorElement.style.width = `${width}px`;
      cursorElement.style.height = `${height}px`;
      cursorElement.style.borderRadius = `${radius}px`;
      cursorElement.dataset.variant = variant;
      cursorElement.classList.toggle("is-active", active);
      cursorElement.classList.add("is-visible");

      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        cursorElement.style.transform = nextStyle;
      });
    }

    function updateCursor(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;

      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest(interactiveSelector) as HTMLElement | null;

      if (interactive) {
        const mode = interactive.dataset.cursor === "merge" && interactive.matches(buttonLikeSelector) ? "merge" : "soft";

        if (mode === "soft") {
          clearActiveCache();
          applyCursor(event.clientX, event.clientY, 58, 58, 999, true, "soft");
          return;
        }

        activeElement = interactive;
        activeRect = interactive.getBoundingClientRect();
        activeRadius = Number.parseFloat(getComputedStyle(interactive).borderRadius) || 999;

        applyCursor(
          activeRect.left + activeRect.width / 2,
          activeRect.top + activeRect.height / 2,
          activeRect.width + 10,
          activeRect.height + 10,
          activeRadius,
          true,
          "merge",
        );
        return;
      }

      clearActiveCache();
      applyCursor(event.clientX, event.clientY, defaultSize, defaultSize, 999, false, "dot");
    }

    function hideCursor() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      clearActiveCache();
      cursorElement.classList.remove("is-visible");
    }

    function handlePointerDown() {
      pressed = true;
    }

    function handlePointerUp() {
      pressed = false;
    }

    window.addEventListener("pointermove", updateCursor, { passive: true });
    window.addEventListener("pointerleave", hideCursor);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("scroll", clearActiveCache, { passive: true });
    window.addEventListener("resize", clearActiveCache);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", updateCursor);
      window.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("scroll", clearActiveCache);
      window.removeEventListener("resize", clearActiveCache);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      data-variant="dot"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        width: `${defaultSize}px`,
        height: `${defaultSize}px`,
        borderRadius: "999px",
      }}
      aria-hidden="true"
    />
  );
}
