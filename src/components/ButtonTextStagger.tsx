import type { CSSProperties } from "react";

type ButtonTextStaggerProps = {
  text: string;
  staggerMs?: number;
  durationMs?: number;
  wrap?: boolean;
};

export function ButtonTextStagger({ text, staggerMs = 32, durationMs = 360, wrap = false }: ButtonTextStaggerProps) {
  const renderCharacter = (char: string, index: number) => (
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
  );

  if (wrap) {
    let characterOffset = 0;

    return (
      <span className="button-text-stagger button-text-stagger--wrap" aria-label={text}>
        {text.trim().split(/\s+/).map((word, wordIndex) => {
          const wordOffset = characterOffset;
          characterOffset += word.length + 1;

          return (
            <span className="button-text-stagger__word" key={`${word}-${wordIndex}`}>
              {Array.from(word).map((char, charIndex) => renderCharacter(char, wordOffset + charIndex))}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className="button-text-stagger" aria-label={text}>
      {Array.from(text).map(renderCharacter)}
    </span>
  );
}
