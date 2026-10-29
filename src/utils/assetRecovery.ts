const recoveryKey = "nolan:asset-recovery";
const recoveryParam = "__asset_retry";
const recoveryWindow = 60_000;

export function isAssetLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk .+ failed/i.test(message);
}

export function recoverAssetLoad(error: unknown): boolean {
  if (!isAssetLoadError(error) || !navigator.onLine) return false;
  const url = new URL(window.location.href);
  try {
    const lastAttempt = Number(sessionStorage.getItem(recoveryKey) || url.searchParams.get(recoveryParam));
    if (lastAttempt && Date.now() - lastAttempt < recoveryWindow) return false;
    sessionStorage.setItem(recoveryKey, String(Date.now()));
  } catch {
    // Without storage, keep the URL marker to prevent a reload loop.
    if (url.searchParams.has(recoveryParam)) return false;
  }
  url.searchParams.set(recoveryParam, String(Date.now()));
  window.location.replace(url.href);
  return true;
}

export async function loadPageWithRecovery<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (recoverAssetLoad(error)) return new Promise<T>(() => {});
    throw error;
  }
}
