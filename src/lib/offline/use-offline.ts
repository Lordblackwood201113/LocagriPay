import { useState, useEffect } from "react";
import { isOnline, onNetworkChange } from "./network-monitor";
import { getSyncQueueCount } from "./db";

export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    return onNetworkChange(setOnline);
  }, []);

  return online;
}

export function useSyncQueueCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      getSyncQueueCount().then(setCount).catch(() => setCount(0));
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  return count;
}
