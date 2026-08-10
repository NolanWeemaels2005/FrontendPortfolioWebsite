import { useEffect, useState } from "react";
import { previewImageUrl, responsiveImageSrcSet } from "../../utils/asset";

export type MarqueeImage = {
  src: string;
  alt: string;
  logoSrc?: string;
  href?: string;
  target?: string;
};

type ThreeDMarqueeProps = {
  images: MarqueeImage[];
  className?: string;
  onImageClick?: (image: MarqueeImage, index: number) => void;
};

const compactMarqueeQuery = "(max-width: 61.25rem)";

function useCompactMarquee() {
  const [isCompact, setIsCompact] = useState(() => (
    typeof window !== "undefined" && window.matchMedia(compactMarqueeQuery).matches
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia(compactMarqueeQuery);
    const update = () => setIsCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isCompact;
}

function splitColumns(images: MarqueeImage[], columnCount: number, itemsPerColumn: number) {
  if (images.length === 0) {
    return Array.from({ length: columnCount }, () => []);
  }

  return Array.from({ length: columnCount }, (_, columnIndex) => (
    Array.from({ length: itemsPerColumn }, (_, rowIndex) => (
      images[(rowIndex * columnCount + columnIndex) % images.length]
    ))
  ));
}

export function ThreeDMarquee({ images, className = "", onImageClick }: ThreeDMarqueeProps) {
  const isCompact = useCompactMarquee();
  const columnCount = isCompact ? 3 : 5;
  const itemsPerColumn = isCompact ? 6 : 8;
  const columns = splitColumns(images, columnCount, itemsPerColumn);

  return (
    <div className={`three-d-marquee ${className}`} aria-hidden={onImageClick ? undefined : true}>
      <div className="three-d-marquee__scene">
        {columns.map((columnImages, columnIndex) => (
          <div className="three-d-marquee__column" key={columnIndex}>
            <div className="three-d-marquee__track">
              {[0, 1].map((groupIndex) => (
                <div className="three-d-marquee__group" key={groupIndex}>
                  {columnImages.map((image, imageIndex) => {
                    const absoluteIndex = imageIndex * columnCount + columnIndex;
                    const coverSrcSet = responsiveImageSrcSet(image.src, 320, 960);
                    const isPriorityImage = columnIndex === (isCompact ? 1 : 3) && groupIndex === 0 && imageIndex === 2;
                    const content = (
                      <>
                        <img
                          className="three-d-marquee__cover"
                          src={image.src}
                          srcSet={coverSrcSet}
                          sizes="(max-width: 40rem) 48vw, (max-width: 64rem) 30vw, 18vw"
                          alt={image.alt}
                          width="640"
                          height="800"
                          loading="eager"
                          decoding="async"
                          fetchPriority={isPriorityImage ? "high" : "low"}
                          data-loader-skip="true"
                        />
                        {image.logoSrc ? (
                          <span className="three-d-marquee__logo-wrap" aria-hidden="true">
                            <img
                              className="three-d-marquee__logo"
                              src={previewImageUrl(image.logoSrc, 256)}
                              alt=""
                              width="256"
                              height="256"
                              loading="eager"
                              decoding="async"
                              fetchPriority={isPriorityImage ? "high" : "low"}
                              data-loader-skip="true"
                            />
                          </span>
                        ) : null}
                      </>
                    );

                    if (onImageClick) {
                      return (
                        <button
                          className="three-d-marquee__item"
                          type="button"
                          onClick={() => onImageClick(image, absoluteIndex % images.length)}
                          key={`${image.src}-${columnIndex}-${groupIndex}-${imageIndex}`}
                        >
                          {content}
                        </button>
                      );
                    }

                    if (image.href) {
                      return (
                        <a
                          className="three-d-marquee__item"
                          href={image.href}
                          target={image.target}
                          rel={image.target === "_blank" ? "noopener noreferrer" : undefined}
                          tabIndex={-1}
                          key={`${image.src}-${columnIndex}-${groupIndex}-${imageIndex}`}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <span className="three-d-marquee__item" key={`${image.src}-${columnIndex}-${groupIndex}-${imageIndex}`}>
                        {content}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
