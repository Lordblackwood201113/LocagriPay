import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

type Decision = "accepte" | "refuse" | "negocie";

interface DecisionFormProps { collectionId: string; qualityAssessmentId: string; }

export function DecisionForm({ collectionId, qualityAssessmentId }: DecisionFormProps) {
  const createDecision = useMutation(api.mutations.decisions.create);
  const navigate = useNavigate();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [pricePerKg, setPricePerKg] = useState("");
  const [finalWeightKg, setFinalWeightKg] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = decision === "accepte" && pricePerKg && finalWeightKg ? Number(pricePerKg) * Number(finalWeightKg) : 0;

  const handleSubmit = async () => {
    if (!decision) { setError("Veuillez choisir une décision"); return; }
    setLoading(true); setError("");
    try {
      await createDecision({
        collectionId: collectionId as any, qualityAssessmentId: qualityAssessmentId as any, decision,
        pricePerKg: decision === "accepte" ? Number(pricePerKg) : undefined,
        finalWeightKg: decision === "accepte" ? Number(finalWeightKg) : undefined,
        comment: comment.trim() || undefined,
      });
      navigate("/validation");
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="flex flex-wrap gap-3">
        <Button variant={decision === "accepte" ? "success" : "outline"} className="flex-1" onClick={() => setDecision("accepte")} disabled={loading}>Accepter</Button>
        <Button variant={decision === "negocie" ? "warning" : "outline"} className="flex-1" onClick={() => setDecision("negocie")} disabled={loading}>Négocier</Button>
        <Button variant={decision === "refuse" ? "destructive" : "outline"} className="flex-1" onClick={() => setDecision("refuse")} disabled={loading}>Refuser</Button>
      </div>

      {decision === "accepte" && (
        <div className="rounded-lg border bg-[hsl(var(--success))]/10 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prix négocié (FCFA/KG) *</Label>
              <Input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="Ex: 250" min={1} />
            </div>
            <div className="space-y-2">
              <Label>Poids final à enlever (KG) *</Label>
              <Input type="number" value={finalWeightKg} onChange={(e) => setFinalWeightKg(e.target.value)} placeholder="Ex: 2000" min={1} />
            </div>
          </div>
          {totalAmount > 0 && <Alert variant="success"><AlertDescription className="text-lg font-bold">Montant total : {formatCurrency(totalAmount)}</AlertDescription></Alert>}
        </div>
      )}

      {(decision === "refuse" || decision === "negocie") && (
        <div className={`rounded-lg border p-4 ${decision === "refuse" ? "bg-[hsl(var(--destructive))]/10" : "bg-[hsl(var(--warning))]/10"}`}>
          <div className="space-y-2">
            <Label>{decision === "refuse" ? "Motif du refus *" : "Commentaire de négociation *"}</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={decision === "refuse" ? "Expliquez la raison du refus..." : "Indiquez les conditions de négociation..."} rows={3} />
          </div>
        </div>
      )}

      {decision === "accepte" && (
        <div className="space-y-2">
          <Label>Commentaire (optionnel)</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Remarques supplémentaires..." rows={2} />
        </div>
      )}

      {decision && (
        <Button className="w-full" variant={decision === "accepte" ? "success" : decision === "refuse" ? "destructive" : "warning"} onClick={handleSubmit} disabled={loading}>
          {loading && <Spinner size="sm" />}
          {decision === "accepte" && "Confirmer l'acceptation"}
          {decision === "refuse" && "Confirmer le refus"}
          {decision === "negocie" && "Envoyer en négociation"}
        </Button>
      )}
    </div>
  );
}
