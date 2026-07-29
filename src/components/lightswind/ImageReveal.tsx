import { useMemo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";

type ImageRevealItem = {
  src: string;
  alt: string;
  href: string;
};

type ImageRevealProps = {
  images?: ImageRevealItem[];
  children?: ReactNode;
};

function hashString(value: string, seed: number) {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getFixedPosition(value: string) {
  const xHash = hashString(value, 2166136261);
  const yHash = hashString(value, 3339675911);

  return {
    x: 12 + (xHash % 7600) / 100,
    y: 18 + (yHash % 6400) / 100,
  };
}

export default function ImageReveal({ images = [], children }: ImageRevealProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const positionedImages = useMemo(
    () => images.map((image) => ({ ...image, position: getFixedPosition(image.href) })),
    [images],
  );

  const activateNearestProject = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!positionedImages.length || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    positionedImages.forEach((image, index) => {
      const horizontalDistance = image.position.x - pointerX;
      const verticalDistance = image.position.y - pointerY;
      const distance = (horizontalDistance * horizontalDistance) + (verticalDistance * verticalDistance);
      if (distance >= nearestDistance) return;
      nearestDistance = distance;
      nearestIndex = index;
    });

    setActiveIndex((currentIndex) => currentIndex === nearestIndex ? currentIndex : nearestIndex);
  };

  return (
    <div
      className={`image-reveal ${activeIndex !== null ? "is-active" : ""}`}
      onPointerEnter={activateNearestProject}
      onPointerMove={activateNearestProject}
      onPointerLeave={() => setActiveIndex(null)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null);
      }}
    >
      {children}
      <div className="image-reveal__stage">
        {positionedImages.map((image, index) => {
          const frameStyle = {
            "--reveal-x": `${image.position.x}%`,
            "--reveal-y": `${image.position.y}%`,
          } as CSSProperties;

          return (
            <figure className={`image-reveal__frame ${activeIndex === index ? "is-active" : ""}`} key={image.href} style={frameStyle}>
              <Link to={image.href} aria-label={`Bekijk ${image.alt}`} onFocus={() => setActiveIndex(index)}>
                <img
                  src={image.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
