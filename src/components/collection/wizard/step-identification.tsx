import { useEffect } from "react";
import { SupplierPicker } from "@/components/supplier/supplier-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { StepProps } from "./types";

export function StepIdentification({ data, onChange }: StepProps) {
  useEffect(() => {
    if (data.gpsStatus !== "idle") return;
    if (!navigator.geolocation) { onChange({ gpsStatus: "error" }); return; }
    onChange({ gpsStatus: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ gpsLat: position.coords.latitude, gpsLng: position.coords.longitude, gpsStatus: "success" });
      },
      () => { onChange({ gpsStatus: "error" }); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">Identification</h3>

      <div className="space-y-2">
        <Label>Date de collecte *</Label>
        <Input type="date" value={data.date} onChange={(e) => onChange({ date: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <Label>Fournisseur *</Label>
        <SupplierPicker value={data.supplier} onChange={(supplier) => onChange({ supplier })} />
      </div>

      <div className="space-y-2">
        <Label>Localisation / Site</Label>
        <Input value={data.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="Ex: Kaolack, Champ Nord" />
      </div>

      <div className="flex items-center gap-2 text-sm">
        {data.gpsStatus === "loading" && (
          <><Spinner size="xs" /><span className="text-[hsl(var(--muted-foreground))]">Capture GPS en cours...</span></>
        )}
        {data.gpsStatus === "success" && data.gpsLat && data.gpsLng && (
          <><Badge variant="success" className="h-2 w-2 p-0 rounded-full" /><span className="text-[hsl(var(--success))]">GPS : {data.gpsLat.toFixed(5)}, {data.gpsLng.toFixed(5)}</span></>
        )}
        {data.gpsStatus === "error" && (
          <><Badge variant="warning" className="h-2 w-2 p-0 rounded-full" /><span className="text-[hsl(var(--muted-foreground))]">GPS indisponible — la localisation manuelle suffit</span></>
        )}
      </div>
    </div>
  );
}
