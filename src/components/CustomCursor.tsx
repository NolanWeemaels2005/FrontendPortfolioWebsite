import { useEffect, useRef } from "react";
import "../styles/cursor.css";
import { useLanguage } from "../i18n/LanguageContext";

const interactiveSelector = 'a, button, [role="button"], summary, [data-cursor]';
const nativeSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), iframe, video[controls]';

export function CustomCursor() {
  const { t } = useLanguage();
  const labelRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let pressed = false;
    let projectLabelWidth = 0;
    let previousLabel = "";
    const appliedStyles = new Map<string, string>();
    const setStyle = (property: string, value: string) => {
      if (appliedStyles.get(property) === value) return;
      cursor.style.setProperty(property, value);
      appliedStyles.set(property, value);
    };

    let magnet: { element: HTMLElement; animation: Animation; dx: number; dy: number } | null = null;
    const returning = new Map<HTMLElement, Animation>();

    const releaseMagnet = (immediate = false) => {
      if (!magnet) return;
      const { element, animation, dx, dy } = magnet;
      magnet = null;
      animation.cancel();
      if (immediate || reducedMotion.matches || !element.isConnected) return;
      const settle = element.animate([
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0px, 0px)" },
      ], { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)", composite: "add" });
      returning.set(element, settle);
      settle.onfinish = () => {
        settle.cancel();
        if (returning.get(element) === settle) returning.delete(element);
      };
    };

    const hide = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      cursor.classList.remove("is-visible");
      document.documentElement.classList.remove("custom-cursor-active");
      pressed = false;
      releaseMagnet();
    };

    const draw = () => {
      frame = 0;
      const target = document.elementFromPoint(x, y);
      if (!finePointer.matches || !target || target.closest(nativeSelector)) {
        hide();
        return;
      }
      const control = target.closest<HTMLElement>(interactiveSelector);
      const enabled = control && !control.matches(':disabled, [aria-disabled="true"]');
      const project = enabled && (control.dataset.cursor === "project" || control.dataset.cursor === "image");
      let rect = enabled && !project ? control.getBoundingClientRect() : null;
      if (labelRef.current) {
        const label = control?.dataset.cursorLabel || t(control?.dataset.cursor === "image" ? "cursor.viewImage" : "cursor.viewProject");
        if (previousLabel !== label) {
          labelRef.current.textContent = label;
          previousLabel = label;
          projectLabelWidth = 0;
        }
        if (project && !projectLabelWidth) projectLabelWidth = labelRef.current.offsetWidth;
      }
      const merge = !project && rect && (control?.dataset.cursor === "merge" || (!control?.dataset.cursor && control?.matches("button, [role=button]"))) && rect.width <= 320 && rect.height <= 100;
      if (merge && control && rect && !reducedMotion.matches) {
        if (magnet?.element !== control) {
          releaseMagnet();
          returning.get(control)?.cancel();
          returning.delete(control);
          rect = control.getBoundingClientRect();
          const animation = control.animate(
            [{ transform: "translate(0px, 0px)" }],
            { duration: 0, fill: "both", composite: "add" },
          );
          magnet = { element: control, animation, dx: 0, dy: 0 };
        }
        if (magnet) {
          // Subtract our previous movement to prevent feedback and drifting.
          const centerX = rect.left + rect.width / 2 - magnet.dx;
          const centerY = rect.top + rect.height / 2 - magnet.dy;
          magnet.dx = Math.max(-5, Math.min(5, (x - centerX) * .12));
          magnet.dy = Math.max(-4, Math.min(4, (y - centerY) * .16));
          (magnet.animation.effect as KeyframeEffect).setKeyframes([
            { transform: `translate(${magnet.dx}px, ${magnet.dy}px)` },
          ]);
          rect = control.getBoundingClientRect();
        }
      } else {
        releaseMagnet();
      }
      const width = project ? (projectLabelWidth || 72) + 32 : merge && rect ? rect.width : enabled ? 32 : 24;
      const height = project ? 40 : merge && rect ? rect.height : width;
      const centerX = merge && rect ? rect.left + rect.width / 2 : x;
      const centerY = merge && rect ? rect.top + rect.height / 2 : y;
      setStyle("width", `${width}px`);
      setStyle("height", `${height}px`);
      const shape = merge && control ? window.getComputedStyle(control) : null;
      setStyle("border-top-left-radius", shape?.borderTopLeftRadius ?? (project ? "999px" : "50%"));
      setStyle("border-top-right-radius", shape?.borderTopRightRadius ?? (project ? "999px" : "50%"));
      setStyle("border-bottom-right-radius", shape?.borderBottomRightRadius ?? (project ? "999px" : "50%"));
      setStyle("border-bottom-left-radius", shape?.borderBottomLeftRadius ?? (project ? "999px" : "50%"));
      setStyle("clip-path", shape?.clipPath ?? "none");
      // Anchor the center so resizing never shifts the highlight off the button.
      cursor.style.transform = `translate3d(${centerX}px, ${centerY}px, 0) translate(-50%, -50%) scale(${pressed && !merge ? .86 : 1})`;
      cursor.classList.toggle("is-project", Boolean(project));
      cursor.classList.toggle("is-pressed", pressed);
      cursor.classList.toggle("is-merged", Boolean(merge));
      cursor.classList.toggle("is-reduced-motion", reducedMotion.matches);
      cursor.classList.add("is-visible");
      document.documentElement.classList.add("custom-cursor-active");
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      schedule();
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pressed = true;
      move(event);
    };
    const up = (event: PointerEvent) => {
      pressed = false;
      move(event);
    };
    const scroll = () => {
      if (cursor.classList.contains("is-visible")) schedule();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Tab") hide();
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("keydown", key);
    window.addEventListener("blur", hide);
    window.addEventListener("resize", scroll);
    window.addEventListener("scroll", scroll, { passive: true, capture: true });
    document.addEventListener("visibilitychange", hide);
    finePointer.addEventListener("change", hide);

    return () => {
      releaseMagnet(true);
      returning.forEach((animation) => animation.cancel());
      returning.clear();
      window.cancelAnimationFrame(frame);
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("keydown", key);
      window.removeEventListener("blur", hide);
      window.removeEventListener("resize", scroll);
      window.removeEventListener("scroll", scroll, true);
      document.removeEventListener("visibilitychange", hide);
      finePointer.removeEventListener("change", hide);
    };
  }, [t]);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <span ref={labelRef} className="custom-cursor__label">{t("cursor.viewProject")}</span>
    </div>
  );
}
