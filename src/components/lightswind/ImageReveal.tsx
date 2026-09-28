import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { projectRevealLayout } from "../../utils/projectRevealLayout";
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

export default function ImageReveal({ images = [], children }: ImageRevealProps) {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBounds({ width, height });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const [introHrefs, setIntroHrefs] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !images.length || introHrefs.length) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const shuffled = [...images];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setIntroHrefs(shuffled.slice(0, 6).map((image) => image.href));
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(root);
    return () => observer.disconnect();
  }, [images, introHrefs.length]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const positionedImages = useMemo(
    () => {
      const positions = projectRevealLayout(images.length, bounds.width, bounds.height);
      return images.flatMap((image, index) => positions[index] ? [{ ...image, position: positions[index] }] : []);
    },
    [images, bounds],
  );

  const activateNearestProject = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!positionedImages.length || event.pointerType === "touch") return;

    setHasInteracted(true);
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
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
      ref={rootRef}
      className={`image-reveal ${activeIndex !== null ? "is-active" : ""}`}
      onPointerMove={activateNearestProject}
      onPointerLeave={() => setActiveIndex(null)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null);
      }}
    >
      {children}
      <div className="image-reveal__stage">
        {positionedImages.map((image, index) => {
          const introIndex = introHrefs.indexOf(image.href);
          const position = image.position;
          const frameStyle = {
            "--reveal-x": `${position.x}px`,
            "--reveal-y": `${position.y}px`,
            "--reveal-order": introIndex,
            "--reveal-width": `${position.width}px`,
          } as CSSProperties;

          return (
            <figure className={`image-reveal__frame ${activeIndex === index ? "is-active" : ""} ${!hasInteracted && introIndex >= 0 ? "is-intro" : ""}`} key={image.href} style={frameStyle}>
              <Link to={image.href} aria-label={`${t("home.viewProject")} ${image.alt}`} onFocus={() => {
                setHasInteracted(true);
                setActiveIndex(index);
              }}>
                <img
                  src={image.src}
                  alt=""
                  width="320"
                  height="400"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </Link>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
