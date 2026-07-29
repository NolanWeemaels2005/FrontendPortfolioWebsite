import type { CSSProperties } from "react";

type ButtonTextStaggerProps = {
  text: string;
  staggerMs?: number;
  durationMs?: number;
};

export function ButtonTextStagger({ text, staggerMs = 32, durationMs = 360 }: ButtonTextStaggerProps) {
  return (
    <span className="button-text-stagger" aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span
          className="button-text-stagger__char"
          style={
            {
              "--button-char-delay": `${index * staggerMs}ms`,
              "--button-char-duration": `${durationMs}ms`,
            } as CSSProperties
          }
          aria-hidden="true"
          key={`${char}-${index}`}
        >
          <span className="button-text-stagger__top">{char === " " ? "\u00a0" : char}</span>
          <span className="button-text-stagger__bottom">{char === " " ? "\u00a0" : char}</span>
        </span>
      ))}
    </span>
  );
}
