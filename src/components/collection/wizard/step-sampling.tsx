import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import type { StepProps } from "./types";

export function StepSampling({ data, onChange }: StepProps) {
  const bagsInStock = typeof data.bagsInStock === "number" ? data.bagsInStock : 0;
  const bagsSampled = typeof data.bagsSampled === "number" ? data.bagsSampled : 0;
  const showSampledWarning = bagsSampled > bagsInStock && bagsInStock > 0;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">Échantillonnage</h3>

      <div className="space-y-2">
        <Label>Nombre de sacs en stock *</Label>
        <Input type="number" value={data.bagsInStock} onChange={(e) => onChange({ bagsInStock: e.target.value ? Number(e.target.value) : "" })} min={1} placeholder="Ex: 50" />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Nombre total de sacs observés chez le fournisseur</p>
      </div>

      <div className="space-y-2">
        <Label>Estimation du stock (KG) *</Label>
        <Input type="number" value={data.estimatedStockKg} onChange={(e) => onChange({ estimatedStockKg: e.target.value ? Number(e.target.value) : "" })} min={1} placeholder="Ex: 2500" />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Poids total estimé en kilogrammes</p>
      </div>

      <div className="space-y-2">
        <Label>Nombre de sacs échantillonnés *</Label>
        <Input
          type="number"
          className={cn(showSampledWarning && "border-[hsl(var(--destructive))]")}
          value={data.bagsSampled}
          onChange={(e) => onChange({ bagsSampled: e.target.value ? Number(e.target.value) : "" })}
          min={1} placeholder="Ex: 5"
        />
        {showSampledWarning ? (
          <p className="text-xs text-[hsl(var(--destructive))]">Ne peut pas dépasser le nombre de sacs en stock ({bagsInStock})</p>
        ) : (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Nombre de sacs prélevés pour analyse qualité</p>
        )}
      </div>

      {typeof data.bagsInStock === "number" && typeof data.estimatedStockKg === "number" && data.bagsInStock > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard title="Poids moyen/sac" value={`${Math.round(data.estimatedStockKg / data.bagsInStock)} kg`} />
          <StatCard title="Sacs en stock" value={data.bagsInStock} />
          <StatCard title="Stock estimé" value={`${data.estimatedStockKg.toLocaleString("fr-FR")} kg`} />
        </div>
      )}
    </div>
  );
}
