import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera } from "lucide-react";

interface PhotoGalleryProps { storageIds: string[]; }

function PhotoThumbnail({ storageId, index, onClick }: { storageId: string; index: number; onClick: () => void }) {
  const url = useQuery(api.queries.photos.getUrl, { storageId });
  return (
    <button type="button" className="relative overflow-hidden rounded-lg border cursor-pointer hover:ring-2 hover:ring-[hsl(var(--primary))] transition-all" onClick={onClick}>
      {url ? (
        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-32 sm:h-40 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-32 sm:h-40 flex items-center justify-center bg-[hsl(var(--muted))]"><Spinner size="sm" /></div>
      )}
      <Badge variant="neutral" className="absolute bottom-1 left-1 text-[10px]">{index + 1}</Badge>
    </button>
  );
}

export function PhotoGallery({ storageIds }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (storageIds.length === 0) {
    return (<div className="text-center py-8 text-[hsl(var(--muted-foreground))]"><Camera className="h-10 w-10 mx-auto mb-2" /><p className="text-sm">Aucune photo</p></div>);
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {storageIds.map((id, index) => (<PhotoThumbnail key={id} storageId={id} index={index} onClick={() => setSelectedIndex(index)} />))}
      </div>
      {selectedIndex !== null && (
        <FullscreenViewer storageIds={storageIds} currentIndex={selectedIndex} onClose={() => setSelectedIndex(null)} onNavigate={setSelectedIndex} />
      )}
    </>
  );
}

function FullscreenViewer({ storageIds, currentIndex, onClose, onNavigate }: { storageIds: string[]; currentIndex: number; onClose: () => void; onNavigate: (index: number) => void }) {
  const url = useQuery(api.queries.photos.getUrl, { storageId: storageIds[currentIndex] });
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < storageIds.length - 1;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-2 bg-[hsl(var(--sn-neutral))]">
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          {url ? (
            <img src={url} alt={`Photo ${currentIndex + 1}`} className="max-w-full max-h-[70vh] object-contain rounded" />
          ) : (
            <Spinner size="lg" className="text-[hsl(var(--sn-neutral-foreground))]" />
          )}
        </div>
        <div className="flex items-center justify-between mt-2 px-2">
          <Button variant="ghost" size="sm" className="text-[hsl(var(--sn-neutral-foreground))]" onClick={() => onNavigate(currentIndex - 1)} disabled={!canPrev}>&larr; Précédente</Button>
          <span className="text-[hsl(var(--sn-neutral-foreground))] text-sm">{currentIndex + 1} / {storageIds.length}</span>
          <Button variant="ghost" size="sm" className="text-[hsl(var(--sn-neutral-foreground))]" onClick={() => onNavigate(currentIndex + 1)} disabled={!canNext}>Suivante &rarr;</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
