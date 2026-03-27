type NetworkCallback = (isOnline: boolean) => void;

const listeners = new Set<NetworkCallback>();
let currentStatus = typeof navigator !== "undefined" ? navigator.onLine : true;

function notifyAll() {
  const isOnline = navigator.onLine;
  if (isOnline !== currentStatus) {
    currentStatus = isOnline;
    listeners.forEach((cb) => cb(isOnline));
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", notifyAll);
  window.addEventListener("offline", notifyAll);
}

export function isOnline(): boolean {
  return currentStatus;
}

export function onNetworkChange(callback: NetworkCallback): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
