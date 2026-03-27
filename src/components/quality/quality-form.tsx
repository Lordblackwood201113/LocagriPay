import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface QualityFormProps {
  collectionId: string;
  existingScores?: { visualAspect: number; humidity: number; homogeneity: number; cleanliness: number; husking: number };
  onSuccess?: () => void;
}

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-lg font-bold">{value}/5</span>
      </div>
      <Slider min={1} max={5} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
      <div className="flex w-full justify-between px-1 text-xs text-[hsl(var(--muted-foreground))]">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  );
}

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

export function QualityForm({ collectionId, existingScores, onSuccess }: QualityFormProps) {
  const assessQuality = useMutation(api.mutations.quality.assess);
  const [visualAspect, setVisualAspect] = useState(existingScores?.visualAspect ?? 3);
  const [humidity, setHumidity] = useState(existingScores?.humidity ?? 14);
  const [homogeneity, setHomogeneity] = useState(existingScores?.homogeneity ?? 3);
  const [cleanliness, setCleanliness] = useState(existingScores?.cleanliness ?? 3);
  const [husking, setHusking] = useState(existingScores?.husking ?? 3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const globalScore = Math.round(((visualAspect + homogeneity + cleanliness + husking) / 4) * 100) / 100;

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await assessQuality({ collectionId: collectionId as any, visualAspect, humidity, homogeneity, cleanliness, husking });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'évaluation");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <RatingInput label="Aspect visuel" value={visualAspect} onChange={setVisualAspect} />
      <RatingInput label="Homogénéité" value={homogeneity} onChange={setHomogeneity} />
      <RatingInput label="Propreté" value={cleanliness} onChange={setCleanliness} />
      <RatingInput label="Décorticage" value={husking} onChange={setHusking} />

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Humidité (%)</Label>
          <span className={`text-lg font-bold ${getHumidityColor(humidity)}`}>{humidity}%</span>
        </div>
        <Slider min={0} max={30} step={0.5} value={[humidity]} onValueChange={([v]) => setHumidity(v)} />
        <div className="flex w-full justify-between px-1 text-xs text-[hsl(var(--muted-foreground))]">
          <span>0%</span><span>14%</span><span>17%</span><span>30%</span>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {humidity <= 14 ? "Optimal" : humidity <= 17 ? "Acceptable" : "Trop élevée"}
        </p>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Score global</span>
        <span className={`text-3xl font-bold ${getScoreColor(globalScore)}`}>{globalScore}/5</span>
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading && <Spinner size="sm" />}
        {existingScores ? "Mettre à jour l'évaluation" : "Enregistrer l'évaluation"}
      </Button>
    </div>
  );
}
