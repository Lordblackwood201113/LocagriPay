import { useOnlineStatus, useSyncQueueCount } from "@/lib/offline/use-offline";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const syncCount = useSyncQueueCount();

  if (isOnline && syncCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {!isOnline && (
        <Alert variant="warning" className="shadow-lg py-2 px-4">
          <AlertDescription>Hors ligne</AlertDescription>
        </Alert>
      )}
      {syncCount > 0 && (
        <Alert variant="info" className="shadow-lg py-2 px-4">
          <AlertDescription>
            {syncCount} collecte{syncCount > 1 ? "s" : ""} en attente de sync
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
