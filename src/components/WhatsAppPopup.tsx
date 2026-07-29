import { SendHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

const whatsAppMessage = "👋 Hey, ik ben geïnteresseerd in jouw diensten.";
const whatsAppNumber = "32472085890";

export function createWhatsAppHref(message = whatsAppMessage) {
  return `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppPopup() {
  const { language, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [message, setMessage] = useState(t("whatsapp.defaultMessage"));
  const sendHref = useMemo(
    () => createWhatsAppHref(message.trim() || t("whatsapp.defaultMessage")),
    [message, t],
  );

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(sendHref, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    setMessage(t("whatsapp.defaultMessage"));
  }, [language, t]);

  useEffect(() => {
    if (!expanded) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [expanded]);

  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.04 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="whatsapp-contact" data-expanded={expanded} data-footer-visible={footerVisible}>
      <button
        className="whatsapp-contact__launcher"
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={t("whatsapp.open")}
        aria-controls="whatsapp-contact-panel"
        aria-expanded={expanded}
        tabIndex={expanded ? -1 : 0}
      >
        <img src={assetPath("assets/icons/social/WhatsApp.svg")} alt="" />
      </button>

      <aside id="whatsapp-contact-panel" className="whatsapp-contact__panel" aria-label={t("whatsapp.contact")} aria-hidden={!expanded}>
        <div className="whatsapp-contact__header">
          <span>WhatsApp</span>
          <button
            className="whatsapp-contact__close"
            type="button"
            onClick={() => setExpanded(false)}
            aria-label={t("whatsapp.close")}
            tabIndex={expanded ? 0 : -1}
          >
            <X aria-hidden="true" size={15} strokeWidth={2.6} />
          </button>
        </div>
        <div
          className="whatsapp-contact__body"
        >
          <span className="whatsapp-contact__avatar">
            <img src={assetPath("assets/icons/social/WhatsApp.svg")} alt="" />
          </span>
          <span className="whatsapp-contact__message">
            <strong>Nolan</strong>
            <span>{t("whatsapp.reply")}</span>
          </span>
        </div>

        <form className="whatsapp-contact__composer" onSubmit={sendMessage}>
          <label className="sr-only" htmlFor="whatsapp-message">{t("whatsapp.messageLabel")}</label>
          <textarea
            id="whatsapp-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            tabIndex={expanded ? 0 : -1}
          />
          <button
            className="whatsapp-contact__send"
            type="submit"
            aria-label={t("whatsapp.send")}
            title={t("whatsapp.send")}
            tabIndex={expanded ? 0 : -1}
          >
            <SendHorizontal aria-hidden="true" size={20} strokeWidth={2.4} />
          </button>
        </form>
      </aside>
    </div>
  );
}
