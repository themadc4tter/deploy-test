const STORAGE_KEY = "todoDashboardVisitorId";

function createVisitorId() {
  // crypto.randomUUID() creates a strong random ID in modern browsers.
  // The fallback keeps the app usable in older browsers that do not support it.
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateVisitorId() {
  // localStorage is browser storage that survives page refreshes.
  // It is useful here because our first version has no login system.
  const existingVisitorId = window.localStorage.getItem(STORAGE_KEY);

  if (existingVisitorId) {
    return existingVisitorId;
  }

  const newVisitorId = createVisitorId();
  window.localStorage.setItem(STORAGE_KEY, newVisitorId);

  return newVisitorId;
}
