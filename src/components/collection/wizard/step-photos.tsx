import { useState, useRef, useEffect } from "react";
import { compressPhoto, createPreviewUrl, MAX_PHOTOS } from "@/lib/photo-compression";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Image } from "lucide-react";
import type { StepProps } from "./types";

interface PhotoPreview { file: File; url: string; }

export function StepPhotos({ data, onChange }: StepProps) {
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newPreviews = data.photos.map((file) => ({ file, url: createPreviewUrl(file) }));
    setPreviews(newPreviews);
    return () => { newPreviews.forEach((p) => URL.revokeObjectURL(p.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - data.photos.length;
    if (remaining <= 0) return;
    const filesToAdd = Array.from(files).slice(0, remaining);
    setCompressing(true);
    try {
      const compressed = await Promise.all(filesToAdd.map((f) => compressPhoto(f)));
      const newPreviews = compressed.map((file) => ({ file, url: createPreviewUrl(file) }));
      setPreviews((prev) => [...prev, ...newPreviews]);
      onChange({ photos: [...data.photos, ...compressed] });
    } finally { setCompressing(false); }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onChange({ photos: data.photos.filter((_, i) => i !== index) });
  };

  const canAddMore = data.photos.length < MAX_PHOTOS;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">Photos</h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Prenez ou sélectionnez entre 1 et {MAX_PHOTOS} photos (sacs, échantillons, site de stockage).
      </p>

      {canAddMore && (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => cameraInputRef.current?.click()} disabled={compressing}>
            <Camera className="h-4 w-4 mr-1.5" /> Prendre une photo
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={compressing}>
            <Image className="h-4 w-4 mr-1.5" /> Galerie
          </Button>
          {compressing && <Spinner size="sm" />}
        </div>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative group">
              <img src={preview.url} alt={`Photo ${index + 1}`} className="w-full h-32 sm:h-40 object-cover rounded-lg border" />
              <button type="button"
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(index)}>&times;</button>
              <Badge variant="neutral" className="absolute bottom-1 left-1 text-[10px]">{Math.round(preview.file.size / 1024)} KB</Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Camera className="h-10 w-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Aucune photo ajoutée</p>
        </div>
      )}

      <p className="text-sm text-[hsl(var(--muted-foreground))] text-right">
        {data.photos.length} / {MAX_PHOTOS} photo{data.photos.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
