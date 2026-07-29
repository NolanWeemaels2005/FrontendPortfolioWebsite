import { useEffect, useId } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { assetPath } from "../utils/asset";

type KaaiModalProps = {
  open: boolean;
  onClose: () => void;
};

export function KaaiModal({ open, onClose }: KaaiModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("kaai-modal-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("kaai-modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="kaai-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="kaai-modal__backdrop"
        aria-label="Sluiten"
        onClick={onClose}
      />

      <div className="kaai-modal__panel" role="document">
        <button
          type="button"
          className="kaai-modal__close"
          aria-label="Sluiten"
          onClick={onClose}
        >
          <X className="kaai-modal__close-icon" aria-hidden="true" size={22} strokeWidth={4} />
          <span>Close</span>
        </button>

        <div className="kaai-modal__left">
          <img className="kaai-modal__logo" src={assetPath("assets/kaai/logoKaai.webp")} alt="Kaai" />

          <h2 className="kaai-modal__headline" id={titleId}>
            Meer nodig dan wat
            <br />
            ik je kan bieden?
          </h2>
          <p className="kaai-modal__copy">
            Ik ben onderdeel van Kaai. Samen zijn we goed uitgerust om elk project van A tot Z te realiseren.
          </p>

        </div>

        <div className="kaai-modal__right">
          <div
            className="kaai-modal__right-inner"
            style={
              {
                "--kaai-bg": `url(${assetPath("assets/kaai/background.webp")})`,
              } as CSSProperties
            }
          >
            <h3 className="kaai-modal__right-title">We got you.</h3>
            <p className="kaai-modal__right-sub">
              Samen bieden we een volledig pakket
              <br />
              aan creatieve en technische diensten:
            </p>

            <div className="kaai-modal__services" aria-label="Diensten">
              <div className="kaai-modal__service">
                <img src={assetPath("assets/kaai/code_xml_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
                <span>
                  Full Stack
                  <br />
                  Development
                </span>
              </div>
              <div className="kaai-modal__service">
                <img src={assetPath("assets/kaai/design_services_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
                <span>
                  Graphic
                  <br />
                  Design
                </span>
              </div>
              <div className="kaai-modal__service">
                <img src={assetPath("assets/kaai/motion_blur_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
                <span>
                  Motion
                  <br />
                  Graphics
                </span>
              </div>
              <div className="kaai-modal__service">
                <img src={assetPath("assets/kaai/camera_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
                <span>
                  Photo en
                  <br />
                  Video
                </span>
              </div>
              <div className="kaai-modal__service">
                <img src={assetPath("assets/kaai/visibility_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
                <span>
                  Live
                  <br />
                  Visuals
                </span>
              </div>
              <div className="kaai-modal__service">
                <img src={assetPath("assets/kaai/deployed_code_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
                <span>
                  Fysieke
                  <br />
                  Installaties
                </span>
              </div>
            </div>

            <a
              href="https://www.instagram.com/kaaipunt/"
              target="_blank"
              rel="noopener noreferrer"
              className="kaai-modal__cta"
            >
              <span>Samen maken we impact.</span>
              <img src={assetPath("assets/kaai/arrow_forward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.webp")} alt="" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
