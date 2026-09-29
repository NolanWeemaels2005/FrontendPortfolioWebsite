import { SendHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { assetPath } from "../utils/asset";

const whatsAppMessage = "👋 Hey, ik ben geïnteresseerd in jouw diensten.";
const whatsAppNumber = "32472085890";

export function createWhatsAppHref(message = whatsAppMessage) {
  return `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppPopup() {
  const { language, t } = useLanguage();
  const contactRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState(t("whatsapp.defaultMessage"));
  const sendHref = useMemo(
    () => createWhatsAppHref(message.trim() || t("whatsapp.defaultMessage")),
    [message, t],
  );

  useEffect(() => {
    const contact = contactRef.current;
    const footer = document.querySelector<HTMLElement>(".footer-top");
    if (!contact || !footer) return;

    let frame = 0;
    const syncPosition = () => {
      frame = 0;
      const boundary = footer.getBoundingClientRect().bottom;
      const offset = Math.max(0, window.innerHeight - boundary);
      contact.style.translate = `0 ${-offset}px`;
    };
    const requestSync = () => {
      if (!frame) frame = window.requestAnimationFrame(syncPosition);
    };
    const observer = new ResizeObserver(requestSync);
    observer.observe(document.body);
    observer.observe(footer);
    syncPosition();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

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

  return (
    <div ref={contactRef} className="whatsapp-contact" data-expanded={expanded}>
      <button
        className="whatsapp-contact__launcher"
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={t("whatsapp.open")}
        aria-controls="whatsapp-contact-panel"
        aria-expanded={expanded}
        tabIndex={expanded ? -1 : 0}
      >
          <img src={assetPath("assets/icons/social/WhatsApp.webp")} alt="" width="256" height="256" />
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
        <img src={assetPath("assets/icons/social/WhatsApp.webp")} alt="" width="256" height="256" />
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
