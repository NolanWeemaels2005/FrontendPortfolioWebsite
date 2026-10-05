import { useCallback, useEffect, useRef } from "react";
import { useBeforeUnload, useBlocker, type BlockerFunction } from "react-router-dom";

export function useUnsavedBlog(unsaved: boolean) {
  const blocker = useBlocker(useCallback<BlockerFunction>(({ currentLocation, nextLocation }) => unsaved && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search), [unsaved]));
  const confirmedKey = useRef("");
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (!unsaved) return;
    event.preventDefault(); event.returnValue = "";
  }, [unsaved]));
  useEffect(() => {
    if (blocker.state !== "blocked") { confirmedKey.current = ""; return; }
    if (confirmedKey.current === blocker.location.key) return;
    confirmedKey.current = blocker.location.key;
    if (window.confirm("Je hebt niet-opgeslagen wijzigingen of bestanden in de uploadlijst. Toch weggaan? Geslaagde uploads blijven bewaard, maar openstaande tekst en bestanden gaan verloren.")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
}
