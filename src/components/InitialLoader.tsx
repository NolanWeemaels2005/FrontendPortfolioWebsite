import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

type LoaderPhase = "loading" | "logo-exit" | "revealing" | "complete";

const initialLoadTimeout = 4000;
const minimumLoaderDuration = 400;
const logoExitDuration = 300;
const revealDuration = 400;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function waitForRouteMarkup() {
  return new Promise<void>((resolve) => {
    const pageShell = document.querySelector(".page-shell");
    if (pageShell?.childElementCount) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      const nextPageShell = document.querySelector(".page-shell");
      if (!nextPageShell?.childElementCount) return;
      observer.disconnect();
      resolve();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 5000);
  });
}

function extractBackgroundUrls(root: Element) {
  const urls = new Set<string>();
  const elements = [
    root,
    ...Array.from(root.querySelectorAll("[class*='hero'], [class*='landing'], [class*='media'], [class*='cover']")),
  ];

  elements.forEach((element) => {
    const backgroundImage = window.getComputedStyle(element).backgroundImage;
    const matches = backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g);
    for (const match of matches) {
      if (match[1] && !match[1].startsWith("data:")) urls.add(match[1]);
    }
  });

  return urls;
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();
    image.onload = finish;
    image.onerror = finish;
    image.src = url;
    if (image.complete) finish();
  });
}

async function waitForPageAssets() {
  const root = document.querySelector(".page-shell");
  if (!root) return;

  const imageUrls = new Set<string>();
  root.querySelectorAll<HTMLImageElement>("img:not([loading='lazy'])").forEach((image) => {
    const url = image.currentSrc || image.src;
    if (url) imageUrls.add(url);
  });
  extractBackgroundUrls(root).forEach((url) => imageUrls.add(url));

  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video:not([preload='none'])"));
  const videoPromises = videos.map(
    (video) =>
      new Promise<void>((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          resolve();
          return;
        }
        const finish = () => resolve();
        video.addEventListener("loadeddata", finish, { once: true });
        video.addEventListener("error", finish, { once: true });
        window.setTimeout(finish, 6000);
        video.load();
      }),
  );

  await Promise.allSettled([...Array.from(imageUrls, preloadImage), ...videoPromises]);
}

async function waitForDocumentLoad() {
  if (document.readyState === "complete") return;
  await new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
}

export function InitialLoader({ pathname: _pathname }: { pathname: string }) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<LoaderPhase>("loading");

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();

    document.documentElement.setAttribute("aria-busy", "true");
    document.body.classList.add("initial-loader-active");

    const loadInitialPage = async () => {
      await waitForRouteMarkup();
      await waitForDocumentLoad();
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
      await waitForPageAssets();
    };

    void Promise.race([loadInitialPage(), wait(initialLoadTimeout)]).then(async () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed < minimumLoaderDuration) await wait(minimumLoaderDuration - elapsed);
      if (cancelled) return;
      setPhase("logo-exit");
      await wait(logoExitDuration);
      if (cancelled) return;
      setPhase("revealing");
      await wait(revealDuration);
      if (cancelled) return;
      setPhase("complete");
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
      if (cancelled) return;
      document.body.classList.remove("initial-loader-active");
      document.documentElement.removeAttribute("aria-busy");
    });

    return () => {
      cancelled = true;
      document.body.classList.remove("initial-loader-active");
      document.documentElement.removeAttribute("aria-busy");
    };
  }, []);

  if (phase === "complete") return null;

  const loaderStyle = {
    "--loader-logo-mask": `url("${assetPath("assets/logos/main-logo-white.svg")}")`,
  } as CSSProperties;

  return (
    <div className={`initial-loader initial-loader--${phase}`} style={loaderStyle} role="status" aria-live="polite">
      <div className="initial-loader__veil" aria-hidden="true" />
      <div className="initial-loader__logo-cover" aria-hidden="true" />
      <div className="initial-loader__center">
        <img src={assetPath("assets/logos/main-logo-white.svg")} alt="Nolan" width="2034" height="572" />
        <span className="initial-loader__spinner" aria-hidden="true" />
        <span className="sr-only">{t("loader.loading")}</span>
      </div>
      <p className="initial-loader__label">{t("loader.label")}</p>
    </div>
  );
}
