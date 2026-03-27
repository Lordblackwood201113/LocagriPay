import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { StepProps } from "./types";

function getScoreColor(score: number): string {
  if (score >= 4) return "text-[hsl(var(--success))]";
  if (score >= 3) return "text-[hsl(var(--info))]";
  if (score >= 2) return "text-[hsl(var(--warning))]";
  return "text-[hsl(var(--destructive))]";
}

function getHumidityColor(h: number): string {
  if (h <= 14) return "text-[hsl(var(--success))]";
  if (h <= 17) return "text-[hsl(var(--warning))]";
  return "text-[hsl(var(--destructive))]";
}

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className={`text-lg font-bold ${getScoreColor(value)}`}>{value}/5</span>
      </div>
      <Slider min={1} max={5} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
      <div className="flex w-full justify-between px-1 text-xs text-[hsl(var(--muted-foreground))]">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  );
}

export function StepQuality({ data, onChange }: StepProps) {
  const globalScore = Math.round(((data.visualAspect + data.homogeneity + data.cleanliness + data.husking) / 4) * 100) / 100;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">Analyse qualité</h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Évaluez la qualité du riz échantillonné sur les critères suivants.
      </p>

      <RatingInput label="Aspect visuel" value={data.visualAspect} onChange={(v) => onChange({ visualAspect: v })} />
      <RatingInput label="Homogénéité" value={data.homogeneity} onChange={(v) => onChange({ homogeneity: v })} />
      <RatingInput label="Propreté" value={data.cleanliness} onChange={(v) => onChange({ cleanliness: v })} />
      <RatingInput label="Décorticage" value={data.husking} onChange={(v) => onChange({ husking: v })} />

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Humidité (%)</Label>
          <span className={`text-lg font-bold ${getHumidityColor(data.humidity)}`}>{data.humidity}%</span>
        </div>
        <Slider min={0} max={30} step={0.5} value={[data.humidity]} onValueChange={([v]) => onChange({ humidity: v })} />
        <div className="flex w-full justify-between px-1 text-xs text-[hsl(var(--muted-foreground))]">
          <span>0%</span><span>14%</span><span>17%</span><span>30%</span>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {data.humidity <= 14 ? "Optimal" : data.humidity <= 17 ? "Acceptable" : "Trop élevée"}
        </p>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-base sm:text-lg font-semibold">Score global</span>
        <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(globalScore)}`}>{globalScore}/5</span>
      </div>
    </div>
  );
}
