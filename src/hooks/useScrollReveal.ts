import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const revealElements = () => {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
          element.classList.add("is-revealed");
        });
      };

      revealElements();
      const mutationObserver = new MutationObserver(revealElements);
      mutationObserver.observe(document.body, { childList: true, subtree: true });

      return () => mutationObserver.disconnect();
    }

    const observedElements = new Set<HTMLElement>();

    const observeRevealElements = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        if (element.classList.contains("is-revealed") || observedElements.has(element)) return;

        observedElements.add(element);
        observer.observe(element);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          element.classList.add("is-revealed");
          observedElements.delete(element);
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    observeRevealElements();

    const mutationObserver = new MutationObserver(observeRevealElements);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      observedElements.clear();
    };
  }, []);
}
