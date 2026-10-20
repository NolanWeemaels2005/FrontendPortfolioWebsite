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

async function waitForPageAssets() {
  const root = document.querySelector(".page-shell");
  if (!root) return;

  // Only wait for visible, eager images. Offscreen galleries and videos load independently.
  const images = Array.from(root.querySelectorAll<HTMLImageElement>("img:not([loading='lazy']):not([data-loader-skip='true'])"))
    .filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
    });
  await Promise.allSettled(images.map((image) => new Promise<void>((resolve) => {
    if (image.complete) { resolve(); return; }
    const finish = () => {
      clearTimeout(timeout);
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, initialLoadTimeout);
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  })));
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
      if (cancelled) return;
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
        <img src={assetPath("assets/logos/main-logo-white.svg")} alt="Nolan" width="2034" height="572" fetchPriority="high" />
        <span className="initial-loader__spinner" aria-hidden="true" />
        <span className="sr-only">{t("loader.loading")}</span>
      </div>
      <p className="initial-loader__label">{t("loader.label")}</p>
    </div>
  );
}
