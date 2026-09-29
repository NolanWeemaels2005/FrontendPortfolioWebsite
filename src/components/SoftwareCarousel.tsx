import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { softwareTools } from "../data/softwareTools";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

export function SoftwareCarousel() {
  const { t } = useLanguage();
  const [paused, setPaused] = useState(false);

  return (
    <section className="software-carousel" aria-labelledby="software-heading" data-paused={paused}>
      <header className="software-carousel__header">
        <h2 id="software-heading">
          <span>{t("home.software.heading")}</span>
          <strong>{t("home.software.title")}</strong>
        </h2>
        <button
          type="button"
          className="software-carousel__toggle"
          onClick={() => setPaused((value) => !value)}
          aria-label={t(paused ? "home.software.play" : "home.software.pause")}
        >
          {paused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}
        </button>
      </header>
      <div className="software-carousel__viewport">
        <div className="software-carousel__track">
          {[0, 1].map((copy) => (
            <ul className="software-carousel__group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {softwareTools.map((tool) => (
                <li className="software-carousel__card" key={tool.label}>
                  <img
                    src={assetPath(`assets/about-story/${tool.icon}`)}
                    alt=""
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{tool.label}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
